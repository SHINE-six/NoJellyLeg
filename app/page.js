'use client';

import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Scene from "@/components/Scene";
import Loader from "@/components/Loader";
import { useDatabase } from "@/lib/useDatabase";
import { useDeviceDetect } from "@/lib/useDeviceDetect";
import Joystick from "@/components/Joystick";

export default function Home() {
  const isMobile = useDeviceDetect();
  const [moreDetail, setMoreDetail] = useState(!isMobile);
  const { currentSession, participants, loading, error, addParticipant } = useDatabase()
  const [newName, setNewName] = useState('')
  const [joyStickMovement, setJoyStickMovement] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isMobile) {
      setMoreDetail(false);
    }
  }, [isMobile]);

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      addParticipant(newName.trim());
      setNewName('');
    }
  };
  
  return (
    <div className="w-screen h-screen relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[15, 20, 35]} />
        <OrbitControls />
        <ambientLight intensity={1}/>
        <directionalLight position={[10, 10, 10]} />

        <Suspense fallback={<Loader />}>
          <Scene participants={participants} joyStickMovement={joyStickMovement}/>
        </Suspense>
      </Canvas>

      <div className="absolute top-4 right-4 bg-white/90 rounded-lg shadow-lg p-6 max-w-md">
        {loading ? (
          <div className="text-gray-600 animate-pulse">Loading session...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 cursor-pointer" onClick={() => setMoreDetail(!moreDetail)}>
              {currentSession?.name} - {currentSession?.location}
            </h3>
            {isMobile && <Joystick onMove={setJoyStickMovement}/>}
            {moreDetail ? (
              <>
                <form onSubmit={handleAddParticipant} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new participant name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </form>
                <div className="text-gray-700">
                  <span className="font-medium">Participants:</span>{' '}
                  {participants.map((p, i) => (
                    <span key={i}>
                      {p}{i < participants.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
                <Image
                  src={currentSession.image}
                  width={500}
                  height={500}
                  alt="Map"
                  className="rounded-lg"
                />
              </>
              )
              :
              <div className="text-gray-600 text-xs text-center h-[1rem] cursor-pointer" onClick={() => setMoreDetail(!moreDetail)}>More Detail</div>
            }
          </div>
        )}
      </div>
    </div>
  )
}
        
