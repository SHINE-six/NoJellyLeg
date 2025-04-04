'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllSessions } from "../utils/sessionService";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsData = await getAllSessions();
        setSessions(sessionsData);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="relative mb-16">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 w-full absolute -top-2 rounded-full shadow-md"></div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-3 pb-2">
                Cycling Sessions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Browse all cycling sessions and view photos from each one.
              </p>
            </div>
            
            <div className="flex justify-center md:justify-end space-x-5">
              <a href="https://instagram.com/go4ride_" target="_blank" rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 hover:scale-110 transition-all"
                aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              
              <a href="https://facebook.com/go4ride" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:scale-110 transition-all"
                aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              
              <a href="https://strava.com/clubs/go4ride" target="_blank" rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 hover:scale-110 transition-all"
                aria-label="Strava">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-800 dark:text-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{sessions.length} cycling adventures and counting</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400">No sessions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sessions.map((session) => (
              <Link 
                href={`/session/${session.id}`} 
                key={String(session.id)}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-64 w-full">
                    {session.cover_image ? (
                      <Image
                        src={String(session.cover_image)}
                        alt={String(session.name)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {String(session.name)}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {String(session.location)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(String(session.date)).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {String(session.image_count)} photos
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
