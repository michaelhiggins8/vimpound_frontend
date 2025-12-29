import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NextSection from './home_two_d/HomeTwoD'
// Phone Booth component
function PhoneBooth({ onLoaded }: { onLoaded?: () => void }) {
  const { scene } = useGLTF('/public_phone_booth.glb')
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    if (scene) {
      // Traverse the scene to find all meshes
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })

      // Wait a frame to ensure geometry is loaded
      requestAnimationFrame(() => {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(scene)
        const size = box.getSize(new THREE.Vector3())
        
        // Scale to fit nicely first
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2.5 / maxDim
        scene.scale.set(scale, scale, scale)
        
        // Recalculate bounding box after scaling
        const newBox = new THREE.Box3().setFromObject(scene)
        const newCenter = newBox.getCenter(new THREE.Vector3())
        
        // Center the model at origin (0, 0, 0)
        scene.position.x = -newCenter.x
        scene.position.y = -newCenter.y
        scene.position.z = -newCenter.z
        
        // Signal that model is fully loaded
        if (onLoaded) {
          onLoaded()
        }
      })
    }
  }, [scene, onLoaded])

  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Increment time for smooth animation
      timeRef.current += delta
      
      // Oscillate between -20 and +20 degrees (convert to radians)
      // Using a sine wave for smooth back-and-forth motion
      const rotationAngle = Math.sin(timeRef.current * 1.5) * (20 * Math.PI / 180)
      
      // Apply rotation on Y-axis (vertical axis)
      groupRef.current.rotation.y = rotationAngle
    }
  })

  return <primitive object={scene} ref={groupRef} />
}

function ParticleSystem() {
  const meshRef = useRef<THREE.Points>(null)
  const timeRef = useRef(0)
  const velocitiesRef = useRef<Float32Array | null>(null)
  
  // Create particle geometry and material
  const { positions, sizes } = useMemo(() => {
    const particleCount = 800
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    // Initialize particles in a sphere around the phone booth
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Random position in a sphere (radius 3-8 units from center)
      const radius = 3 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2 // Azimuth angle
      const phi = Math.acos(2 * Math.random() - 1) // Polar angle
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Random velocity for each particle
      const speed = 0.2 + Math.random() * 0.3
      velocities[i3] = (Math.random() - 0.5) * speed
      velocities[i3 + 1] = (Math.random() - 0.5) * speed
      velocities[i3 + 2] = (Math.random() - 0.5) * speed
      
      // Size based on distance (farther = smaller for depth effect)
      sizes[i] = 0.2 + (1 - (radius - 3) / 5) * 0.3
    }
    
    // Store velocities in ref
    velocitiesRef.current = velocities
    
    return { positions, sizes }
  }, [])
  
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geom
  }, [positions, sizes])
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ff41) },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = vec3(0.0, 1.0, 0.25);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (900.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          // Make particles slightly brighter for visibility
          vec3 brightColor = vColor * 1.2;
          gl_FragColor = vec4(brightColor, alpha * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])
  
  useFrame((_state, delta) => {
    if (meshRef.current && material && velocitiesRef.current) {
      timeRef.current += delta
      
      // Update material time uniform for potential shader animations
      if (material.uniforms) {
        material.uniforms.time.value = timeRef.current
      }
      
      // Update particle positions
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array
      const velocities = velocitiesRef.current
      const particleCount = positions.length / 3
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // Update position based on velocity
        positions[i3] += velocities[i3] * delta
        positions[i3 + 1] += velocities[i3 + 1] * delta
        positions[i3 + 2] += velocities[i3 + 2] * delta
        
        // Wrap particles around if they go too far
        const distance = Math.sqrt(
          positions[i3] ** 2 + 
          positions[i3 + 1] ** 2 + 
          positions[i3 + 2] ** 2
        )
        
        if (distance > 8) {
          // Reset to random position closer to center
          const radius = 3 + Math.random() * 2
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
          positions[i3 + 2] = radius * Math.cos(phi)
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return <points ref={meshRef} geometry={geometry} material={material} />
}

function CameraController({ targetProgressRef }: { targetProgressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree()
  const smoothProgress = useRef(0)

  useEffect(() => {
    // Initial camera position - far from the phone, looking at origin
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((_state, delta) => {
    // Smooth interpolation to prevent jittery camera movement
    // Use delta time for frame-rate independent smoothing
    const smoothingFactor = Math.min(1, delta * 8) // Adjust multiplier for smoothness
    smoothProgress.current += (targetProgressRef.current - smoothProgress.current) * smoothingFactor
    
    // Map scroll (0-1) to camera distance (5 to 0.3)
    const minDistance = 0.3
    const maxDistance = 5
    const distance = maxDistance - smoothProgress.current * (maxDistance - minDistance)
    
    // Keep camera looking at origin, moving closer along Z-axis
    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function LoadingSpinner() {
  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(0, 255, 65, 0.3)',
            borderTop: '4px solid #00ff41',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            boxShadow: `
              0 0 10px rgba(0, 255, 65, 0.5),
              0 0 20px rgba(0, 255, 65, 0.3)
            `,
          }}
        />
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            color: '#00ff41',
            textShadow: `
              0 0 5px #00ff41,
              0 0 10px #00ff41
            `,
            letterSpacing: '2px',
          }}
        >
          LOADING...
        </div>
      </div>
    </>
  )
}

function MatrixTypingText({ shouldStart }: { shouldStart: boolean }) {
  const fullText = "Yelling, angry, drunk callers? Give your staff a break. Let AI handle your impound calls."
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (shouldStart && currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 50) // Typing speed - adjust for faster/slower

      return () => clearTimeout(timer)
    }
  }, [shouldStart, currentIndex, fullText])

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  if (!shouldStart) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        fontFamily: '"Courier New", monospace',
        fontSize: 'clamp(16px, 3vw, 32px)',
        color: '#00ff41',
        textShadow: `
          0 0 5px #00ff41,
          0 0 10px #00ff41,
          0 0 15px #00ff41,
          0 0 20px #00ff41
        `,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '20px 30px',
        borderRadius: '5px',
        border: '1px solid #00ff41',
        boxShadow: `
          0 0 10px rgba(0, 255, 65, 0.5),
          inset 0 0 10px rgba(0, 255, 65, 0.1)
        `,
        maxWidth: '80%',
        textAlign: 'center',
        lineHeight: '1.6',
        letterSpacing: '2px',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}
    >
      {displayedText}
      <span style={{ opacity: showCursor ? 1 : 0 }}>█</span>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const canvasSectionRef = useRef<HTMLDivElement>(null)
  const nextSectionRef = useRef<HTMLDivElement>(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const targetScrollProgressRef = useRef(0)
  const [canvasOpacity, setCanvasOpacity] = useState(1)
  const [nextSectionOpacity, setNextSectionOpacity] = useState(0)

  const handleModelLoaded = () => {
    setModelLoaded(true)
  }

  const handleDashboardClick = async () => {
    try {
      // Step 1: Check if user has any token at all
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !sessionData.session) {
        // No session found, navigate to signin
        navigate('/signin')
        return
      }

      // Step 2: Verify the token is legit by calling Supabase from the frontend
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData.user) {
        // Token is invalid or expired, navigate to signin
        navigate('/signin')
        return
      }

      // Step 3: Both checks passed - user is verified and logged in
      navigate('/dashboard/overview')
    } catch (error) {
      // Handle any unexpected errors by redirecting to signin
      console.error('Error checking authentication:', error)
      navigate('/signin')
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is the Dashboard button or its children
    const target = e.target as HTMLElement
    const dashboardButton = target.closest('button')
    
    // If clicked on Dashboard button, don't scroll
    if (dashboardButton && dashboardButton.textContent?.includes('Dashboard')) {
      return
    }
    
    if (!canvasSectionRef.current) return
    
    const canvasSection = canvasSectionRef.current
    const windowHeight = window.innerHeight
    const scrollPosition = window.scrollY
    const sectionTop = canvasSection.offsetTop
    const sectionHeight = canvasSection.offsetHeight
    
    // Calculate current scroll progress
    const progress = Math.max(0, Math.min(1, (scrollPosition - sectionTop) / (sectionHeight - windowHeight)))
    
    // Only scroll if we're still in experience one (progress < 0.7, before fade starts)
    if (progress < 0.7) {
      // Calculate scroll position needed to reach experience 2 (progress = 1)
      // This is when section bottom reaches viewport top
      const targetScrollPosition = sectionTop + sectionHeight - windowHeight
      
      // Smooth scroll to target position
      window.scrollTo({
        top: targetScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!canvasSectionRef.current) return
      
      const canvasSection = canvasSectionRef.current
      const windowHeight = window.innerHeight
      const scrollPosition = window.scrollY
      const sectionTop = canvasSection.offsetTop
      const sectionHeight = canvasSection.offsetHeight
      
      // Calculate scroll progress within the canvas section (0 to 1)
      // Progress from 0 (section top at viewport top) to 1 (section bottom at viewport top)
      const progress = Math.max(0, Math.min(1, (scrollPosition - sectionTop) / (sectionHeight - windowHeight)))
      
      // Update camera zoom progress (0 to 1)
      targetScrollProgressRef.current = progress
      
      // Fade transition: canvas fades out as progress approaches 1
      // Start fading at 70% progress, fully transparent at 100%
      const fadeStart = 0.7
      const fadeEnd = 1.0
      let canvasAlpha = 1
      let nextAlpha = 0
      
      if (progress >= fadeStart) {
        // Calculate fade progress from fadeStart to fadeEnd
        const fadeProgress = (progress - fadeStart) / (fadeEnd - fadeStart)
        canvasAlpha = 1 - fadeProgress
        nextAlpha = fadeProgress
      }
      
      // Update opacities smoothly
      setCanvasOpacity(canvasAlpha)
      setNextSectionOpacity(nextAlpha)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      {/* Canvas Section - Fixed height for scroll-based zoom */}
      <div
        ref={canvasSectionRef}
        onClick={handleCanvasClick}
        style={{
          width: '100vw',
          height: '200vh', // Fixed height allows scroll-based zoom
          margin: 0,
          padding: 0,
          position: 'relative',
          cursor: canvasOpacity > 0.5 ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            height: '100vh',
            opacity: canvasOpacity,
            transition: 'opacity 0.1s linear', // Smooth opacity transition
            pointerEvents: canvasOpacity > 0 ? 'auto' : 'none',
            // Canvas should be on top when it's more visible than next section
            zIndex: canvasOpacity >= nextSectionOpacity ? 2 : 1,
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ background: '#fff', display: 'block', width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />
            <pointLight position={[0, 3, 0]} intensity={0.5} />
            <ParticleSystem />
            <PhoneBooth onLoaded={handleModelLoaded} />
            <CameraController targetProgressRef={targetScrollProgressRef} />
          </Canvas>
          {/* Dashboard Button - Top Right Corner */}
          <button
            onClick={handleDashboardClick}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 100,
              padding: '16px 32px',
              backgroundColor: '#12A594',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              transform: 'scale(1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0f8a7a'
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#12A594'
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Open Dashboard
          </button>
          {!modelLoaded && <LoadingSpinner />}
          <MatrixTypingText shouldStart={modelLoaded} />
        </div>
      </div>

      {/* Next Section - Positioned to start at 100vh (visual end of canvas) */}
      {/* Wrapper with negative margin to prevent white gap */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          // Negative margin positions this to start at 100vh (visual end of canvas)
          marginTop: '-100vh',
          // Height matches canvas section to maintain proper scroll space
          minHeight: '200vh',
          // Transparent background so canvas shows through when scrolling up
          backgroundColor: 'transparent',
          // Ensure wrapper doesn't block canvas when next section is invisible
          pointerEvents: nextSectionOpacity > 0 ? 'auto' : 'none',
        }}
      >
        {/* Sticky wrapper keeps content at top during transition */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            minHeight: '100vh',
            // Next section should be on top when it's more visible than canvas
            zIndex: nextSectionOpacity > canvasOpacity ? 3 : 1,
            // Ensure wrapper doesn't block when content is invisible
            pointerEvents: nextSectionOpacity > 0 ? 'auto' : 'none',
          }}
        >
          <div
            ref={nextSectionRef}
            style={{
              width: '100%',
              minHeight: '100vh',
              opacity: nextSectionOpacity,
              transition: 'opacity 0.1s linear',
              pointerEvents: nextSectionOpacity > 0 ? 'auto' : 'none',
              backgroundColor: '#fff',
              // Ensure content can extend beyond viewport
              position: 'relative',
            }}
          >
            <NextSection />
          </div>      
        </div>
      </div>
    </div>
  )
}

export default Home