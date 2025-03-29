'use server';

import { addSessionImage } from "../../../utils/sessionService";

export async function uploadImage(formData: FormData, sessionId: number) {
  
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  // Convert file to base64 for storage
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64String = buffer.toString('base64');
  const dataUrl = `data:${file.type};base64,${base64String}`;

  // Add image to session
  await addSessionImage(sessionId, dataUrl);

  return { success: true };
}