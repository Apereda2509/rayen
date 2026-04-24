'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  const [hovering, setHovering] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  useEffect(() => {
    // No montar en touch o prefers-reduced-motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) return

    setMounted(true)

    function onMove(e: MouseEvent) {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    function onEnter(e: MouseEvent) {
      const target = e.target as Element
      if (target.closest('a, button, [role="button"]')) {
        setHovering(true)
      }
    }

    function onLeave(e: MouseEvent) {
      const target = e.target as Element
      if (target.closest('a, button, [role="button"]')) {
        setHovering(false)
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
    }
  }, [mouseX, mouseY])

  if (!mounted) return null

  return (
    <>
      {/* Punto interno — sigue exactamente, desaparece en hover */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#00E676',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
        animate={{ opacity: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Anillo externo — spring lag, se escala y rellena en hover */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid #00E676',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
        animate={{
          scale: hovering ? 2 : 1,
          backgroundColor: hovering ? 'rgba(0,230,118,0.15)' : 'rgba(0,230,118,0)',
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}
