import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MatrixTunnel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current = renderer;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create tunnel geometry
    const tunnelGeometry = new THREE.CylinderGeometry(50, 50, 200, 32, 1, true);
    
    // Matrix-style material with transparency
    const tunnelMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    
    const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    tunnel.rotation.x = Math.PI / 2;
    scene.add(tunnel);

    // Create matrix characters - reliable basic set
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789';
    
    // Privacy words in multiple languages (simplified)
    const privacyWords = [
      'PRIVACY', 'PRIVACIDAD', 'DATENSCHUTZ', 'PRIVACIDADE', 'INTEGRITET', 
      'PERSONVERN', 'PRYWATNOSC', 'SOUKROMI', 'YKSITYISYYS', 'PRIVATNOST',
      'ADATVEDELEM', 'ZASEBNOST', 'CONFIDENTIALITE', 'RISERVATEZZA', 'PRIVATA'
    ];
    
    // Create character textures
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    const characterTextures: THREE.Texture[] = [];
    
    // Create single character textures
    for (let i = 0; i < matrixChars.length; i++) {
      if (!context) continue;
      
      // Clear with transparent background
      context.clearRect(0, 0, 64, 64);
      
      // Set font and style
      context.fillStyle = '#00ff41';
      context.font = 'bold 32px Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Render the character clearly
      context.fillText(matrixChars[i], 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      characterTextures.push(texture);
    }
    
    // Create privacy word textures (larger canvas for full words)
    const wordCanvas = document.createElement('canvas');
    wordCanvas.width = 256;
    wordCanvas.height = 64;
    const wordContext = wordCanvas.getContext('2d');
    
    const privacyWordTextures: THREE.Texture[] = [];
    
    for (let i = 0; i < privacyWords.length; i++) {
      if (!wordContext) continue;
      
      // Clear with transparent background
      wordContext.clearRect(0, 0, 256, 64);
      
      // Set font and style
      wordContext.fillStyle = '#00ff41';
      wordContext.font = 'bold 16px Arial, sans-serif';
      wordContext.textAlign = 'center';
      wordContext.textBaseline = 'middle';
      
      // Render the word clearly
      wordContext.fillText(privacyWords[i], 128, 32);
      
      const texture = new THREE.CanvasTexture(wordCanvas);
      texture.needsUpdate = true;
      privacyWordTextures.push(texture);
    }
    
    // Create character particles
    const particleCount = 300; // Reduced for performance
    const characterMeshes: THREE.Mesh[] = [];
    const characterVelocities: number[] = [];
    const isWordMesh: boolean[] = []; // Track which meshes are words
    
    for (let i = 0; i < particleCount; i++) {
      const isPrivacyWord = Math.random() < 0.1; // 10% chance to be a privacy word
      
      let geometry, material;
      
      if (isPrivacyWord) {
        // Create larger geometry for privacy words
        geometry = new THREE.PlaneGeometry(12, 3);
        const randomOpacity = 0.7 + Math.random() * 0.3; // Brighter for words
        material = new THREE.MeshBasicMaterial({
          map: privacyWordTextures[Math.floor(Math.random() * privacyWordTextures.length)],
          transparent: true,
          opacity: randomOpacity,
          alphaTest: 0.1,
          side: THREE.DoubleSide
        });
      } else {
        // Regular single character
        geometry = new THREE.PlaneGeometry(2, 2);
        const randomOpacity = 0.5 + Math.random() * 0.5;
        material = new THREE.MeshBasicMaterial({
          map: characterTextures[Math.floor(Math.random() * characterTextures.length)],
          transparent: true,
          opacity: randomOpacity,
          alphaTest: 0.1,
          side: THREE.DoubleSide
        });
      }
      
      const mesh = new THREE.Mesh(geometry, material);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 45 + 5;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = Math.sin(angle) * radius;
      mesh.position.z = Math.random() * 400 - 200;
      
      mesh.lookAt(camera.position);
      
      characterMeshes.push(mesh);
      characterVelocities.push(Math.random() * 0.5 + 0.2); // Slower speed
      isWordMesh.push(isPrivacyWord); // Track if this mesh is a word
      scene.add(mesh);
    }

    // Create data streams (vertical lines)
    const streamCount = 20;
    const streams: THREE.Line[] = [];
    
    for (let i = 0; i < streamCount; i++) {
      const streamGeometry = new THREE.BufferGeometry();
      const streamPositions = new Float32Array(60); // 20 points * 3 coordinates
      
      const angle = (i / streamCount) * Math.PI * 2;
      const radius = 25 + Math.random() * 15;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      for (let j = 0; j < 20; j++) {
        streamPositions[j * 3] = x;
        streamPositions[j * 3 + 1] = y;
        streamPositions[j * 3 + 2] = j * 10 - 100;
      }
      
      streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
      
      const streamMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.3
      });
      
      const stream = new THREE.Line(streamGeometry, streamMaterial);
      streams.push(stream);
      scene.add(stream);
    }

    // Position camera
    camera.position.z = 10;
    camera.position.y = 0;
    camera.lookAt(0, 0, -50);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Remove tunnel rotation
      // tunnel.rotation.z += 0.001;
      
      // Animate character particles
      characterMeshes.forEach((mesh, i) => {
        mesh.position.z += characterVelocities[i];
        
        // Randomly change characters while moving (more dynamic)
        if (Math.random() < 0.02) { // 2% chance each frame to change character
          const material = mesh.material as THREE.MeshBasicMaterial;
          const isCurrentlyWord = isWordMesh[i]; // Check if it's currently a word
          
          if (Math.random() < 0.15 && !isCurrentlyWord) { // 15% chance to become a privacy word
            const newTexture = privacyWordTextures[Math.floor(Math.random() * privacyWordTextures.length)];
            material.map = newTexture;
            material.needsUpdate = true;
            isWordMesh[i] = true; // Update the flag
          } else if (isCurrentlyWord && Math.random() < 0.3) { // 30% chance for words to become characters
            const newTexture = characterTextures[Math.floor(Math.random() * characterTextures.length)];
            material.map = newTexture;
            material.needsUpdate = true;
            isWordMesh[i] = false; // Update the flag
          } else if (!isCurrentlyWord) { // Regular character change
            const newTexture = characterTextures[Math.floor(Math.random() * characterTextures.length)];
            material.map = newTexture;
            material.needsUpdate = true;
          }
        }
        
        // Reset character if it goes too far
        if (mesh.position.z > 100) {
          mesh.position.z = -300;
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 45 + 5;
          mesh.position.x = Math.cos(angle) * radius;
          mesh.position.y = Math.sin(angle) * radius;
          
          // Always change character when resetting position
          const material = mesh.material as THREE.MeshBasicMaterial;
          
          if (Math.random() < 0.15) { // 15% chance to be a privacy word
            const newTexture = privacyWordTextures[Math.floor(Math.random() * privacyWordTextures.length)];
            material.map = newTexture;
            isWordMesh[i] = true; // Update the flag
          } else {
            const newTexture = characterTextures[Math.floor(Math.random() * characterTextures.length)];
            material.map = newTexture;
            isWordMesh[i] = false; // Update the flag
          }
          material.needsUpdate = true;
          
          // Random opacity change
          material.opacity = 0.4 + Math.random() * 0.4;
        }
        
        // Make characters face camera
        mesh.lookAt(camera.position);
      });
      
      // Animate data streams slower
      streams.forEach((stream, index) => {
        // Remove stream rotation
        // stream.rotation.z += 0.002 + index * 0.0002;
        
        const positions = stream.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 20; i++) {
          positions[i * 3 + 2] += 0.3; // Much slower
          if (positions[i * 3 + 2] > 100) {
            positions[i * 3 + 2] = -200;
          }
        }
        stream.geometry.attributes.position.needsUpdate = true;
      });
      
      // Move camera forward very slowly
      camera.position.z = 10 + Math.sin(Date.now() * 0.0003) * 2;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!rendererRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Dispose geometries and materials
      tunnel.geometry.dispose();
      tunnelMaterial.dispose();
      
      characterMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.MeshBasicMaterial).dispose();
      });
      
      characterTextures.forEach(texture => {
        texture.dispose();
      });
      
      privacyWordTextures.forEach(texture => {
        texture.dispose();
      });
      
      streams.forEach(stream => {
        stream.geometry.dispose();
        (stream.material as THREE.LineBasicMaterial).dispose();
      });
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
    />
  );
}