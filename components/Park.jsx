import { useRef } from "react"
import { useGLTF } from "@react-three/drei"


export default function Park() {
  const park = useGLTF("/models/park.glb")
  const parkRef = useRef()

  return (
    <primitive ref={parkRef} object={park.scene} scale={1} position={[0, -0.2, -10]} />
  )
}