import * as THREE from 'three';

export interface Projectile {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  start: THREE.Vector3;
  target: THREE.Vector3;
  current: THREE.Vector3;
  progress: number;
  speed: number;
  onHit?: () => void;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface Shockwave {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  maxScale: number;
}

export class ParticleSystem {
  scene: THREE.Scene;
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  shockwaves: Shockwave[] = [];

  // Reusable geometries & materials for fast performance
  projectileGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8);
  projectileMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  fragmentGeoms = [
    new THREE.TetrahedronGeometry(0.22),
    new THREE.BoxGeometry(0.24, 0.24, 0.24),
    new THREE.DodecahedronGeometry(0.2),
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // Orient cylinder along Z axis
    this.projectileGeom.rotateX(Math.PI / 2);
  }

  spawnLaserBolt(start: THREE.Vector3, target: THREE.Vector3, onHit?: () => void) {
    const mesh = new THREE.Mesh(this.projectileGeom, this.projectileMat);
    mesh.position.copy(start);
    mesh.lookAt(target);

    const light = new THREE.PointLight(0x38bdf8, 3, 6);
    light.position.copy(start);
    this.scene.add(mesh);
    this.scene.add(light);

    const dist = start.distanceTo(target);
    // Speed tuned so bolt takes ~0.09s to arrive (fast and satisfying)
    const speed = Math.max(dist / 0.09, 60);

    this.projectiles.push({
      mesh,
      light,
      start: start.clone(),
      target: target.clone(),
      current: start.clone(),
      progress: 0,
      speed,
      onHit,
    });
  }

  spawnWordExplosion(pos: THREE.Vector3, isTrueCluster: boolean) {
    // 1. Shockwave ring
    const ringGeom = new THREE.RingGeometry(0.3, 0.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isTrueCluster ? 0x38bdf8 : 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.position.copy(pos);
    this.scene.add(ringMesh);
    this.shockwaves.push({
      mesh: ringMesh,
      life: 0,
      maxLife: 0.35,
      maxScale: isTrueCluster ? 5.5 : 3.5,
    });

    // 2. Crystal / Gem fragments
    const particleCount = isTrueCluster ? 24 : 14;
    const colors = isTrueCluster
      ? [0x38bdf8, 0x60a5fa, 0xfacc15, 0x34d399, 0xffffff]
      : [0xef4444, 0xf97316, 0x71717a];

    for (let i = 0; i < particleCount; i++) {
      const geom = this.fragmentGeoms[Math.floor(Math.random() * this.fragmentGeoms.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);

      // Random outwards spherical explosion velocity
      const angleTheta = Math.random() * Math.PI * 2;
      const anglePhi = (Math.random() - 0.5) * Math.PI;
      const speed = 4 + Math.random() * 9;

      const vx = Math.cos(anglePhi) * Math.cos(angleTheta) * speed;
      const vy = Math.sin(anglePhi) * speed + 1.5;
      const vz = Math.cos(anglePhi) * Math.sin(angleTheta) * speed * 0.5;

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(vx, vy, vz),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        ),
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
      });
    }
  }

  update(delta: number) {
    // 1. Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const totalDist = p.start.distanceTo(p.target);
      const step = (p.speed * delta) / totalDist;
      p.progress += step;

      if (p.progress >= 1) {
        // Arrived at target
        if (p.onHit) p.onHit();
        this.scene.remove(p.mesh);
        this.scene.remove(p.light);
        p.mesh.geometry.dispose();
        this.projectiles.splice(i, 1);
      } else {
        p.current.lerpVectors(p.start, p.target, p.progress);
        p.mesh.position.copy(p.current);
        p.light.position.copy(p.current);
      }
    }

    // 2. Update fragments
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.life += delta;

      if (part.life >= part.maxLife) {
        this.scene.remove(part.mesh);
        if (Array.isArray(part.mesh.material)) {
          part.mesh.material.forEach((m) => m.dispose());
        } else {
          part.mesh.material.dispose();
        }
        this.particles.splice(i, 1);
      } else {
        const progress = part.life / part.maxLife;
        // Gravity
        part.velocity.y -= 9.8 * delta;
        part.mesh.position.addScaledVector(part.velocity, delta);
        part.mesh.rotation.x += part.rotationSpeed.x * delta;
        part.mesh.rotation.y += part.rotationSpeed.y * delta;
        part.mesh.rotation.z += part.rotationSpeed.z * delta;

        // Fade scale
        const scale = (1 - progress);
        part.mesh.scale.setScalar(scale);
      }
    }

    // 3. Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += delta;

      if (sw.life >= sw.maxLife) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        (sw.mesh.material as THREE.Material).dispose();
        this.shockwaves.splice(i, 1);
      } else {
        const t = sw.life / sw.maxLife;
        const currentScale = 1 + t * sw.maxScale;
        sw.mesh.scale.set(currentScale, currentScale, 1);
        (sw.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.9;
      }
    }
  }

  clear() {
    this.projectiles.forEach((p) => {
      this.scene.remove(p.mesh);
      this.scene.remove(p.light);
    });
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.shockwaves.forEach((s) => this.scene.remove(s.mesh));
    this.projectiles = [];
    this.particles = [];
    this.shockwaves = [];
  }
}
