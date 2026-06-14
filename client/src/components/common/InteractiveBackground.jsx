import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useAppcontext } from '../../context/AppContext';

const InteractiveBackground = () => {
    const { darkMode } = useAppcontext();
    const [isMobile, setIsMobile] = useState(false);

    // Mouse coordinates for the interactive orb
    const cursorX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
    const cursorY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

    // Spring configuration for very smooth, delayed trailing
    const springConfig = { damping: 40, stiffness: 100, mass: 2 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    useEffect(() => {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            setIsMobile(true);
        }

        const handleMouseMove = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        if (!isMobile) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [cursorX, cursorY, isMobile]);

    // Orb colors based on theme (Using solid color and fully transparent version for smooth GPU-friendly gradients)
    const orb1 = darkMode ? ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0)'] : ['rgba(16, 185, 129, 0.25)', 'rgba(16, 185, 129, 0)']; // Emerald
    const orb2 = darkMode ? ['rgba(45, 212, 191, 0.1)', 'rgba(45, 212, 191, 0)'] : ['rgba(45, 212, 191, 0.2)', 'rgba(45, 212, 191, 0)']; // Teal
    const orb3 = darkMode ? ['rgba(148, 163, 184, 0.05)', 'rgba(148, 163, 184, 0)'] : ['rgba(148, 163, 184, 0.15)', 'rgba(148, 163, 184, 0)']; // Slate
    const interactiveOrb = darkMode ? ['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0)'] : ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0)']; // Brighter Emerald

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] will-change-transform" style={{ transform: 'translateZ(0)' }}>
            {/* Base Background Color */}
            <div className={`absolute inset-0 transition-colors duration-300 ${darkMode ? 'bg-[#090d16]' : 'bg-[#f8fafc]'}`} />

            {/* SVG Noise Texture Overlay - Hardware Accelerated to prevent paint lag on zoom */}
            <div 
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay will-change-transform"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '150px 150px',
                    transform: 'translateZ(0)' 
                }}
            />

            {/* GPU-Optimized Autonomous Orb 1 (Top Left) */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.1, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                }}
                className="absolute top-[-30%] left-[-20%] w-[90vw] h-[90vw] rounded-full will-change-transform"
                style={{ background: `radial-gradient(circle at center, ${orb1[0]} 0%, ${orb1[1]} 65%)` }}
            />

            {/* GPU-Optimized Autonomous Orb 2 (Bottom Right) */}
            <motion.div
                animate={{
                    x: [0, -100, 50, 0],
                    y: [0, 100, -50, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                }}
                className="absolute bottom-[-30%] right-[-20%] w-[100vw] h-[100vw] rounded-full will-change-transform"
                style={{ background: `radial-gradient(circle at center, ${orb2[0]} 0%, ${orb2[1]} 65%)` }}
            />

            {/* GPU-Optimized Autonomous Orb 3 (Center) */}
            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, 50, -50, 0],
                    scale: [0.8, 1.1, 1, 0.8],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                }}
                className="absolute top-[10%] left-[20%] w-[80vw] h-[80vw] rounded-full will-change-transform"
                style={{ background: `radial-gradient(circle at center, ${orb3[0]} 0%, ${orb3[1]} 65%)` }}
            />

            {/* GPU-Optimized Interactive Mouse Tracking Orb */}
            {!isMobile && (
                <motion.div
                    className="absolute w-[60vw] h-[60vw] rounded-full will-change-transform"
                    style={{
                        x: springX,
                        y: springY,
                        translateX: '-50%',
                        translateY: '-50%',
                        background: `radial-gradient(circle at center, ${interactiveOrb[0]} 0%, ${interactiveOrb[1]} 60%)`,
                    }}
                />
            )}
        </div>
    );
};

export default InteractiveBackground;

