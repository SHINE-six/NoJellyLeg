import { useEffect, useState } from 'react';

export default function Joystick({ onMove }) {
  const [touching, setTouching] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const handleStart = (e) => {
    const touch = e.touches[0];
    setOrigin({ x: touch.clientX, y: touch.clientY });
    setTouching(true);
  };

  const handleMove = (e) => {
    if (!touching) return;
    const touch = e.touches[0];
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    
    // Normalize the values between -1 and 1
    const maxDistance = 50;
    const x = Math.max(-1, Math.min(1, dx / maxDistance));
    const y = Math.max(-1, Math.min(1, dy / maxDistance));
    
    setPosition({ x, y });
    onMove({ x, y });
  };

  const handleEnd = () => {
    setTouching(false);
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '120px',
        height: '120px',
        borderRadius: '60px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        touchAction: 'none',
      }}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div
        style={{
          position: 'absolute',
          left: `${50 + position.x * 25}%`,
          top: `${50 + position.y * 25}%`,
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          borderRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        }}
      />
    </div>
  );
}
