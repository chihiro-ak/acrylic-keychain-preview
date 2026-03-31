import "./styles.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const viewer = document.querySelector("#viewer");
const statusLabel = document.querySelector("#statusLabel");

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;
viewer.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

const camera = new THREE.PerspectiveCamera(24, viewer.clientWidth / viewer.clientHeight, 0.01, 50);
camera.position.set(0.0, 0.28, 2.24);
scene.add(camera);

const stage = new THREE.Group();
scene.add(stage);

const keychainGroup = new THREE.Group();
stage.add(keychainGroup);

scene.add(new THREE.HemisphereLight(0xfff9f0, 0xb8c6d7, 1.45));

const keyLight = new THREE.DirectionalLight(0xffffff, 4.4);
keyLight.position.set(0.9, 2.1, 3.0);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xfff0dc, 3.1);
fillLight.position.set(-1.25, 1.3, 2.7);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xc8fbff, 9.5, 0, 2);
rimLight.position.set(1.6, -0.2, 1.7);
scene.add(rimLight);

const warmKick = new THREE.PointLight(0xffdcb8, 6.2, 0, 2);
warmKick.position.set(-1.1, -0.4, 1.4);
scene.add(warmKick);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.5, 64),
  new THREE.MeshBasicMaterial({
    color: 0xf7f3eb,
    transparent: true,
    opacity: 0.96,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.27;
floor.scale.set(1.18, 1, 0.82);
stage.add(floor);

const shadowDisc = new THREE.Mesh(
  new THREE.CircleGeometry(0.96, 64),
  new THREE.MeshBasicMaterial({
    color: 0xcab39a,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  })
);
shadowDisc.rotation.x = -Math.PI / 2;
shadowDisc.position.y = -0.265;
shadowDisc.scale.set(1.34, 0.86, 1);
stage.add(shadowDisc);

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 4),
  new THREE.MeshBasicMaterial({
    color: 0xfcfaf5,
    transparent: true,
    opacity: 0.98,
  })
);
backdrop.position.set(0, 0.8, -1.6);
scene.add(backdrop);

const textureLoader = new THREE.TextureLoader();
const printTexture = textureLoader.load("./assets/1_3_print_rgba.png");
const whiteTexture = textureLoader.load("./assets/1_3_white_rgba.png");

[printTexture, whiteTexture].forEach((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

const acrylicBodyMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#f3ffff"),
  transmission: 1,
  thickness: 0.55,
  roughness: 0.06,
  ior: 1.49,
  clearcoat: 0.8,
  clearcoatRoughness: 0.04,
  specularIntensity: 1.15,
  envMapIntensity: 1.6,
  attenuationDistance: 1.8,
  attenuationColor: new THREE.Color("#f3ffff"),
});

const acrylicCapMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#ffffff"),
  transmission: 1,
  thickness: 0.68,
  roughness: 0.018,
  ior: 1.49,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  specularIntensity: 1.3,
  envMapIntensity: 1.7,
  attenuationDistance: 1.2,
  attenuationColor: new THREE.Color("#ffffff"),
});

const edgeGlowMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#f7ffff"),
  transparent: true,
  opacity: 0.24,
  transmission: 0.96,
  thickness: 0.7,
  roughness: 0.09,
  ior: 1.37,
  envMapIntensity: 2,
  clearcoat: 0.28,
});

const whiteMaskMaterial = new THREE.MeshStandardMaterial({
  map: whiteTexture,
  transparent: true,
  alphaTest: 0.08,
  roughness: 0.88,
  metalness: 0,
  color: new THREE.Color("#ffffff"),
});

const printMaterial = new THREE.MeshStandardMaterial({
  map: printTexture,
  transparent: true,
  alphaTest: 0.08,
  roughness: 0.42,
  metalness: 0.02,
  color: new THREE.Color("#ffffff"),
});

const metalMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#d7dbe2"),
  metalness: 1,
  roughness: 0.16,
  envMapIntensity: 2.35,
  clearcoat: 0.36,
  clearcoatRoughness: 0.08,
});

let rootModel;
const cameraLookAt = new THREE.Vector3(0, 0.18, 0);
const targetLookAt = cameraLookAt.clone();
const clock = new THREE.Clock();

const loader = new GLTFLoader();
loader.load(
  "./assets/1_3_keychain_final.glb",
  (gltf) => {
    rootModel = gltf.scene;

    rootModel.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      child.castShadow = false;
      child.receiveShadow = false;

      const name = `${child.name} ${child.material?.name ?? ""}`.toLowerCase();
      if (name.includes("print")) {
        child.material = printMaterial;
        child.renderOrder = 4;
      } else if (name.includes("white")) {
        child.material = whiteMaskMaterial;
        child.renderOrder = 3;
      } else if (name.includes("frontcap")) {
        child.material = acrylicCapMaterial;
        child.renderOrder = 5;
      } else if (name.includes("shell")) {
        child.material = edgeGlowMaterial;
        child.renderOrder = 2;
      } else if (name.includes("material")) {
        child.material = metalMaterial;
        child.renderOrder = 6;
      } else {
        child.material = acrylicBodyMaterial;
        child.renderOrder = 1;
      }
    });

    const box = new THREE.Box3().setFromObject(rootModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    rootModel.position.sub(center);
    const scale = 1.92 / Math.max(size.x, size.y);
    rootModel.scale.setScalar(scale);
    rootModel.rotation.x = THREE.MathUtils.degToRad(-3);
    rootModel.rotation.y = 0;
    rootModel.rotation.z = THREE.MathUtils.degToRad(2.5);

    keychainGroup.add(rootModel);

    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2),
      new THREE.MeshBasicMaterial({
        color: 0xb7fff1,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    aura.position.set(0.1, 0.02, -0.32);
    keychainGroup.add(aura);

    statusLabel.textContent = "Front preview ready";
  },
  (event) => {
    if (event.total > 0) {
      statusLabel.textContent = `Loading ${(event.loaded / event.total * 100).toFixed(0)}%`;
    }
  },
  (error) => {
    console.error(error);
    statusLabel.textContent = "Failed to load model";
  }
);

function resize() {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();
camera.lookAt(targetLookAt);

renderer.setAnimationLoop(() => {
  const elapsed = clock.getElapsedTime();

  cameraLookAt.lerp(targetLookAt, 0.08);
  camera.lookAt(cameraLookAt);

  if (rootModel) {
    keychainGroup.position.y = Math.sin(elapsed * 0.65) * 0.01;
  }

  shadowDisc.material.opacity = 0.28 + (Math.sin(elapsed * 0.65) * 0.015 + 0.015);
  shadowDisc.scale.x = 1.32 - Math.sin(elapsed * 0.65) * 0.015;
  shadowDisc.scale.y = 0.84 - Math.sin(elapsed * 0.65) * 0.008;

  renderer.render(scene, camera);
});
