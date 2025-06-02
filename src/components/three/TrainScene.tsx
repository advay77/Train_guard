import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from 'three-stdlib';
import { getAllCoachesData, CoachData } from "@/services/coachDataService";

export function TrainScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const coachObjectsRef = useRef<{[key: string]: THREE.Group}>({});
  const [focusedCoach, setFocusedCoach] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"exterior" | "interior">("exterior");
  const [currentInteriorCoach, setCurrentInteriorCoach] = useState<string | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // New state variables for manual rotation
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  // Performance mode state
  const [performanceMode, setPerformanceMode] = useState(true);

  useEffect(() => {
    // Initialize the scene
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0f1a");
    sceneRef.current = scene;

    // Reduced fog density for better performance
    scene.fog = new THREE.FogExp2("#0a0f1a", 0.01);

    // Camera with optimized settings
    const camera = new THREE.PerspectiveCamera(
      65,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100 // Reduced far plane for performance
    );
    camera.position.z = 15;
    camera.position.y = 5;
    camera.position.x = 0;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Optimized renderer settings for better performance
    const renderer = new THREE.WebGLRenderer({ 
      antialias: performanceMode ? false : true,
      alpha: true,
      powerPreference: "high-performance",
      precision: performanceMode ? "mediump" : "highp",
      stencil: false // Not needed
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    // Use device pixel ratio but cap it for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Reduce shadow quality for performance
    renderer.shadowMap.enabled = !performanceMode;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Less expensive shadow map
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS2D Renderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mountRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Simplified lighting setup for better performance
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);
    
    // Reduced quality directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 15, 10);
    
    // Only enable shadows if not in performance mode
    if (!performanceMode) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024; // Reduced from 4096
      directionalLight.shadow.mapSize.height = 1024; // Reduced from 4096
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.bias = -0.0001;
      
      // Set up shadow camera bounds
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
    }
    scene.add(directionalLight);
    
    // Create simplified ground with lower resolution
    const groundSize = 100;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 16, 16); // Reduced segments
    
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b2b2b,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    
    if (!performanceMode) {
      ground.receiveShadow = true;
    }
    
    scene.add(ground);

    // Create simplified mountains with lower poly counts
    if (!performanceMode) {
      const mountainGeometry = new THREE.ConeGeometry(20, 12, 6); // Reduced segments
      const mountainMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x224455,
        roughness: 1,
        metalness: 0
      });
      
      // Reduce number of mountains
      const mountainPositions = [
        { x: -30, z: -40 },
        { x: 10, z: -42 },
        { x: 40, z: -44 }
      ];
      
      mountainPositions.forEach(pos => {
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(pos.x, 0, pos.z);
        mountain.scale.set(
          1 + Math.random() * 0.5, 
          0.8 + Math.random() * 0.7, 
          1 + Math.random() * 0.5
        );
        scene.add(mountain);
      });
    }

    // Add fewer trees with simplified geometry
    if (!performanceMode) {
      const createTree = (x: number, z: number) => {
        // Simplified trunk with fewer segments
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x5d4037,
          roughness: 0.9,
          metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 0.75, z);
        trunk.castShadow = true;
        scene.add(trunk);
        
        // Simplified foliage with fewer segments
        const foliageGeometry = new THREE.SphereGeometry(1.2, 8, 8); // Reduced from 16, 16
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x2e7d32,
          roughness: 1
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 2.5, z);
        foliage.scale.set(1, 1.2, 1);
        foliage.castShadow = true;
        scene.add(foliage);
      };
      
      // Place fewer trees with larger spacing
      for (let i = -20; i < 20; i += 8) { // Increased spacing from 4 to 8
        createTree(-5 - Math.random() * 8, i + Math.random() * 3);
        createTree(5 + Math.random() * 8, i + Math.random() * 3);
      }
    }

    // Create simplified train tracks
    const trackWidth = 1.5;
    const trackLength = 50;
    
    // Rails with simpler material
    const railGeometry = new THREE.BoxGeometry(0.2, 0.1, trackLength);
    const railMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888, 
      metalness: 0.9,
      roughness: 0.3
    });
    
    // Left rail
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(-trackWidth/2, 0.05, 0);
    if (!performanceMode) {
      leftRail.castShadow = true;
      leftRail.receiveShadow = true;
    }
    scene.add(leftRail);
    
    // Right rail
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(trackWidth/2, 0.05, 0);
    if (!performanceMode) {
      rightRail.castShadow = true;
      rightRail.receiveShadow = true;
    }
    scene.add(rightRail);
    
    // Add ballast stones with simpler material
    const ballastGeometry = new THREE.BoxGeometry(3, 0.1, trackLength);
    const ballastMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 1,
      metalness: 0.2
    });
    const ballast = new THREE.Mesh(ballastGeometry, ballastMaterial);
    ballast.position.set(0, 0, 0);
    if (!performanceMode) {
      ballast.receiveShadow = true;
    }
    scene.add(ballast);
    
    // Sleepers (railroad ties) with fewer instances
    const sleeperGeometry = new THREE.BoxGeometry(trackWidth + 0.6, 0.1, 0.8);
    const sleeperMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4d3319,
      roughness: 0.9
    });
    
    // Place sleepers with larger spacing for performance
    for (let i = -trackLength/2; i < trackLength/2; i += performanceMode ? 3 : 1.5) {
      const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
      sleeper.position.set(0, 0, i);
      if (!performanceMode) {
        sleeper.receiveShadow = true;
      }
      scene.add(sleeper);
    }

    // Add realistic station in front of the train
    // Move platform in front of the engine (first coach)
    const stationZ = -28; // In front of the first coach at z = -21
    const platformGeometry = new THREE.BoxGeometry(8, 0.8, 16);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: 0.8,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, 0.4, stationZ);
    if (!performanceMode) {
      platform.receiveShadow = true;
      platform.castShadow = true;
    }
    scene.add(platform);

    // Add platform roof
    const roofGeometry = new THREE.BoxGeometry(8, 0.15, 16);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.3
    });
    const platformRoof = new THREE.Mesh(roofGeometry, roofMaterial);
    platformRoof.position.set(0, 3, stationZ);
    platformRoof.receiveShadow = true;
    platformRoof.castShadow = true;
    scene.add(platformRoof);

    // Add platform supports
    const supportGeometry = new THREE.CylinderGeometry(0.13, 0.13, 2.7, 10);
    const supportMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.5,
      metalness: 0.7
    });
    for (let x = -3; x <= 3; x += 3) {
      for (let z = stationZ - 6; z <= stationZ + 6; z += 6) {
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(x, 1.7, z);
        support.receiveShadow = true;
        support.castShadow = true;
        scene.add(support);
      }
    }

    // Add benches on the platform
    const benchGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.4);
    const benchMaterial = new THREE.MeshStandardMaterial({
      color: 0x7d5a3a,
      roughness: 0.7
    });
    for (let i = -2; i <= 2; i += 2) {
      const bench = new THREE.Mesh(benchGeometry, benchMaterial);
      bench.position.set(-2, 0.6, stationZ + i * 2);
      scene.add(bench);
      const bench2 = new THREE.Mesh(benchGeometry, benchMaterial);
      bench2.position.set(2, 0.6, stationZ + i * 2);
      scene.add(bench2);
    }

    // Add station sign
    const signPostGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.1);
    const signBoardGeometry = new THREE.BoxGeometry(2.5, 0.4, 0.1);
    const signPostMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const signBoardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const signPost1 = new THREE.Mesh(signPostGeometry, signPostMaterial);
    signPost1.position.set(-1, 1.2, stationZ - 7.5);
    scene.add(signPost1);
    const signPost2 = new THREE.Mesh(signPostGeometry, signPostMaterial);
    signPost2.position.set(1, 1.2, stationZ - 7.5);
    scene.add(signPost2);
    const signBoard = new THREE.Mesh(signBoardGeometry, signBoardMaterial);
    signBoard.position.set(0, 1.7, stationZ - 7.5);
    scene.add(signBoard);
    // Add text to station sign (using CSS2DObject for simplicity)
    const signDiv = document.createElement('div');
    signDiv.textContent = 'Central Station';
    signDiv.style.background = 'rgba(255,255,255,0.95)';
    signDiv.style.color = '#222';
    signDiv.style.fontWeight = 'bold';
    signDiv.style.fontSize = '20px';
    signDiv.style.padding = '2px 12px';
    signDiv.style.borderRadius = '4px';
    signDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    const signLabel = new CSS2DObject(signDiv);
    signLabel.position.set(0, 1.9, stationZ - 7.5);
    scene.add(signLabel);

    // Add lamps for realism
    const lampPostGeometry = new THREE.CylinderGeometry(0.08, 0.1, 3, 8);
    const lampHeadGeometry = new THREE.SphereGeometry(0.18, 10, 10);
    const lampPostMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const lampHeadMaterial = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffcc, emissiveIntensity: 1.5 });
    for (let x of [-3.5, 3.5]) {
      for (let z of [stationZ - 5, stationZ + 5]) {
        const lampPost = new THREE.Mesh(lampPostGeometry, lampPostMaterial);
        lampPost.position.set(x, 2, z);
        scene.add(lampPost);
        const lampHead = new THREE.Mesh(lampHeadGeometry, lampHeadMaterial);
        lampHead.position.set(x, 3.5, z);
        scene.add(lampHead);
        // Add actual light
        const lampLight = new THREE.PointLight(0xffffcc, 0.7, 8);
        lampLight.position.set(x, 3.5, z);
        scene.add(lampLight);
      }
    }

    // Get coaches data
    const coachesData = getAllCoachesData();
    // Add more coaches for a longer train
    const coachPositions = [
      { position: new THREE.Vector3(0, 1, -21), id: coachesData[0].id },
      { position: new THREE.Vector3(0, 1, -14), id: coachesData[1].id },
      { position: new THREE.Vector3(0, 1, -7), id: coachesData[2].id },
      { position: new THREE.Vector3(0, 1, 0), id: coachesData[3].id },
      { position: new THREE.Vector3(0, 1, 7), id: coachesData[0].id + "-2" },
      { position: new THREE.Vector3(0, 1, 14), id: coachesData[1].id + "-2" },
      { position: new THREE.Vector3(0, 1, 21), id: coachesData[2].id + "-2" }
    ];

    // CSS2DObject for creating HTML labels with better styling
    const createCoachStatsLabel = (coachData: CoachData) => {
      const occupancyPercentage = Math.round((coachData.occupancy / coachData.capacity) * 100);
      
      const labelDiv = document.createElement('div');
      labelDiv.className = 'bg-black/80 text-white px-2 py-1 rounded text-xs pointer-events-auto';
      labelDiv.style.padding = '8px';
      labelDiv.style.borderRadius = '4px';
      labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      labelDiv.style.color = 'white';
      labelDiv.style.fontFamily = 'Arial, sans-serif';
      labelDiv.style.fontSize = '12px';
      labelDiv.style.width = '120px';
      labelDiv.style.opacity = '0';
      labelDiv.style.transition = 'opacity 0.3s ease';
      labelDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
      
      // Coach ID
      const idDiv = document.createElement('div');
      idDiv.textContent = `Coach ${coachData.id}`;
      idDiv.style.fontWeight = 'bold';
      idDiv.style.marginBottom = '4px';
      labelDiv.appendChild(idDiv);
      
      // Occupancy
      const occupancyDiv = document.createElement('div');
      occupancyDiv.textContent = `Occupancy: ${occupancyPercentage}%`;
      occupancyDiv.style.marginBottom = '2px';
      labelDiv.appendChild(occupancyDiv);
      
      // Security status
      const securityDiv = document.createElement('div');
      if (coachData.unauthorizedEntries > 0) {
        securityDiv.textContent = `⚠️ ${coachData.unauthorizedEntries} alerts`;
        securityDiv.style.color = '#ff4d4d';
      } else {
        securityDiv.textContent = `✓ Security clear`;
        securityDiv.style.color = '#4dff4d';
      }
      labelDiv.appendChild(securityDiv);
      
      // Features
      if (coachData.interiorFeatures) {
        const featuresDiv = document.createElement('div');
        featuresDiv.style.marginTop = '4px';
        featuresDiv.style.fontSize = '10px';
        
        if (coachData.interiorFeatures.hasWifi) {
          const wifiSpan = document.createElement('span');
          wifiSpan.textContent = 'WiFi';
          wifiSpan.style.backgroundColor = '#3366cc';
          wifiSpan.style.padding = '2px 4px';
          wifiSpan.style.borderRadius = '2px';
          wifiSpan.style.marginRight = '4px';
          featuresDiv.appendChild(wifiSpan);
        }
        
        const classSpan = document.createElement('span');
        classSpan.textContent = coachData.interiorFeatures.seatClass;
        classSpan.style.backgroundColor = '#996633';
        classSpan.style.padding = '2px 4px';
        classSpan.style.borderRadius = '2px';
        featuresDiv.appendChild(classSpan);
        
        labelDiv.appendChild(featuresDiv);
      }
      
      // Create and return the 2D label
      const cssObject = new CSS2DObject(labelDiv);
      cssObject.position.set(0, 3, 0);
      
      // Show label with delay
      setTimeout(() => {
        labelDiv.style.opacity = '1';
      }, 100);
      
      return cssObject;
    };

    // Create a hyper-realistic train coach model with PBR materials
    const createTrainCoach = (position: THREE.Vector3, coachData: CoachData, isEngine = false) => {
      const group = new THREE.Group();
      
      // Determine coach color based on occupancy with metallic finish
      const occupancyPercentage = coachData.occupancy / coachData.capacity;
      let coachColor;
      
      if (isEngine) {
        coachColor = 0x3366cc; // Engine is always blue
      } else if (occupancyPercentage > 0.8) {
        coachColor = 0xea384c; // Red for high occupancy
      } else if (occupancyPercentage > 0.5) {
        coachColor = 0xff9933; // Orange for medium occupancy
      } else {
        coachColor = 0x00aaff; // Blue for low occupancy
      }
      
      // Main coach body with rounded edges and PBR material
      const bodyGeometry = new THREE.BoxGeometry(2, 2, 6);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: coachColor,
        metalness: 0.7,
        roughness: 0.2,
        envMapIntensity: 1.0
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // Rounded front and back for coach with higher poly count
      const frontGeometry = new THREE.CylinderGeometry(1, 1, 2, 24, 2, false, -Math.PI/2, Math.PI);
      const frontMesh = new THREE.Mesh(frontGeometry, bodyMaterial);
      frontMesh.rotation.z = Math.PI / 2;
      frontMesh.position.z = -3;
      frontMesh.castShadow = true;
      group.add(frontMesh);
      
      const backGeometry = new THREE.CylinderGeometry(1, 1, 2, 24, 2, false, Math.PI/2, Math.PI);
      const backMesh = new THREE.Mesh(backGeometry, bodyMaterial);
      backMesh.rotation.z = Math.PI / 2;
      backMesh.position.z = 3;
      backMesh.castShadow = true;
      group.add(backMesh);
      
      // More detailed roof with proper curve and material
      const roofGeometry = new THREE.CylinderGeometry(1.1, 1.1, 6, 24, 2, false, 0, Math.PI);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 0.8
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.rotation.x = Math.PI / 2;
      roof.rotation.y = Math.PI;
      roof.position.y = 1.5;
      roof.castShadow = true;
      group.add(roof);
      
      // Enhanced windows with proper glass material
      const windowMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x88ccff,
        metalness: 0.2,
        roughness: 0.05,
        transparent: true,
        opacity: 0.9,
        transmission: 0.7,
        reflectivity: 0.7,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      
      // Window frames with metallic material
      const frameGeometry = new THREE.BoxGeometry(0.05, 0.9, 0.9);
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x555555,
        metalness: 0.9,
        roughness: 0.1
      });
      
      // Create detailed passenger silhouettes for windows
      const passengerGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.3);
      const passengerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9
      });
      
      // Side windows with passengers - more detailed
      for (let i = -2; i <= 2; i += 1) {
        if (isEngine && i === -2) continue; // Skip the front window for the engine
        
        // Window glass with proper size
        const windowGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.8);
        
        const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        leftWindow.position.set(-1.05, 0.2, i);
        group.add(leftWindow);
        
        // Window frames
        const leftFrameV = new THREE.Mesh(frameGeometry, frameMaterial);
        leftFrameV.position.set(-1.05, 0.2, i);
        group.add(leftFrameV);
        
        const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        rightWindow.position.set(1.05, 0.2, i);
        group.add(rightWindow);
        
        const rightFrameV = new THREE.Mesh(frameGeometry, frameMaterial);
        rightFrameV.position.set(1.05, 0.2, i);
        group.add(rightFrameV);
        
        // Add passengers in windows based on occupancy
        if (Math.random() < occupancyPercentage) {
          const leftPassenger = new THREE.Mesh(passengerGeometry, passengerMaterial);
          leftPassenger.position.set(-0.9, 0.1, i - 0.2 + Math.random() * 0.4);
          group.add(leftPassenger);
        }
        
        if (Math.random() < occupancyPercentage) {
          const rightPassenger = new THREE.Mesh(passengerGeometry, passengerMaterial);
          rightPassenger.position.set(0.9, 0.1, i - 0.2 + Math.random() * 0.4);
          group.add(rightPassenger);
        }
      }
      
      // If this is the engine, add more details for hyperrealism
      if (isEngine) {
        // Front window with better glass material
        const frontWindowGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.1);
        const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow.position.set(0, 0.2, -3.05);
        group.add(frontWindow);
        
        // Window frame with better detail
        const frontFrameH = new THREE.BoxGeometry(1.6, 0.05, 0.15);
        const frontFrameV = new THREE.BoxGeometry(0.05, 0.9, 0.15);
        
        const topFrame = new THREE.Mesh(frontFrameH, frameMaterial);
        topFrame.position.set(0, 0.65, -3.05);
        group.add(topFrame);
        
        const bottomFrame = new THREE.Mesh(frontFrameH, frameMaterial);
        bottomFrame.position.set(0, -0.25, -3.05);
        group.add(bottomFrame);
        
        const leftFrame = new THREE.Mesh(frontFrameV, frameMaterial);
        leftFrame.position.set(-0.8, 0.2, -3.05);
        group.add(leftFrame);
        
        const rightFrame = new THREE.Mesh(frontFrameV, frameMaterial);
        rightFrame.position.set(0.8, 0.2, -3.05);
        group.add(rightFrame);
        
        // Enhanced engine grill with better material
        const grillGeometry = new THREE.BoxGeometry(1.8, 0.8, 0.2);
        const grillMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x222222,
          metalness: 0.9,
          roughness: 0.3
        });
        const grill = new THREE.Mesh(grillGeometry, grillMaterial);
        grill.position.set(0, -0.6, -3);
        group.add(grill);
        
        // Enhanced headlights with proper emissive material
        const headlightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xffffcc,
          emissive: 0xffffcc,
          emissiveIntensity: 2.0
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.rotation.x = Math.PI / 2;
        leftHeadlight.position.set(-0.6, -0.2, -3.1);
        group.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.rotation.x = Math.PI / 2;
        rightHeadlight.position.set(0.6, -0.2, -3.1);
        group.add(rightHeadlight);
        
        // Add light beams for headlights
        const beamGeometry = new THREE.CylinderGeometry(0.05, 0.4, 2, 16);
        const beamMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffee,
          transparent: true,
          opacity: 0.2
        });
        
        const leftBeam = new THREE.Mesh(beamGeometry, beamMaterial);
        leftBeam.rotation.x = Math.PI / 2;
        leftBeam.position.set(-0.6, -0.2, -4);
        group.add(leftBeam);
        
        const rightBeam = new THREE.Mesh(beamGeometry, beamMaterial);
        rightBeam.rotation.x = Math.PI / 2;
        rightBeam.position.set(0.6, -0.2, -4);
        group.add(rightBeam);
      }
      
      // Connection between coaches with better detail
      if (!isEngine) {
        const connectionGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
        const connectionMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x333333,
          metalness: 0.8,
          roughness: 0.3
        });
        const connection = new THREE.Mesh(connectionGeometry, connectionMaterial);
        connection.rotation.z = Math.PI / 2;
        connection.position.z = -3.25;
        group.add(connection);
      }
      
      // Enhanced wheels with PBR materials
      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 24);
      const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.2
      });
      
      // Wheel details - hub with better material
      const hubGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.25, 16);
      const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.1
      });
      
      // Position wheels along the coach with better detail
      for (let i = -2; i <= 2; i += 2) {
        const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        leftWheel.rotation.z = Math.PI / 2;
        leftWheel.position.set(-trackWidth/2, -0.8, i);
        leftWheel.castShadow = true;
        group.add(leftWheel);
        
        const leftHub = new THREE.Mesh(hubGeometry, hubMaterial);
        leftHub.rotation.z = Math.PI / 2;
        leftHub.position.set(-trackWidth/2 - 0.15, -0.8, i);
        group.add(leftHub);
        
        const rightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        rightWheel.rotation.z = Math.PI / 2;
        rightWheel.position.set(trackWidth/2, -0.8, i);
        rightWheel.castShadow = true;
        group.add(rightWheel);
        
        const rightHub = new THREE.Mesh(hubGeometry, hubMaterial);
        rightHub.rotation.z = Math.PI / 2;
        rightHub.position.set(trackWidth/2 + 0.15, -0.8, i);
        group.add(rightHub);
        
        // Add axles between wheels
        const axleGeometry = new THREE.CylinderGeometry(0.07, 0.07, trackWidth, 12);
        const axleMaterial = new THREE.MeshStandardMaterial({
          color: 0x777777,
          metalness: 0.9,
          roughness: 0.2
        });
        
        const axle = new THREE.Mesh(axleGeometry, axleMaterial);
        axle.rotation.z = Math.PI / 2;
        axle.position.set(0, -0.8, i);
        group.add(axle);
        
        // Add suspension springs
        const springGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
        const springMaterial = new THREE.MeshStandardMaterial({
          color: 0x555555,
          metalness: 0.7,
          roughness: 0.3
        });
        
        const leftSpring = new THREE.Mesh(springGeometry, springMaterial);
        leftSpring.position.set(-trackWidth/2, -0.5, i);
        group.add(leftSpring);
        
        const rightSpring = new THREE.Mesh(springGeometry, springMaterial);
        rightSpring.position.set(trackWidth/2, -0.5, i);
        group.add(rightSpring);
      }
      
      // Add coach ID display with better materials
      const coachIdBoxGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
      const coachIdBoxMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3
      });
      const idBox = new THREE.Mesh(coachIdBoxGeometry, coachIdBoxMaterial);
      idBox.position.set(0, 0, -2.95);
      group.add(idBox);

      // Add highly detailed interior elements
      const createInteriorElements = () => {
        // Seats for passengers with better materials and detail
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatBackGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.1);
        let seatMaterial;
        
        // Different seat colors based on coach class
        if (coachData.interiorFeatures && coachData.interiorFeatures.seatClass === "first") {
          seatMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            roughness: 0.7,
            metalness: 0.1
          });
        } else {
          seatMaterial = new THREE.MeshStandardMaterial({
            color: 0x1A237E,
            roughness: 0.8,
            metalness: 0.0
          });
        }
        
        // Create rows of seats on each side with better arrangement
        for (let z = -2; z <= 2; z += 0.8) {
          if (z > -0.5 && z < 0.5) continue; // Skip middle for aisle
          
          // Left side seats
          const leftSeat = new THREE.Mesh(seatGeometry, seatMaterial);
          leftSeat.position.set(-0.7, -0.7, z);
          group.add(leftSeat);
          
          const leftSeatBack = new THREE.Mesh(seatBackGeometry, seatMaterial);
          leftSeatBack.position.set(-0.7, -0.3, z - 0.25);
          group.add(leftSeatBack);
          
          // Add armrests to seats
          const armrestGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.3);
          const armrestMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
          });
          
          const leftArmrest1 = new THREE.Mesh(armrestGeometry, armrestMaterial);
          leftArmrest1.position.set(-0.5, -0.5, z);
          group.add(leftArmrest1);
          
          const leftArmrest2 = new THREE.Mesh(armrestGeometry, armrestMaterial);
          leftArmrest2.position.set(-0.9, -0.5, z);
          group.add(leftArmrest2);
          
          // Right side seats
          const rightSeat = new THREE.Mesh(seatGeometry, seatMaterial);
          rightSeat.position.set(0.7, -0.7, z);
          group.add(rightSeat);
          
          const rightSeatBack = new THREE.Mesh(seatBackGeometry, seatMaterial);
          rightSeatBack.position.set(0.7, -0.3, z - 0.25);
          group.add(rightSeatBack);
          
          const rightArmrest1 = new THREE.Mesh(armrestGeometry, armrestMaterial);
          rightArmrest1.position.set(0.5, -0.5, z);
          group.add(rightArmrest1);
          
          const rightArmrest2 = new THREE.Mesh(armrestGeometry, armrestMaterial);
          rightArmrest2.position.set(0.9, -0.5, z);
          group.add(rightArmrest2);
          
          // Add headrests
          const headrestGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.1);
          
          const leftHeadrest = new THREE.Mesh(headrestGeometry, seatMaterial);
          leftHeadrest.position.set(-0.7, 0, z - 0.25);
          group.add(leftHeadrest);
          
          const rightHeadrest = new THREE.Mesh(headrestGeometry, seatMaterial);
          rightHeadrest.position.set(0.7, 0, z - 0.25);
          group.add(rightHeadrest);
        }
        
        // Add luggage racks
        const rackGeometry = new THREE.BoxGeometry(1.6, 0.05, 5);
        const rackMaterial = new THREE.MeshStandardMaterial({
          color: 0x777777,
          roughness: 0.4,
          metalness: 0.6
        });
        
        const leftRack = new THREE.Mesh(rackGeometry, rackMaterial);
        leftRack.position.set(-0.7, 0.8, 0);
        group.add(leftRack);
        
        const rightRack = new THREE.Mesh(rackGeometry, rackMaterial);
        rightRack.position.set(0.7, 0.8, 0);
        group.add(rightRack);
        
        // Add some luggage on racks
        const luggageGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
        const luggageColors = [0x8B4513, 0x2E4053, 0x4A235A, 0x1B2631];
        
        for (let i = -2; i < 2; i++) {
          if (Math.random() > 0.5) {
            const leftLuggage = new THREE.Mesh(
              luggageGeometry,
              new THREE.MeshStandardMaterial({
                color: luggageColors[Math.floor(Math.random() * luggageColors.length)],
                roughness: 0.9
              })
            );
            leftLuggage.position.set(-0.7, 1, i);
            leftLuggage.rotation.y = Math.random() * Math.PI / 4;
            group.add(leftLuggage);
          }
          
          if (Math.random() > 0.5) {
            const rightLuggage = new THREE.Mesh(
              luggageGeometry,
              new THREE.MeshStandardMaterial({
                color: luggageColors[Math.floor(Math.random() * luggageColors.length)],
                roughness: 0.9
              })
            );
            rightLuggage.position.set(0.7, 1, i);
            rightLuggage.rotation.y = Math.random() * Math.PI / 4;
            group.add(rightLuggage);
          }
        }
        
        // Enhanced aisle with better texturing
        const aisleGeometry = new THREE.BoxGeometry(0.6, 0.01, 5);
        const aisleMaterial = new THREE.MeshStandardMaterial({
          color: 0x666666,
          roughness: 0.7,
          metalness: 0.1
        });
        const aisle = new THREE.Mesh(aisleGeometry, aisleMaterial);
        aisle.position.set(0, -0.99, 0);
        group.add(aisle);
        
        // Interior lights with proper emission
        const lightGeometry = new THREE.BoxGeometry(1.8, 0.03, 0.1);
        const lightMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffee,
          emissive: 0xffffee,
          emissiveIntensity: 1.0
        });
        
        for (let z = -2; z <= 2; z += 1) {
          const ceilingLight = new THREE.Mesh(lightGeometry, lightMaterial);
          ceilingLight.position.set(0, 0.95, z);
          group.add(ceilingLight);
          
          // Add actual light sources
          const pointLight = new THREE.PointLight(0xffffee, 0.1, 3);
          pointLight.position.set(0, 0.9, z);
          group.add(pointLight);
        }
        
        // Add wall panels with better detail
        const wallPanelGeometry = new THREE.BoxGeometry(0.02, 1.7, 5.9);
        const wallPanelMaterial = new THREE.MeshStandardMaterial({
          color: 0xf0f0f0,
          roughness: 0.8
        });
        
        const leftWall = new THREE.Mesh(wallPanelGeometry, wallPanelMaterial);
        leftWall.position.set(-0.98, 0, 0);
        group.add(leftWall);
        
        const rightWall = new THREE.Mesh(wallPanelGeometry, wallPanelMaterial);
        rightWall.position.set(0.98, 0, 0);
        group.add(rightWall);
        
        // Add floor with better texture
        const floorGeometry = new THREE.BoxGeometry(1.95, 0.05, 5.95);
        const floorMaterial = new THREE.MeshStandardMaterial({
          color: 0x555555,
          roughness: 0.9,
          metalness: 0.1
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -1, 0);
        group.add(floor);
        
        // Add ceiling with better texture
        const ceilingGeometry = new THREE.BoxGeometry(1.95, 0.05, 5.95);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
          color: 0xdddddd,
          roughness: 0.8
        });
        
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.set(0, 0.95, 0);
        group.add(ceiling);
        
        // Add door between coaches
        const doorGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.1);
        const doorMaterial = new THREE.MeshStandardMaterial({
          color: 0x444444,
          roughness: 0.5,
          metalness: 0.5
        });
        
        const frontDoor = new THREE.Mesh(doorGeometry, doorMaterial);
        frontDoor.position.set(0, -0.2, -2.9);
        group.add(frontDoor);
        
        const backDoor = new THREE.Mesh(doorGeometry, doorMaterial);
        backDoor.position.set(0, -0.2, 2.9);
        group.add(backDoor);
        
        // Add emergency exit markings
        const exitSignGeometry = new THREE.PlaneGeometry(0.3, 0.1);
        const exitSignMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          side: THREE.DoubleSide
        });
        
        const leftExitSign = new THREE.Mesh(exitSignGeometry, exitSignMaterial);
        leftExitSign.position.set(-0.95, 0.4, 0);
        leftExitSign.rotation.y = Math.PI / 2;
        group.add(leftExitSign);
        
        const rightExitSign = new THREE.Mesh(exitSignGeometry, exitSignMaterial);
        rightExitSign.position.set(0.95, 0.4, 0);
        rightExitSign.rotation.y = -Math.PI / 2;
        group.add(rightExitSign);
      };
      
      // Create interior elements
      createInteriorElements();
      
      // Add coach stats label
      const statsLabel = createCoachStatsLabel(coachData);
      group.add(statsLabel);
      
      group.position.copy(position);
      scene.add(group);
      
      // Store the coach object for later reference
      coachObjectsRef.current[coachData.id] = group;
      
      return group;
    };
    
    // Create train consisting of coaches based on data
    coachPositions.forEach((coachPos, index) => {
      // Use modulo to cycle through available coach data for extra boxes
      const coachData = coachesData[index % coachesData.length];
      createTrainCoach(
        coachPos.position, 
        coachData, 
        index === 0 // First coach is the engine
      );
    });

    // Add smoke particles for engine with better effect
    const createSmokeParticles = () => {
      const engineCoach = coachObjectsRef.current[coachesData[0].id];
      if (!engineCoach) return;
      
      const smokeParticles = new THREE.Group();
      engineCoach.add(smokeParticles);
      smokeParticles.position.set(0, 2, -3);
      
      const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.6
      });
      
      // Create more particles for better effect
      const particles: THREE.Mesh[] = [];
      for (let i = 0; i < 15; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.5,
          (Math.random() - 0.5) * 0.2
        );
        particle.scale.set(
          0.5 + Math.random() * 0.5,
          0.5 + Math.random() * 0.5,
          0.5 + Math.random() * 0.5
        );
        smokeParticles.add(particle);
        particles.push(particle);
      }
      
      // Animate smoke particles with better effect
      const animateSmokeParticles = () => {
        particles.forEach((particle) => {
          // Move particles upward and fade out
          particle.position.y += 0.01;
          
          // Check if the material is a MeshStandardMaterial
          if (particle.material instanceof THREE.Material) {
            if (particle.position.y > 1) {
              particle.position.y = 0;
              particle.material.opacity = 0.6;
              
              // Randomize horizontal position when resetting
              particle.position.x = (Math.random() - 0.5) * 0.3;
              particle.position.z = (Math.random() - 0.5) * 0.3;
            } else {
              particle.material.opacity -= 0.005;
              
              // Add some swirl to the smoke
              particle.position.x += Math.sin(Date.now() * 0.001 + particle.position.y) * 0.002;
              particle.position.z += Math.cos(Date.now() * 0.002 + particle.position.y) * 0.002;
            }
          }
        });
      };
      
      return animateSmokeParticles;
    };
    
    const animateSmoke = createSmokeParticles();

    // Add interactive elements for manual rotation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Handle dragging for manual rotation
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };
        
        const newRotation = {
          x: cameraRotation.x + (deltaMove.y * 0.01),
          y: cameraRotation.y + (deltaMove.x * 0.01)
        };
        
        // Limit vertical rotation to prevent flipping
        newRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, newRotation.x));
        
        setCameraRotation(newRotation);
        setPreviousMousePosition({
          x: event.clientX,
          y: event.clientY
        });
      } else {
        // Update the picking ray with the camera and mouse position
        if (cameraRef.current) {
          raycaster.setFromCamera(mouse, cameraRef.current);
          
          // Calculate objects intersecting the picking ray
          const intersects = raycaster.intersectObjects(scene.children, true);
          
          let hoveredCoach: string | null = null;
          for (const intersect of intersects) {
            // Find which coach was intersected by traversing up the parent chain
            let parent: THREE.Object3D | null = intersect.object;
            while (parent && !Object.values(coachObjectsRef.current).includes(parent as THREE.Group)) {
              parent = parent.parent;
            }
            
            if (parent) {
              // Find the coach ID from the coachObjects map
              for (const [id, obj] of Object.entries(coachObjectsRef.current)) {
                if (obj === parent) {
                  hoveredCoach = id;
                  break;
                }
              }
              break;
            }
          }
          
          // Highlight the hovered coach
          setFocusedCoach(hoveredCoach);
          
          for (const [coachId, coachObj] of Object.entries(coachObjectsRef.current)) {
            // Highlight the hovered coach by scaling it up slightly
            if (coachId === hoveredCoach) {
              coachObj.scale.set(1.05, 1.05, 1.05);
            } else {
              coachObj.scale.set(1, 1, 1);
            }
          }
        }
      }
    };
    
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        setIsDragging(true);
        setAutoRotate(false); // Disable auto-rotate when manual rotation starts
        setPreviousMousePosition({
          x: event.clientX,
          y: event.clientY
        });
      }
    };
    
    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        setIsDragging(false);
      }
    };
    
    const onMouseClick = (event: MouseEvent) => {
      // Switch to interior view when clicking on a coach (only when not dragging)
      if (!isDragging && focusedCoach) {
        console.log("Clicked on coach:", focusedCoach);
        // Toggle view mode if a coach is clicked
        if (viewMode === "exterior") {
          setViewMode("interior");
          setCurrentInteriorCoach(focusedCoach);
        } else {
          setViewMode("exterior");
          setCurrentInteriorCoach(null);
        }
      }
    };
    
    // Add mouse wheel zoom functionality
    const onMouseWheel = (event: WheelEvent) => {
      if (cameraRef.current) {
        // Calculate new zoom level
        const zoomSpeed = 0.1;
        let newZoom = cameraRef.current.position.z + event.deltaY * 0.01 * zoomSpeed;
        
        // Limit zoom range
        newZoom = Math.max(5, Math.min(20, newZoom));
        cameraRef.current.position.z = newZoom;
      }
    };
    
    // Add double click to reset camera
    const onDoubleClick = () => {
      setCameraRotation({ x: 0, y: 0 });
      if (cameraRef.current) {
        cameraRef.current.position.z = 15;
      }
    };
    
    // Add key control for auto-rotation
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        setAutoRotate(!autoRotate);
      }
    };
    
    // Add mouse event listeners
    mountRef.current.addEventListener('mousemove', onMouseMove);
    mountRef.current.addEventListener('mousedown', onMouseDown);
    mountRef.current.addEventListener('mouseup', onMouseUp);
    mountRef.current.addEventListener('click', onMouseClick);
    mountRef.current.addEventListener('wheel', onMouseWheel);
    mountRef.current.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('keydown', onKeyDown);

    // Animation loop with optimized performance
    const animate = () => {
      // Apply camera rotation based on manual control
      if (cameraRef.current && viewMode === "exterior") {
        // Reset camera position for rotation
        cameraRef.current.position.x = 0;
        cameraRef.current.position.y = 5;
        cameraRef.current.position.z = 15;
        
        // Apply rotation
        cameraRef.current.position.y = 5 * Math.cos(cameraRotation.x);
        cameraRef.current.position.z = 15 * Math.cos(cameraRotation.x);
        
        // Rotate around y-axis (horizontal)
        cameraRef.current.position.x = 15 * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
        cameraRef.current.position.z = 15 * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
        
        // Look at the center
        cameraRef.current.lookAt(0, 0, 0);
      }
      
      // Apply auto-rotation if enabled - with throttled updates
      if (autoRotate && !isDragging && viewMode === "exterior") {
        setCameraRotation(prev => ({
          x: prev.x,
          y: prev.y + 0.005
        }));
      }
      
      // Animate smoke particles if not in performance mode
      if (animateSmoke && !performanceMode) {
        animateSmoke();
      }
      
      // Make the train move forward slightly for a dynamic effect
      if (sceneRef.current) {
        sceneRef.current.traverse(obj => {
          // Only move coach groups, not the scene itself
          if (obj instanceof THREE.Group && !(obj instanceof THREE.Scene)) {
            obj.position.z += 0.03; // Increase speed for a faster effect
            // Loop the coaches for endless effect
            if (obj.position.z > 25) {
              obj.position.z = -25;
            }
          }
        });
      }
      
      // Update camera position based on view mode
      if (viewMode === "interior" && currentInteriorCoach && coachObjectsRef.current[currentInteriorCoach]) {
        // Move camera inside the coach
        const coach = coachObjectsRef.current[currentInteriorCoach];
        if (cameraRef.current) {
          cameraRef.current.position.copy(coach.position);
          cameraRef.current.position.y += 0; // Eye level, moved lower to see more interior details
          
          // Look forward along the coach
          const target = new THREE.Vector3().copy(coach.position);
          target.z += 1; // Look toward the back of the coach
          cameraRef.current.lookAt(target);
        }
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        // Also render labels
        if (labelRendererRef.current) {
          labelRendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);

    // Handle window resize with throttling
    const handleResize = () => {
      if (!mountRef.current) return;
      
      if (cameraRef.current) {
        cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
      }
      
      if (rendererRef.current) {
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
      
      if (labelRendererRef.current) {
        labelRendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', onMouseMove);
        mountRef.current.removeEventListener('mousedown', onMouseDown);
        mountRef.current.removeEventListener('mouseup', onMouseUp);
        mountRef.current.removeEventListener('click', onMouseClick);
        mountRef.current.removeEventListener('wheel', onMouseWheel);
        mountRef.current.removeEventListener('dblclick', onDoubleClick);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (labelRendererRef.current && mountRef.current) {
        mountRef.current.removeChild(labelRendererRef.current.domElement);
      }
      
      // Cancel animation frame to prevent memory leaks
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [focusedCoach, viewMode, currentInteriorCoach, isDragging, previousMousePosition, cameraRotation, autoRotate, performanceMode]);

  return (
    <div 
      ref={mountRef} 
      className="relative h-[60vh] w-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 border border-blue-900 shadow-xl"
    >
      {/* View Mode Toggle - now a single toggle button */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60
            ${viewMode === "exterior" ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-gray-200 text-blue-900 hover:bg-blue-300"}
          `}
          onClick={() => {
            if (viewMode === "exterior") {
              // Instantly switch to interior of first coach
              setViewMode("interior");
              setCurrentInteriorCoach(Object.keys(coachObjectsRef.current)[0] || null);
            } else {
              setViewMode("exterior");
              setCurrentInteriorCoach(null);
            }
          }}
        >
          {viewMode === "exterior" ? "View Interior" : "View Exterior"}
        </button>
      </div>
      
      {/* Auto-Rotate Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium ${
            autoRotate 
              ? "bg-primary text-white" 
              : "bg-gray-700/50 text-gray-200"
          }`}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? "Stop Rotation" : "Auto Rotate"}
        </button>
      </div>
      
      {/* Performance Mode Toggle */}
      <div className="absolute top-16 left-4 z-10">
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium ${
            performanceMode 
              ? "bg-primary text-white" 
              : "bg-gray-700/50 text-gray-200"
          }`}
          onClick={() => {
            if (confirm("Changing performance mode requires a page refresh. Continue?")) {
              setPerformanceMode(!performanceMode);
              window.location.reload();
            }
          }}
        >
          {performanceMode ? "Performance Mode: ON" : "Performance Mode: OFF"}
        </button>
      </div>
      
      {/* View Info with enhanced instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/70 text-white px-4 py-2 rounded-md text-xs max-w-[300px]">
        {viewMode === "exterior" ? (
          <div className="space-y-1">
            <p className="font-semibold">Controls:</p>
            <p>• Click and drag to rotate the view</p>
            <p>• Scroll to zoom in/out</p>
            <p>• Double-click to reset view</p>
            <p>• Press 'R' key to toggle auto-rotation</p>
            <p>• Click a coach to enter interior view</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-semibold">Interior View:</p>
            <p>Viewing inside Coach {currentInteriorCoach}</p>
            <p>Click 'Exterior View' to return</p>
          </div>
        )}
      </div>
      
      {/* 3D Scene Controls: Camera, Zoom, Reset */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 items-end">
        <button
          aria-label="Reset Camera View"
          title="Reset Camera View"
          className="bg-white/80 hover:bg-blue-200 text-blue-900 rounded-full shadow p-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          tabIndex={0}
          onClick={() => {
            setCameraRotation({ x: 0, y: 0 });
            if (cameraRef.current) cameraRef.current.position.z = 15;
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-refresh-cw"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 5.36A9 9 0 0020.49 15"/></svg>
        </button>
        <button
          aria-label="Zoom In"
          title="Zoom In"
          className="bg-white/80 hover:bg-blue-200 text-blue-900 rounded-full shadow p-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          tabIndex={0}
          onClick={() => {
            if (cameraRef.current) cameraRef.current.position.z = Math.max(5, cameraRef.current.position.z - 1);
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button
          aria-label="Zoom Out"
          title="Zoom Out"
          className="bg-white/80 hover:bg-blue-200 text-blue-900 rounded-full shadow p-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          tabIndex={0}
          onClick={() => {
            if (cameraRef.current) cameraRef.current.position.z = Math.min(20, cameraRef.current.position.z + 1);
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-zoom-out"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button
          aria-label="Toggle Auto-Rotate"
          title="Toggle Auto-Rotate"
          className={`bg-white/80 hover:bg-blue-200 text-blue-900 rounded-full shadow p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${autoRotate ? 'ring-2 ring-blue-500' : ''}`}
          tabIndex={0}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-rotate-cw"><polyline points="23 4 23 10 17 10"/><path d="M1 10a9 9 0 0 1 17.32-4"/></svg>
        </button>
      </div>
    </div>
  );
}

