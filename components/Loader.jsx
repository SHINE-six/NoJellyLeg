import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Text } from "@react-three/drei";

export default function Loader() {
  const groupRef = useRef();

  useFrame(() => {
    groupRef.current.rotation.y += 0.01;
  });

  return (
    <>
    <Text fontSize={1} position={[0, 3, 0]} color="white">
      Loading...
    </Text>
    <group ref={groupRef} rotation={[45 * (Math.PI / 180), 0, 45 * (Math.PI / 180)]}>
      <mesh>
        <boxGeometry args={[3, 3, 3]}/>
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    </group>
    </>
  );
}