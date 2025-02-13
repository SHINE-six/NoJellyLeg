import { useState, memo } from "react"
import Participant from "./Participant"
import Park from "./Park"

// Create memoized participant component
const MemoizedParticipant = memo(({ name, enabled, joyStickMovement }) => {
  return <Participant name={name} enabled={enabled} joyStickMovement={joyStickMovement} />
})

export default function Scene({ participants, joyStickMovement }) {
  const [focusUser, setFocusUser] = useState(-1)

  const handleSetFocusUser = (e, index) => {
    e.stopPropagation()
    setFocusUser(index)
  }

  return (
    <>
      <Park />
      {participants.map((name, index) => (
        <group key={index} position={[index * 2, 0, 0]} onClick={(e) => handleSetFocusUser(e, index)}>
          {/* If the participant is the focuesed index, then pass enabled = true */}
          {/* <Participant name={name} enabled={focusUser === index}/> */}
          <MemoizedParticipant name={name} enabled={focusUser === index} joyStickMovement={joyStickMovement}/>

          {/* Red box */}
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={focusUser === index ? 'red' : 'blue'} />
          </mesh>
        </group>
      ))}
    </>
  )
}
