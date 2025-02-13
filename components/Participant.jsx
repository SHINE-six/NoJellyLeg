import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { BikeModel } from "@/public/models/Bike/Scene";
import { AstronautModel } from "@/public/models/Astronaut";

export default function Participant({ position, name, enabled, joyStickMovement }) {
  const groupRef = useRef()
  const [keys, setKeys] = useState({})
  const [velocity, setVelocity] = useState(0)
  
  const maxSpeed = 0.2
  const acceleration = 0.005
  const friction = 0.98

  // Add boundary constants
  const BOUNDARY = {
    minX: -25,
    maxX: 25,
    minZ: -40,
    maxZ: 20
  }

  useEffect(() => {
    const handleKeyDown = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }))
    const handleKeyUp = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }))

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!enabled) return
    if (!groupRef.current) return

    const currentRotation = groupRef.current.rotation.y

    // Handle keyboard rotation
    if (keys['a']) {
      groupRef.current.rotation.y += 0.03
      groupRef.current.rotation.z = -7 * (Math.PI / 180)
    } else if (keys['d']) {
      groupRef.current.rotation.y -= 0.03
      groupRef.current.rotation.z = 7 * (Math.PI / 180)
    }

    // Handle joystick rotation
    if (joyStickMovement?.x) {
      groupRef.current.rotation.y -= joyStickMovement.x * 0.03
      groupRef.current.rotation.z = joyStickMovement.x * 7 * (Math.PI / 180)
    }

    // Reset tilt when not turning
    if (!keys['a'] && !keys['d'] && !joyStickMovement?.x) {
      groupRef.current.rotation.z = 0
    }

    // Update velocity with keyboard
    if (keys['w']) {
      setVelocity(prev => Math.min(prev + acceleration, maxSpeed))
    } else if (keys['s']) {
      setVelocity(prev => Math.max(prev - acceleration, -maxSpeed * 0.5))
    } else if (joyStickMovement?.y) {
      // Update velocity with joystick
      setVelocity(prev => {
        const targetSpeed = -joyStickMovement.y * maxSpeed // Negative because y is inverted
        return prev + (targetSpeed - prev) * 0.1 // Smooth acceleration
      })
    } else {
      setVelocity(prev => prev * friction)
    }

    // Calculate and apply movement with boundary checks
    const nextX = groupRef.current.position.x + Math.sin(currentRotation) * velocity
    const nextZ = groupRef.current.position.z + Math.cos(currentRotation) * velocity

    // Check boundaries and apply movement with collision
    if (nextX >= BOUNDARY.minX && nextX <= BOUNDARY.maxX) {
      groupRef.current.position.x = nextX
    } else {
      // Hit wall - stop movement and add small bounce
      setVelocity(prev => -prev * 0.3)
    }

    if (nextZ >= BOUNDARY.minZ && nextZ <= BOUNDARY.maxZ) {
      groupRef.current.position.z = nextZ
    } else {
      // Hit wall - stop movement and add small bounce
      setVelocity(prev => -prev * 0.3)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Text 
        color={enabled ? 'lime' : 'black'}
        fontSize={0.7} 
        position={[0, 3.2, 0]}
      >{name}</Text>
      <AstronautModel position={[0, 0.1, -0.2]} rotation={[5 * (Math.PI/180), 0, 0]}/>
      <BikeModel rotation={[0, -Math.PI / 2, 0]} scale={[1.6, 1.6, 1.6]} />
    </group>
  )
}