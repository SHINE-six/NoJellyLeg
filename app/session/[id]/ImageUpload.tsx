// 'use client';

// import { useState, useRef } from 'react';
// import { uploadImage } from './actions';

// export default function ImageUpload({ sessionId }: { sessionId: number }) {
//   const [isDragging, setIsDragging] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({});
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files?.length) {
//       await uploadFiles(files);
//     }
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = async (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = e.dataTransfer.files;
//     if (files?.length) {
//       await uploadFiles(files);
//     }
//   };

//   const validateFile = (file: File): boolean => {
//     // Check file size (10MB limit)
//     if (file.size > 10 * 1024 * 1024) {
//       setError(`File ${file.name} exceeds 10MB limit`);
//       return false;
//     }
    
//     // Check file type
//     const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/heif'];
//     if (!acceptedTypes.includes(file.type) && !file.type.startsWith('image/')) {
//       setError(`File ${file.name} is not a supported image type`);
//       return false;
//     }
    
//     return true;
//   };

//   const uploadFiles = async (files: FileList) => {
//     setIsUploading(true);
//     setError(null);
    
//     try {
//       for (const file of Array.from(files)) {
//         try {
//           // Display the file type for debugging
//           console.log(`File: ${file.name}, Type: ${file.type}, Size: ${Math.round(file.size / 1024)}KB`);
//           setUploadProgress(prev => ({...prev, [file.name]: `Processing (${Math.round(file.size / 1024)}KB)...`}));
          
//           // Basic validation
//           if (file.size > 10 * 1024 * 1024) {
//             setUploadProgress(prev => ({...prev, [file.name]: 'Failed: File too large (>10MB)'}));
//             continue;
//           }

//           if (!validateFile(file)) {
//             continue;
//           }

//           // Handle iPhone HEIC/HEIF images by changing the type to JPEG
//           let fileToUpload = file;
//           if (file.type === 'image/heic' || file.type === 'image/heif') {
//             // Create a new file with modified type
//             // Since we can't convert HEIC directly in browser, we'll let server handle it
//             // but we'll give it a proper MIME type hint
//             const newFile = new File([file], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
//               type: 'image/jpeg',
//             });
//             fileToUpload = newFile;
//           }

//           const formData = new FormData();
//           formData.append('file', fileToUpload);

//           // Using a try-catch block specifically for the server action
//           try {
//             const result = await uploadImage(formData, sessionId);
            
//             if (result.success) {
//               setUploadProgress(prev => ({...prev, [file.name]: 'Success!'}));
//             } else {
//               setUploadProgress(prev => ({...prev, [file.name]: `Failed: ${result.error || 'Upload failed'}`}));
//             }
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           } catch (uploadError: any) {
//             console.error('Upload failed:', uploadError);
//             setUploadProgress(prev => ({...prev, [file.name]: `Failed: ${uploadError.message || 'Upload failed'}`}));
//           }
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         } catch (fileError: any) {
//           console.error('File processing failed:', fileError);
//           setUploadProgress(prev => ({...prev, [file.name]: `Failed: ${fileError.message || 'Processing failed'}`}));
//         }
//       }
//       // Refresh the page to show new images
//       window.location.reload();
//     } catch (error) {
//       console.error('Upload failed:', error);
//       setError(`Failed to upload image(s). Please try again. ${error}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div
//       className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
//         ${isDragging 
//           ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
//           : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500'
//         }`}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//       onClick={() => fileInputRef.current?.click()}
//     >
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         className="hidden"
//         accept="image/jpeg,image/jpg,image/png,image/gif,image/heic,image/heif,image/*"
//         multiple
//       />
      
//       <div className="flex flex-col items-center justify-center space-y-3">
//         <svg
//           className={`w-12 h-12 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`}
//           stroke="currentColor"
//           fill="none"
//           viewBox="0 0 48 48"
//           aria-hidden="true"
//         >
//           <path
//             d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//             strokeWidth={2}
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
        
//         <div className="text-gray-700 dark:text-gray-300">
//           {isUploading ? (
//             <div className="space-y-2">
//               <p>Uploading...</p>
//               {Object.entries(uploadProgress).length > 0 && (
//                 <div className="text-sm space-y-1 max-h-48 overflow-y-auto">
//                   {Object.entries(uploadProgress).map(([fileName, status]) => (
//                     <p key={fileName} className={`text-xs ${status.includes('Failed') ? 'text-red-500' : status === 'Success!' ? 'text-green-500' : 'text-gray-500'}`}>
//                       {fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName}: {status}
//                     </p>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               <p className="text-base">
//                 {isDragging ? 'Drop images here' : 'Click or drag images to upload'}
//               </p>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 JPEG, PNG, GIF up to 10MB
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Large images will be automatically resized
//               </p>
//               {error && (
//                 <p className="text-sm text-red-500 mt-2">{error}</p>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }