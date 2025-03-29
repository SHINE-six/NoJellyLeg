'use server';
import { addSessionImage } from "../../../utils/sessionService";
import sharp from 'sharp';

// Maximum dimensions for images
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
// Maximum file size in bytes (3MB)
const MAX_FILE_SIZE = 3 * 1024 * 1024;

async function resizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    // Use sharp to resize the image while maintaining aspect ratio
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Only resize if the image is larger than our max dimensions
    if ((metadata.width && metadata.width > MAX_WIDTH) || 
        (metadata.height && metadata.height > MAX_HEIGHT)) {
      
      return await image
        .resize({
          width: MAX_WIDTH,
          height: MAX_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer();
    }
    
    // If image is already within our dimensions, use it as is
    return buffer;
  } catch (error) {
    console.error('Error resizing image:', error);
    // Return original buffer if resize fails
    return buffer;
  }
}

export async function uploadImage(formData: FormData, sessionId: number) {
  try {
    // Parse the sessionId to ensure it's a number
    const parsedSessionId = Number(sessionId);
    if (isNaN(parsedSessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }
    
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return { success: false, error: 'No valid file uploaded' };
    }

    // Size validation (10MB limit for input file)
    const INPUT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > INPUT_MAX_SIZE) {
      return { success: false, error: `File exceeds 10MB limit` };
    }

    try {
      // Get the file type from FormData
      let fileType = formData.get('fileType') as string;
      
      // If fileType wasn't provided or is invalid, try getting it from the file
      if (!fileType) {
        fileType = file.type;
        
        if (!fileType || fileType === '') {
          // Default to JPEG for safety
          fileType = 'image/jpeg';
        }
      }
      
      // Ensure we normalize JPEG types
      if (fileType.includes('jpg') || fileType.includes('jpeg')) {
        fileType = 'image/jpeg';
      }
      
      // Process the image
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          return { success: false, error: 'File data is empty' };
        }
        
        let buffer = Buffer.from(arrayBuffer);
        
        // Resize the image to reduce its size
        buffer = await resizeImage(buffer);
        
        // Check if the resized image is still too large for the database
        if (buffer.length > MAX_FILE_SIZE) {
          // Apply additional compression for JPEG images
          if (fileType === 'image/jpeg') {
            const compressedBuffer = await sharp(buffer)
              .jpeg({ quality: 70 }) // Adjust quality to reduce size
              .toBuffer();
            
            if (compressedBuffer.length <= MAX_FILE_SIZE) {
              buffer = compressedBuffer;
            } else {
              // If still too large, try more aggressive compression
              buffer = await sharp(buffer)
                .jpeg({ quality: 50 })
                .toBuffer();
            }
          } else if (fileType === 'image/png') {
            // Convert PNG to JPEG for better compression
            buffer = await sharp(buffer)
              .jpeg({ quality: 70 })
              .toBuffer();
            fileType = 'image/jpeg';
          }
          
          // Final check if image is still too large
          if (buffer.length > MAX_FILE_SIZE) {
            return { 
              success: false, 
              error: `Image still too large after compression (${Math.round(buffer.length / 1024)}KB). Please use a smaller image.` 
            };
          }
        }
        
        const base64String = buffer.toString('base64');
        
        // Create data URL with appropriate MIME type
        const dataUrl = `data:${fileType};base64,${base64String}`;
        
        // Add image to session
        try {
          await addSessionImage(parsedSessionId, dataUrl);
          return { success: true };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (sessionError: any) {
          console.error('Session service error:', sessionError);
          
          // Check if we're facing a "blob too big" error
          if (sessionError.message && sessionError.message.includes('blob too big')) {
            return { 
              success: false, 
              error: 'Image is too large for storage. Please use a smaller image or reduce its quality.' 
            };
          }
          
          return { 
            success: false, 
            error: 'Failed to add image to session: ' + (sessionError.message || 'Unknown error') 
          };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (encodeError: any) {
        console.error('File encoding error:', encodeError);
        return { success: false, error: 'Failed to process file data: ' + (encodeError.message || 'Unknown error') };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (processingError: any) {
      console.error('Image processing error:', processingError);
      return { success: false, error: 'Failed to process image: ' + (processingError.message || 'Unknown error') };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Upload image error:', error);
    return { success: false, error: 'Server action failed: ' + (error.message || 'Unknown error') };
  }
}