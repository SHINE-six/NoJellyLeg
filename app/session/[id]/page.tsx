'use client';

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSessionById } from "../../../utils/sessionService";
// import ImageUpload from "./ImageUpload";

interface Session {
  id: number;
  name: string;
  location: string;
  cover_image: string | null;
  people: string | null;
  date: string | null;
  content_images: string;
}

export default function SessionPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const sessionId = parseInt(id);
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentImages, setContentImages] = useState<string[]>([]);
  
  useEffect(() => {
    if (isNaN(sessionId)) {
      notFound();
      return;
    }

    async function fetchSessionData() {
      try {
        setIsLoading(true);
        const sessionData = await getSessionById(sessionId) as Session | null;
        
        if (!sessionData) {
          notFound();
          return;
        }
        
        setSession(sessionData);
        
        // Parse content images from JSON string
        try {
          const images = JSON.parse(String(sessionData.content_images) || '[]');
          setContentImages(images);
        } catch (err) {
          console.error("Error parsing content images:", err);
          setContentImages([]);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load session. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchSessionData();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Link 
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This shouldn't happen, but just as a fallback
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to all sessions
          </Link>
        </div>

        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {String(session.name)}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {String(session.location)}
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 10-2 0v1H7V3a1 1 00-1-1zm0 5a1 1 000 2h8a1 1 100-2H6z" clipRule="evenodd" />
              </svg>
              {session.date ? new Date(String(session.date)).toLocaleDateString() : 'No date'}
            </div>
            {session.people && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                {String(session.people)}
              </div>
            )}
          </div>
        </header>

        {/* Cover image */}
        {session.cover_image && (
            <div className="relative w-full mb-10 rounded-lg overflow-hidden shadow-lg aspect-[16/9]">
            <Image
              src={String(session.cover_image)}
              alt={String(session.name)}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1280px"
            />
            </div>
        )}

        {/* Content images */}
        {contentImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentImages.map((imageUrl: string, index: number) => (
              <div key={index} className="aspect-square relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={imageUrl}
                  alt={`Photo ${index + 1} from ${session.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400">No photos available</p>
          </div>
        )}

        {/* Image upload section */}
        {/* <div className="mt-8">
          <ImageUpload sessionId={sessionId} />
        </div> */}
      </div>
    </div>
  );
}