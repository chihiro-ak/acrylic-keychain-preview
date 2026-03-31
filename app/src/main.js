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
renderer.toneMappingExposure = 0.62;
viewer.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
scene.background = new THREE.Color("#dddddd");

const camera = new THREE.PerspectiveCamera(27, viewer.clientWidth / viewer.clientHeight, 0.01, 50);
camera.position.set(0.07, 0.08, 3.05);
scene.add(camera);

const stage = new THREE.Group();
scene.add(stage);

const keychainGroup = new THREE.Group();
stage.add(keychainGroup);

scene.add(new THREE.HemisphereLight(0xf0f0f0, 0x96a0af, 0.56));

const keyLight = new THREE.DirectionalLight(0xfff8f2, 1.22);
keyLight.position.set(1.7, 1.55, 2.7);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe3e8ef, 0.48);
fillLight.position.set(-1.75, 0.72, 2.1);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xd6f6ff, 1.05, 0, 2);
rimLight.position.set(1.05, 0.04, 1.05);
scene.add(rimLight);

const warmKick = new THREE.PointLight(0xffddba, 0.7, 0, 2);
warmKick.position.set(-1.05, -0.18, 1.0);
scene.add(warmKick);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.8, 96),
  new THREE.MeshStandardMaterial({
    color: 0xdedede,
    roughness: 0.14,
    metalness: 0.02,
    envMapIntensity: 0.26,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.36;
floor.scale.set(1.34, 1, 0.94);
stage.add(floor);

function createShadowTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size * 0.5,
    size * 0.52,
    size * 0.06,
    size * 0.5,
    size * 0.52,
    size * 0.42
  );
  gradient.addColorStop(0, "rgba(40, 36, 40, 0.34)");
  gradient.addColorStop(0.45, "rgba(40, 36, 40, 0.16)");
  gradient.addColorStop(1, "rgba(40, 36, 40, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const shadowDisc = new THREE.Mesh(
  new THREE.PlaneGeometry(2.3, 1.5),
  new THREE.MeshBasicMaterial({
    map: createShadowTexture(),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  })
);
shadowDisc.rotation.x = -Math.PI / 2;
shadowDisc.position.y = -0.355;
shadowDisc.position.z = 0.04;
stage.add(shadowDisc);

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 4),
  new THREE.MeshBasicMaterial({
    color: 0xdddddd,
  })
);
backdrop.position.set(0, 0.52, -1.8);
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
  color: new THREE.Color("#dcf1f2"),
  transmission: 0.2,
  thickness: 0.34,
  roughness: 0.16,
  ior: 1.49,
  clearcoat: 0.74,
  clearcoatRoughness: 0.06,
  specularIntensity: 0.82,
  envMapIntensity: 1.0,
  attenuationDistance: 1.2,
  attenuationColor: new THREE.Color("#d8f6f6"),
});

const acrylicCapMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#fbffff"),
  transmission: 0.26,
  thickness: 0.34,
  roughness: 0.065,
  ior: 1.49,
  clearcoat: 0.96,
  clearcoatRoughness: 0.035,
  specularIntensity: 0.94,
  envMapIntensity: 1.04,
  attenuationDistance: 1.2,
  attenuationColor: new THREE.Color("#ebffff"),
});

const edgeGlowMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#f7ffff"),
  transparent: true,
  opacity: 0.1,
  transmission: 0.22,
  thickness: 0.52,
  roughness: 0.18,
  ior: 1.37,
  envMapIntensity: 1.0,
  clearcoat: 0.24,
});

const whiteMaskMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  alphaMap: whiteTexture,
  alphaTest: 0.08,
  color: new THREE.Color("#ffffff"),
});

const printMaterial = new THREE.MeshBasicMaterial({
  map: printTexture,
  transparent: true,
  alphaTest: 0.08,
  color: new THREE.Color("#fcfcfc"),
});

const metalMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#c8cdd6"),
  metalness: 1,
  roughness: 0.12,
  envMapIntensity: 2.05,
  clearcoat: 0.24,
  clearcoatRoughness: 0.08,
});

let rootModel;
let reflectionModel;
const cameraLookAt = new THREE.Vector3(0.04, -0.06, 0);
const targetLookAt = cameraLookAt.clone();

const loader = new GLTFLoader();
loader.load(
  "./assets/1_3_keychain_final.glb",
  (gltf) => {
    try {
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
      rootModel.position.y = -0.02;
      const scale = 1.28 / Math.max(size.x, size.y);
      rootModel.scale.setScalar(scale);
      rootModel.rotation.x = THREE.MathUtils.degToRad(-14);
      rootModel.rotation.y = THREE.MathUtils.degToRad(12);
      rootModel.rotation.z = THREE.MathUtils.degToRad(1.4);

      keychainGroup.add(rootModel);

      reflectionModel = rootModel.clone(true);
      reflectionModel.traverse((child) => {
        if (!child.isMesh) {
          return;
        }
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.08;
        child.material.depthWrite = false;
        if ("roughness" in child.material) {
          child.material.roughness = 0.45;
        }
        if ("metalness" in child.material) {
          child.material.metalness = 0.02;
        }
      });
      reflectionModel.scale.y *= -1;
      reflectionModel.position.y = -0.68;
      reflectionModel.position.z = 0.02;
      reflectionModel.rotation.x = THREE.MathUtils.degToRad(-166);
      reflectionModel.rotation.y = THREE.MathUtils.degToRad(12);
      reflectionModel.rotation.z = THREE.MathUtils.degToRad(1.4);
      keychainGroup.add(reflectionModel);

      const aura = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 2.2),
        new THREE.MeshBasicMaterial({
          color: 0xb7fff1,
          transparent: true,
          opacity: 0.05,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      aura.position.set(0.06, -0.02, -0.32);
      keychainGroup.add(aura);

      statusLabel.textContent = "Front preview ready";
    } catch (error) {
      console.error(error);
      statusLabel.textContent = `Render error`;
    }
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
  camera.lookAt(targetLookAt);
  renderer.render(scene, camera);
});
