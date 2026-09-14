import * as THREE from 'three';

export interface CannonController {
  group: THREE.Group;
  turretYaw: THREE.Group;
  barrelPitch: THREE.Group;
  barrelMeshGroup: THREE.Group;
  laserBeam: THREE.Line;
  muzzleFlash: THREE.Mesh;
  muzzleLight: THREE.PointLight;
  aimAt: (target: THREE.Vector3) => void;
  triggerRecoil: () => void;
  update: (delta: number) => void;
  getMuzzlePosition: () => THREE.Vector3;
}

export function createCannonModel(): CannonController {
  const group = new THREE.Group();
  group.position.set(0, -5.8, 0);

  // Materials
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.25,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.15,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.7,
    roughness: 0.3,
  });

  const cyanGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  // Base platform
  const baseGeom = new THREE.CylinderGeometry(1.6, 2.0, 0.4, 32);
  const baseMesh = new THREE.Mesh(baseGeom, darkMetalMat);
  baseMesh.position.y = 0.2;
  group.add(baseMesh);

  // Base glow ring
  const ringGeom = new THREE.TorusGeometry(1.5, 0.06, 16, 32);
  const ringMesh = new THREE.Mesh(ringGeom, cyanGlowMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.41;
  group.add(ringMesh);

  // Turret Yaw Group (Rotates left/right around Y axis)
  const turretYaw = new THREE.Group();
  turretYaw.position.y = 0.4;
  group.add(turretYaw);

  // Turret body
  const turretBodyGeom = new THREE.CylinderGeometry(1.0, 1.2, 0.6, 24);
  const turretBody = new THREE.Mesh(turretBodyGeom, chromeMat);
  turretBody.position.y = 0.3;
  turretYaw.add(turretBody);

  // Dual side brackets
  const bracketGeom = new THREE.BoxGeometry(0.25, 0.8, 0.8);
  const leftBracket = new THREE.Mesh(bracketGeom, darkMetalMat);
  leftBracket.position.set(-0.75, 0.7, 0);
  turretYaw.add(leftBracket);

  const rightBracket = new THREE.Mesh(bracketGeom, darkMetalMat);
  rightBracket.position.set(0.75, 0.7, 0);
  turretYaw.add(rightBracket);

  // Pitch Pivot Group (Tilts up/down around X axis)
  const barrelPitch = new THREE.Group();
  barrelPitch.position.set(0, 0.8, 0);
  turretYaw.add(barrelPitch);

  // Recoil Group (Moves along barrel axis during firing)
  const barrelMeshGroup = new THREE.Group();
  barrelPitch.add(barrelMeshGroup);

  // Center pivot sphere
  const pivotSphereGeom = new THREE.SphereGeometry(0.55, 20, 20);
  const pivotSphere = new THREE.Mesh(pivotSphereGeom, goldAccentMat);
  barrelMeshGroup.add(pivotSphere);

  // Main cannon barrel (pointing along Z axis in local coordinates, e.g. +Z or -Z, or pointing up +Y then rotated)
  // Let's align forward direction with +Z or +Y
  // For easy math, let's have the barrel extend along +Y, or +Z.
  // Standard in Three.js lookAt: objects point along +Z or -Z.
  // Let's create barrel extending along -Z (forward into the screen):
  const barrelLength = 3.2;
  const barrelGeom = new THREE.CylinderGeometry(0.24, 0.32, barrelLength, 24);
  // Cylinder is along Y by default, rotate to lie along +Y or -Z
  barrelGeom.rotateX(Math.PI / 2);
  // Center cylinder so it starts at pivot (0,0,0) and extends forward in -Z
  barrelGeom.translate(0, 0, -barrelLength / 2);
  const barrelMesh = new THREE.Mesh(barrelGeom, darkMetalMat);
  barrelMeshGroup.add(barrelMesh);

  // Energy coil rings on the barrel
  for (let i = 0; i < 3; i++) {
    const ringDist = -0.8 - i * 0.8;
    const coilGeom = new THREE.TorusGeometry(0.38 - i * 0.02, 0.05, 12, 24);
    const coilMesh = new THREE.Mesh(coilGeom, cyanGlowMat);
    coilMesh.position.set(0, 0, ringDist);
    barrelMeshGroup.add(coilMesh);
  }

  // Muzzle brake
  const muzzleGeom = new THREE.CylinderGeometry(0.38, 0.28, 0.6, 24);
  muzzleGeom.rotateX(Math.PI / 2);
  muzzleGeom.translate(0, 0, -barrelLength - 0.3);
  const muzzleMesh = new THREE.Mesh(muzzleGeom, goldAccentMat);
  barrelMeshGroup.add(muzzleMesh);

  // Muzzle tip glowing ring
  const muzzleTipGeom = new THREE.TorusGeometry(0.26, 0.06, 12, 24);
  const muzzleTip = new THREE.Mesh(muzzleTipGeom, cyanGlowMat);
  muzzleTip.position.set(0, 0, -barrelLength - 0.6);
  barrelMeshGroup.add(muzzleTip);

  // Muzzle flash mesh (hidden by default)
  const flashGeom = new THREE.SphereGeometry(0.5, 16, 16);
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0,
  });
  const muzzleFlash = new THREE.Mesh(flashGeom, flashMat);
  muzzleFlash.position.set(0, 0, -barrelLength - 0.7);
  barrelMeshGroup.add(muzzleFlash);

  // Muzzle Point Light for shot illumination
  const muzzleLight = new THREE.PointLight(0x38bdf8, 0, 8);
  muzzleLight.position.set(0, 0, -barrelLength - 0.7);
  barrelMeshGroup.add(muzzleLight);

  // Laser aiming sight (line from muzzle extending forward)
  const laserLineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -barrelLength - 0.6),
    new THREE.Vector3(0, 0, -35),
  ]);
  const laserLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    linewidth: 1,
  });
  const laserBeam = new THREE.Line(laserLineGeom, laserLineMat);
  barrelMeshGroup.add(laserBeam);

  // Recoil state
  let recoilOffset = 0;
  let flashTimer = 0;

  const aimAt = (targetWorld: THREE.Vector3) => {
    // Convert target to local space relative to cannon base
    const localTarget = targetWorld.clone();
    group.worldToLocal(localTarget);

    // Calculate angle in XZ plane for yaw
    // Forward is -Z
    const angleYaw = Math.atan2(localTarget.x, -localTarget.z);
    turretYaw.rotation.y = angleYaw;

    // Pitch: angle in Y vs distance in XZ
    const distXZ = Math.sqrt(localTarget.x * localTarget.x + localTarget.z * localTarget.z);
    const anglePitch = -Math.atan2(localTarget.y - turretYaw.position.y - barrelPitch.position.y, distXZ);
    
    // Clamp pitch so cannon doesn't flip backwards
    barrelPitch.rotation.x = THREE.MathUtils.clamp(anglePitch, -Math.PI / 3, Math.PI / 12);
  };

  const triggerRecoil = () => {
    recoilOffset = 0.55; // Kick back along Z
    flashTimer = 0.12; // Muzzle flash duration
    flashMat.opacity = 1;
    muzzleLight.intensity = 5;
  };

  const update = (delta: number) => {
    // Spring recoil return
    if (recoilOffset > 0.001) {
      recoilOffset += (0 - recoilOffset) * Math.min(delta * 18, 1);
      barrelMeshGroup.position.z = recoilOffset;
    } else {
      barrelMeshGroup.position.z = 0;
    }

    // Flash fade
    if (flashTimer > 0) {
      flashTimer -= delta;
      const t = Math.max(flashTimer / 0.12, 0);
      flashMat.opacity = t;
      muzzleLight.intensity = t * 4;
      muzzleFlash.scale.setScalar(1 + (1 - t) * 1.5);
    } else {
      flashMat.opacity = 0;
      muzzleLight.intensity = 0;
    }
  };

  const getMuzzlePosition = (): THREE.Vector3 => {
    const v = new THREE.Vector3(0, 0, -barrelLength - 0.7);
    barrelMeshGroup.localToWorld(v);
    return v;
  };

  return {
    group,
    turretYaw,
    barrelPitch,
    barrelMeshGroup,
    laserBeam,
    muzzleFlash,
    muzzleLight,
    aimAt,
    triggerRecoil,
    update,
    getMuzzlePosition,
  };
}
