import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Mouse coordinates
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Spring configuration for the outer ring (smooth trailing effect)
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    useEffect(() => {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            setIsMobile(true);
            return;
        }

        let timeoutId;
        const handleMouseMove = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsVisible(true);
            
            // Auto-hide if mouse stops moving completely for 5 seconds (optional safety fallback)
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setIsVisible(false), 5000);
        };

        const handleMouseOut = (e) => {
            if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
                setIsVisible(false);
            }
        };

        const handleHoverStart = (e) => {
            try {
                const target = e.target;
                if (!target || target.nodeType !== 1) return;
                
                const isClickable = 
                    target.tagName.toLowerCase() === 'a' ||
                    target.tagName.toLowerCase() === 'button' ||
                    target.closest('a') ||
                    target.closest('button') ||
                    window.getComputedStyle(target).cursor === 'pointer';
                
                setIsHovering(!!isClickable);
            } catch (err) {}
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('mouseover', handleHoverStart);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('mouseover', handleHoverStart);
            clearTimeout(timeoutId);
        };
    }, [cursorX, cursorY]);

    if (isMobile) return null;

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-emerald-500 rounded-full pointer-events-none z-[99999] ring-[1.5px] ring-white dark:ring-slate-900 shadow-sm"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                    opacity: isVisible ? 1 : 0,
                }}
            />
            
            {/* Outer animated ring */}
            <motion.div
                className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border border-emerald-500/60"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                    opacity: isVisible ? 1 : 0,
                }}
                animate={{
                    width: isHovering ? 48 : 28,
                    height: isHovering ? 48 : 28,
                    backgroundColor: isHovering ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    scale: isHovering ? 1.2 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            />
        </>
    );
};

export default CustomCursor;

