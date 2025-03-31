import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/men.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Merged_body019_001.geometry}
        material={materials.Merged_body019_001}
      />
    </group>
  )
}

useGLTF.preload('/men.glb')