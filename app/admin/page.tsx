'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { createSession, getAllSessions, updateSession, getSessionById } from '../../utils/sessionService';
import MediaDisplay from '../../components/MediaDisplay';

// Define Session type that matches the service's structure
interface Session {
  id: number;
  name: string;
  location: string;
  cover_image: string | null;  // Updated to allow null
  map: string | null;
  people: string;
  date: string;
  media_count?: number;
  content_medias?: string[];
}

// Hardcoded credentials
const ADMIN_USERNAME = "ADMIN";
const ADMIN_PASSWORD = "ADMIN";

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('');
  const [date, setDate] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [map, setMap] = useState<string>('');
  const [contentMedias, setContentMedias] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Session state for adding photos to existing sessions
  const [existingSessions, setExistingSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [addingToExisting, setAddingToExisting] = useState(false);
  const [newContentMedias, setNewContentMedias] = useState<string[]>([]);
  
  // Refs for file inputs
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const contentMediasInputRef = useRef<HTMLInputElement>(null);
  const newContentMediasInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch all sessions
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);
  
  const fetchSessions = async () => {
    try {
      const sessions = await getAllSessions();
      setExistingSessions(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };
  
  // Load session data when selected
  const handleSessionSelect = async (id: number) => {
    try {
      const session = await getSessionById(id);
      if (session) {
        setSelectedSession(session);
        setNewContentMedias([]);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };
  
  // Authentication handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };
  
  // Handle media file reading
  const handleFileRead = (file: File, isCover: boolean, isNewContent: boolean = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isCover) {
        setCoverImage(result);
      } else if (isNewContent) {
        setNewContentMedias(prev => [...prev, result]);
      } else {
        setContentMedias(prev => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Cover media upload handler
  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileRead(files[0], true);
    }
  };
  
  // Content medias upload handler
  const handleContentMediasChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      Array.from(files).forEach(file => {
        handleFileRead(file, false);
      });
    }
  };
  
  // New content medias upload handler for existing sessions
  const handleNewContentMediasChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      Array.from(files).forEach(file => {
        handleFileRead(file, false, true);
      });
    }
  };
  
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, isCover?: boolean) => {
    e.preventDefault();
    if (isCover) {
      e.currentTarget.classList.add('border-blue-500');
    }
    e.currentTarget.classList.add('border-blue-500');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-blue-500');
  };
  
  const handleDrop = (e: React.DragEvent, isCover: boolean, isNewContent: boolean = false) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
    
    const files = e.dataTransfer.files;
    if (files && files.length) {
      if (isCover) {
        handleFileRead(files[0], true);
      } else {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('media/')) {
            handleFileRead(file, false, isNewContent);
          }
        });
      }
    }
  };
  
  // Remove content media
  const handleRemoveContentMedia = (index: number) => {
    setContentMedias(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove new content media
  const handleRemoveNewContentMedia = (index: number) => {
    setNewContentMedias(prev => prev.filter((_, i) => i !== index));
  };
  
  // Form submission for creating a new session
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location || !coverImage || contentMedias.length === 0) {
      setSubmitMessage('All fields are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitMessage('Submitting...');
      
      // The createSession function now handles inserting the session first
      // and then inserting each media into the session_medias table
      await createSession({
        name,
        location,
        cover_image: coverImage,
        map: map || undefined,
        content_medias: contentMedias,
        people,
        date
      });
      
      // Reset form
      setName('');
      setLocation('');
      setPeople('');
      setDate('');
      setCoverImage(null);
      setMap('');
      setContentMedias([]);
      setSubmitMessage('Session created successfully!');
      
      // Refresh the sessions list
      fetchSessions();
      
    } catch (error) {
      console.error('Error creating session:', error);
      setSubmitMessage('Error creating session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle adding photos to existing session
  const handleAddPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSession || newContentMedias.length === 0) {
      setSubmitMessage('Please select a session and add new photos');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitMessage('Adding photos...');
      
      // The updated updateSession function now handles adding medias to the session_medias table
      await updateSession(selectedSession.id, {
        content_medias: newContentMedias
      });
      
      // Reset form
      setSelectedSession(null);
      setNewContentMedias([]);
      setSubmitMessage('Photos added successfully!');
      
      // Refresh the sessions list
      fetchSessions();
      
    } catch (error) {
      console.error('Error adding photos:', error);
      setSubmitMessage('Error adding photos. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle between create new and add to existing
  const toggleMode = () => {
    setAddingToExisting(!addingToExisting);
    setSubmitMessage('');
  };
  
  // Render login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {authError}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // Admin dashboard with session upload form
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
        
        <div className="mb-6 flex">
          <button
            onClick={toggleMode}
            className={`px-4 py-2 rounded-md mr-4 ${!addingToExisting ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Create New Session
          </button>
          <button
            onClick={toggleMode}
            className={`px-4 py-2 rounded-md ${addingToExisting ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Add Photos to Existing Session
          </button>
        </div>
        
        {submitMessage && (
          <div className={`p-3 rounded-md text-sm mb-6 ${
            submitMessage.includes('success') 
              ? 'bg-green-100 text-green-700' 
              : submitMessage.includes('Error') 
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
          }`}>
            {submitMessage}
          </div>
        )}
        
        {addingToExisting ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Add Photos to Existing Session</h2>
            
            <form onSubmit={handleAddPhotos} className="space-y-6">
              <div>
                <label htmlFor="sessionSelect" className="block text-sm font-medium mb-1">
                  Select Session
                </label>
                <select
                  id="sessionSelect"
                  value={selectedSession?.id || ''}
                  onChange={(e) => handleSessionSelect(Number(e.target.value))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a session</option>
                  {existingSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({session.location})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedSession && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Session Details</h3>
                  <p><strong>Name:</strong> {selectedSession.name}</p>
                  <p><strong>Location:</strong> {selectedSession.location}</p>
                  <p><strong>Date:</strong> {new Date(selectedSession.date).toLocaleDateString()}</p>
                </div>
              )}
              
              {/* New Content Medias Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add New Photos
                </label>
                <div
                  className={`border-2 border-dashed rounded-md p-4 text-center ${
                    newContentMedias.length > 0 ? 'border-green-400' : 'border-gray-300'
                  }`}
                  onDragOver={(e) => handleDragOver(e, false)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, false, true)}
                  onClick={() => newContentMediasInputRef.current?.click()}
                >
                  {newContentMedias.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newContentMedias.map((img, index) => (                          <div key={index} className="relative h-32">
                          <MediaDisplay
                            src={img}
                            alt={`New content media ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNewContentMedia(index);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center justify-center h-32 border border-gray-300 rounded-md">
                        <p className="text-gray-500 text-sm">
                          Click or drag to add more
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <p className="text-gray-500">
                        Drag & drop new medias here, or click to select
                      </p>
                    </div>
                  )}
                  <input
                    ref={newContentMediasInputRef}
                    type="file"
                    accept="media/*"
                    multiple
                    onChange={handleNewContentMediasChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can upload multiple new medias
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSession || newContentMedias.length === 0}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isSubmitting || !selectedSession || newContentMedias.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Photos'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Create New Session</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Session Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="people" className="block text-sm font-medium mb-1">
                  People
                </label>
                <input
                  id="people"
                  type="text"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                  placeholder="Names of people in the session"
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If not specified, the current date will be used
                </p>
              </div>
              
              {/* Map Embed Input */}
              <div>
                <label htmlFor="map" className="block text-sm font-medium mb-1">
                  Route Map Embed (Optional)
                </label>
                <textarea
                  id="map"
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  placeholder="Paste embed iframe code here (e.g., from Bikemap.net, Strava, Google Maps, etc.)"
                  className="w-full p-2 border rounded-md font-mono text-sm h-32"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full iframe embed code for your route map
                </p>
                
                {/* Map Preview */}
                {map && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Map Preview</label>
                    <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: map }} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Image
                </label>
                <div
                  className={`border-2 border-dashed rounded-md p-4 text-center ${
                    coverImage ? 'border-green-400' : 'border-gray-300'
                  }`}
                  onDragOver={(e) => handleDragOver(e, true)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, true)}
                  onClick={() => coverImageInputRef.current?.click()}
                >
                  {coverImage ? (
                    <div className="relative h-48 w-full">
                      <MediaDisplay
                        src={coverImage}
                        alt="Cover preview"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverImage(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="p-6">
                      <p className="text-gray-500">
                        Drag & drop cover image here, or click to select
                      </p>
                    </div>
                  )}
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="media/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Content Medias Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content Medias
                </label>
                <div
                  className={`border-2 border-dashed rounded-md p-4 text-center ${
                    contentMedias.length > 0 ? 'border-green-400' : 'border-gray-300'
                  }`}
                  onDragOver={(e) => handleDragOver(e, false)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, false)}
                  onClick={() => contentMediasInputRef.current?.click()}
                >
                  {contentMedias.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {contentMedias.map((img, index) => (
                        <div key={index} className="relative h-32">
                          <MediaDisplay
                            src={img}
                            alt={`Content media ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveContentMedia(index);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center justify-center h-32 border border-gray-300 rounded-md">
                        <p className="text-gray-500 text-sm">
                          Click or drag to add more
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <p className="text-gray-500">
                        Drag & drop content medias here, or click to select
                      </p>
                    </div>
                  )}
                  <input
                    ref={contentMediasInputRef}
                    type="file"
                    accept="media/*"
                    multiple
                    onChange={handleContentMediasChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can upload multiple content medias
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}