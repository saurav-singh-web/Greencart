import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Float, ContactShadows, Environment, MeshDistortMaterial } from '@react-three/drei';

// A generic, beautiful 3D placeholder if the user doesn't have a custom GLTF model yet
const Generic3DPlaceholder = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = time * 0.5;
            meshRef.current.rotation.x = time * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef} castShadow receiveShadow>
                {/* Icosahedron creates a nice diamond/gem-like geometric shape */}
                <icosahedronGeometry args={[1.5, 0]} />
                <MeshDistortMaterial 
                    color="#10b981" 
                    emissive="#064e3b"
                    envMapIntensity={1.5} 
                    clearcoat={1} 
                    clearcoatRoughness={0.1} 
                    metalness={0.8}
                    roughness={0.2}
                    distort={0.2}
                    speed={2}
                />
            </mesh>
        </Float>
    );
};

const Product3DViewer = ({ modelUrl }) => {
    return (
        <div className="w-full h-full min-h-[300px] md:min-h-[450px] relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing">
            
            <div className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                Interactive 3D View
            </div>

            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <Environment preset="city" />
                    
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    
                    {/* Model or Placeholder */}
                    {modelUrl ? (
                        // If you have a useGLTF hook from drei to load actual models:
                        // <Model url={modelUrl} /> 
                        <Generic3DPlaceholder />
                    ) : (
                        <Generic3DPlaceholder />
                    )}

                    {/* Ground shadow for realism */}
                    <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                </Suspense>
                
                {/* Controls to drag and rotate */}
                <OrbitControls 
                    enableZoom={true} 
                    enablePan={false} 
                    minPolarAngle={Math.PI / 4} 
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
};

export default Product3DViewer;

