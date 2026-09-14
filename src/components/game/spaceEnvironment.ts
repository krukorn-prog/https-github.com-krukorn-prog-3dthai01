import * as THREE from 'three';

export interface SpaceEnvironment {
  group: THREE.Group;
  update: (delta: number, elapsedTime: number) => void;
  dispose: () => void;
}

interface AsteroidItem {
  mesh: THREE.Mesh;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  baseY: number;
  bobSpeed: number;
  bobOffset: number;
  driftX: number;
}

export function createSpaceEnvironment(): SpaceEnvironment {
  const group = new THREE.Group();

  // 1. Deep Space Nebulae (layered translucent spheres/sprites or glow discs)
  const nebulaColors = [
    { color: 0x3b82f6, x: -14, y: 7, z: -25, scale: 22 },   // Blue nebula
    { color: 0x8b5cf6, x: 15, y: -6, z: -28, scale: 25 },   // Purple nebula
    { color: 0xec4899, x: 0, y: 12, z: -32, scale: 20 },    // Pink/magenta nebula
    { color: 0x06b6d4, x: -18, y: -8, z: -22, scale: 18 },  // Cyan nebula
  ];

  const nebulaDiscs: THREE.Mesh[] = [];
  const discGeom = new THREE.PlaneGeometry(1, 1);

  nebulaColors.forEach((cfg) => {
    // Canvas texture for radial nebula glow
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      const hex = cfg.color.toString(16).padStart(6, '0');
      grad.addColorStop(0, `#${hex}88`);
      grad.addColorStop(0.4, `#${hex}44`);
      grad.addColorStop(0.8, `#${hex}11`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(discGeom, mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.scale.set(cfg.scale, cfg.scale, 1);
    group.add(mesh);
    nebulaDiscs.push(mesh);
  });

  // 2. Distant Celestial Planet with Glow Ring
  const planetGroup = new THREE.Group();
  planetGroup.position.set(16, 8, -26);

  // Planet body
  const planetGeom = new THREE.SphereGeometry(4.2, 32, 32);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.7,
    metalness: 0.1,
    emissive: 0x0f172a,
  });
  const planetMesh = new THREE.Mesh(planetGeom, planetMat);
  planetGroup.add(planetMesh);

  // Planet rings
  const ringGeom = new THREE.RingGeometry(5.2, 8.5, 48);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
    roughness: 0.5,
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.rotation.x = Math.PI * 0.42;
  ringMesh.rotation.y = Math.PI * 0.12;
  planetGroup.add(ringMesh);

  // Distant glowing moon
  const moonGeom = new THREE.SphereGeometry(1.2, 20, 20);
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    roughness: 0.6,
    emissive: 0x854d0e,
  });
  const moonMesh = new THREE.Mesh(moonGeom, moonMat);
  moonMesh.position.set(-8, 3, 2);
  planetGroup.add(moonMesh);

  group.add(planetGroup);

  // 3. 3D Asteroids Floating Field (อุกกาบาตลอยในอวกาศ)
  // We procedurally create textured, faceted low-poly asteroids using Dodecahedron / Icosahedron
  const asteroids: AsteroidItem[] = [];
  const asteroidCount = 14;

  const asteroidColors = [0x52525b, 0x71717a, 0x475569, 0x64748b, 0x3f3f46];

  for (let i = 0; i < asteroidCount; i++) {
    // Generate randomized deformed rock geometry
    const baseRadius = 0.7 + Math.random() * 1.5;
    const geom = new THREE.DodecahedronGeometry(baseRadius, 1);

    // Deform vertices slightly to make it look like a cratered jagged asteroid
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const vertex = new THREE.Vector3();
    for (let v = 0; v < posAttr.count; v++) {
      vertex.fromBufferAttribute(posAttr, v);
      // Displace slightly along normal
      const noise = (Math.sin(vertex.x * 4) + Math.cos(vertex.y * 4) + Math.sin(vertex.z * 4)) * 0.18;
      vertex.multiplyScalar(1 + noise);
      posAttr.setXYZ(v, vertex.x, vertex.y, vertex.z);
    }
    geom.computeVertexNormals();

    const color = asteroidColors[Math.floor(Math.random() * asteroidColors.length)];
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true,
    });

    const mesh = new THREE.Mesh(geom, mat);

    // Position asteroids around perimeter or background so they don't block targets
    // Left side, right side, and top/bottom depths
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (8.5 + Math.random() * 10);
    const y = -7 + Math.random() * 15;
    const z = -4 - Math.random() * 16;

    mesh.position.set(x, y, z);
    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    group.add(mesh);

    asteroids.push({
      mesh,
      rotSpeedX: (Math.random() - 0.5) * 0.5,
      rotSpeedY: (Math.random() - 0.5) * 0.5,
      rotSpeedZ: (Math.random() - 0.5) * 0.4,
      baseY: y,
      bobSpeed: 0.3 + Math.random() * 0.5,
      bobOffset: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.1,
    });
  }

  // 4. Shooting stars / Meteors (occasional dynamic streaks in background)
  const meteorCount = 3;
  const meteors: { mesh: THREE.Mesh; speed: number; reset: () => void }[] = [];
  const meteorGeom = new THREE.CylinderGeometry(0.04, 0.0, 3.5, 8);
  meteorGeom.rotateZ(Math.PI / 4); // Angle streak

  for (let m = 0; m < meteorCount; m++) {
    const meteorMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const meteorMesh = new THREE.Mesh(meteorGeom, meteorMat);

    const reset = () => {
      meteorMesh.position.set(
        15 + Math.random() * 10,
        12 + Math.random() * 8,
        -15 - Math.random() * 10
      );
    };
    reset();
    group.add(meteorMesh);

    meteors.push({
      mesh: meteorMesh,
      speed: 18 + Math.random() * 10,
      reset,
    });
  }

  const update = (delta: number, elapsedTime: number) => {
    // Rotate planet slowly
    planetGroup.rotation.y = elapsedTime * 0.04;
    moonMesh.position.x = Math.sin(elapsedTime * 0.2) * 9;
    moonMesh.position.z = Math.cos(elapsedTime * 0.2) * 4;

    // Rotate and bob each asteroid
    for (let i = 0; i < asteroids.length; i++) {
      const ast = asteroids[i];
      ast.mesh.rotation.x += ast.rotSpeedX * delta;
      ast.mesh.rotation.y += ast.rotSpeedY * delta;
      ast.mesh.rotation.z += ast.rotSpeedZ * delta;
      ast.mesh.position.y = ast.baseY + Math.sin(elapsedTime * ast.bobSpeed + ast.bobOffset) * 0.6;
    }

    // Move meteors diagonally across sky
    for (let m = 0; m < meteors.length; m++) {
      const meteor = meteors[m];
      meteor.mesh.position.x -= meteor.speed * delta;
      meteor.mesh.position.y -= meteor.speed * 0.75 * delta;

      if (meteor.mesh.position.x < -25 || meteor.mesh.position.y < -15) {
        meteor.reset();
      }
    }
  };

  const dispose = () => {
    discGeom.dispose();
    nebulaDiscs.forEach((d) => {
      if (Array.isArray(d.material)) d.material.forEach((m) => m.dispose());
      else d.material.dispose();
    });

    planetGeom.dispose();
    planetMat.dispose();
    ringGeom.dispose();
    ringMat.dispose();
    moonGeom.dispose();
    moonMat.dispose();

    asteroids.forEach((a) => {
      a.mesh.geometry.dispose();
      if (Array.isArray(a.mesh.material)) a.mesh.material.forEach((m) => m.dispose());
      else a.mesh.material.dispose();
    });

    meteorGeom.dispose();
  };

  return {
    group,
    update,
    dispose,
  };
}
