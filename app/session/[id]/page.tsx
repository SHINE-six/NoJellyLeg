'use client';

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import MediaDisplay, { isVideoSource } from "../../../components/MediaDisplay";
import { getSessionById } from "../../../utils/sessionService";

interface Session {
  id: number;
  name: string;
  location: string;
  cover_image: string | null;
  map: string | null;
  people: string | null;
  date: string | null;
  session_media_s3?: string[] | null;
  content_medias?: string[];
  media_count?: number;
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

        // Use the content_medias array that's already available from getSessionById
        if (sessionData.content_medias && Array.isArray(sessionData.content_medias)) {
          setContentImages(sessionData.content_medias);
        } else if (sessionData.session_media_s3) {
          // As a fallback, check if session_media_s3 is available
          try {
            const mediaArray = typeof sessionData.session_media_s3 === 'string'
              ? JSON.parse(sessionData.session_media_s3)
              : sessionData.session_media_s3;
              
            if (Array.isArray(mediaArray)) {
              setContentImages(mediaArray);
            } else {
              setContentImages([]);
            }
          } catch (err) {
            console.error("Error processing session media:", err);
            setContentImages([]);
          }
        } else {
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
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to all sessions
          </Link>
          {/* Social Media Links */}
          <div className="flex space-x-4">
            <a href="https://instagram.com/go4ride_" target="_blank" rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 transition-colors"
              aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://facebook.com/go4ride" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
              aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="https://strava.com/clubs/go4ride" target="_blank" rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 transition-colors"
              aria-label="Strava">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            </a>
          </div>
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

        {/* Cover image or video */}
        {session.cover_image && (
          <div className="relative w-full mb-10 rounded-lg overflow-hidden shadow-lg aspect-[16/9]">
            <MediaDisplay
              src={String(session.cover_image)}
              alt={String(session.name)}
              layout="fill"
              objectFit="contain"
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1280px"
            />
          </div>
        )}

        {/* Map embed */}
        {session.map && (
          <div className="w-full mb-10 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Route Map</h2>
              <div 
          dangerouslySetInnerHTML={{ __html: session.map }} 
          className="w-full" 
          style={{ 
            height: "400px", 
            width: "100%" 
          }}
              />
              <style jsx global>{`
          .w-full iframe {
            width: 100% !important;
            height: 100% !important;
          }
              `}</style>
            </div>
          </div>
        )}

        {/* Content media (images and videos) */}
        {contentImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentImages.map((mediaUrl: string, index: number) => {
              const isVideo = isVideoSource(mediaUrl);
              return (
                <div key={index} className={`${isVideo ? 'aspect-video' : 'aspect-square'} relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300`}>
                  <MediaDisplay
                    src={mediaUrl}
                    alt={`${isVideo ? 'Video' : 'Photo'} ${index + 1} from ${session.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400">No media available</p>
          </div>
        )}

      </div>
    </div>
  );
}