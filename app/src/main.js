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
renderer.toneMappingExposure = 0.9;
viewer.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

const camera = new THREE.PerspectiveCamera(27, viewer.clientWidth / viewer.clientHeight, 0.01, 50);
camera.position.set(0.04, 0.14, 2.72);
scene.add(camera);

const stage = new THREE.Group();
scene.add(stage);

const keychainGroup = new THREE.Group();
stage.add(keychainGroup);

scene.add(new THREE.HemisphereLight(0xf7f3ec, 0x9fb2c8, 1.02));

const keyLight = new THREE.DirectionalLight(0xfff7ef, 2.2);
keyLight.position.set(1.2, 1.8, 2.8);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe5eefc, 1.15);
fillLight.position.set(-1.5, 1.0, 2.1);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xbcefff, 3.4, 0, 2);
rimLight.position.set(1.35, 0.3, 1.25);
scene.add(rimLight);

const warmKick = new THREE.PointLight(0xffd9b0, 1.8, 0, 2);
warmKick.position.set(-1.0, -0.25, 1.0);
scene.add(warmKick);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.5, 64),
  new THREE.MeshBasicMaterial({
    color: 0xf0ebe4,
    transparent: true,
    opacity: 0.96,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.32;
floor.scale.set(1.28, 1, 0.88);
stage.add(floor);

const shadowDisc = new THREE.Mesh(
  new THREE.CircleGeometry(0.96, 64),
  new THREE.MeshBasicMaterial({
    color: 0x9b8570,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  })
);
shadowDisc.rotation.x = -Math.PI / 2;
shadowDisc.position.y = -0.315;
shadowDisc.scale.set(1.42, 0.92, 1);
stage.add(shadowDisc);

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 4),
  new THREE.MeshBasicMaterial({
    color: 0xf1ece4,
    transparent: true,
    opacity: 1,
  })
);
backdrop.position.set(0, 0.68, -1.6);
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
  color: new THREE.Color("#e8f6f6"),
  transmission: 0.82,
  thickness: 0.38,
  roughness: 0.18,
  ior: 1.49,
  clearcoat: 0.55,
  clearcoatRoughness: 0.08,
  specularIntensity: 0.85,
  envMapIntensity: 1.05,
  attenuationDistance: 1.8,
  attenuationColor: new THREE.Color("#dbf6f7"),
});

const acrylicCapMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#fdfefe"),
  transmission: 0.88,
  thickness: 0.45,
  roughness: 0.08,
  ior: 1.49,
  clearcoat: 0.8,
  clearcoatRoughness: 0.06,
  specularIntensity: 0.95,
  envMapIntensity: 1.1,
  attenuationDistance: 1.2,
  attenuationColor: new THREE.Color("#f6ffff"),
});

const edgeGlowMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#f7ffff"),
  transparent: true,
  opacity: 0.14,
  transmission: 0.8,
  thickness: 0.52,
  roughness: 0.2,
  ior: 1.37,
  envMapIntensity: 1.1,
  clearcoat: 0.18,
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
  roughness: 0.56,
  metalness: 0.02,
  color: new THREE.Color("#fcfcfc"),
});

const metalMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#c8cdd6"),
  metalness: 1,
  roughness: 0.22,
  envMapIntensity: 1.7,
  clearcoat: 0.24,
  clearcoatRoughness: 0.08,
});

let rootModel;
const cameraLookAt = new THREE.Vector3(0.03, -0.02, 0);
const targetLookAt = cameraLookAt.clone();

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
    rootModel.position.y = -0.08;
    const scale = 1.42 / Math.max(size.x, size.y);
    rootModel.scale.setScalar(scale);
    rootModel.rotation.x = THREE.MathUtils.degToRad(-8);
    rootModel.rotation.y = THREE.MathUtils.degToRad(8);
    rootModel.rotation.z = THREE.MathUtils.degToRad(1.5);

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
    aura.position.set(0.04, -0.04, -0.32);
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
  cameraLookAt.lerp(targetLookAt, 0.08);
  camera.lookAt(cameraLookAt);

  renderer.render(scene, camera);
});
