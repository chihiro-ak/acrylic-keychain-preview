import "./styles.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const viewer = document.querySelector("#viewer");
const statusLabel = document.querySelector("#statusLabel");
const searchParams = new URLSearchParams(window.location.search);

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
viewer.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
scene.background = new THREE.Color("#f3f3f1");

const camera = new THREE.PerspectiveCamera(27, viewer.clientWidth / viewer.clientHeight, 0.01, 50);
camera.position.set(0.03, 0, 3.28);
scene.add(camera);

const stage = new THREE.Group();
scene.add(stage);

const keychainGroup = new THREE.Group();
stage.add(keychainGroup);

scene.add(new THREE.HemisphereLight(0xffffff, 0xe4e4e0, 0.7));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.28);
keyLight.position.set(1.5, 1.65, 2.8);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xfaf8f5, 0.58);
fillLight.position.set(-1.4, 0.55, 2.1);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffffff, 0.9, 0, 2);
rimLight.position.set(1.2, 0.12, 1.1);
scene.add(rimLight);

const glossLight = new THREE.PointLight(0xffffff, 0.82, 0, 2);
glossLight.position.set(-0.25, 0.9, 1.45);
scene.add(glossLight);

const warmKick = new THREE.PointLight(0xfff4eb, 0.34, 0, 2);
warmKick.position.set(-0.92, -0.08, 1.0);
scene.add(warmKick);

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(256, 270, 30, 256, 270, 220);
  gradient.addColorStop(0, "rgba(34, 29, 31, 0.24)");
  gradient.addColorStop(0.42, "rgba(34, 29, 31, 0.12)");
  gradient.addColorStop(0.72, "rgba(34, 29, 31, 0.045)");
  gradient.addColorStop(1, "rgba(34, 29, 31, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const shadowTexture = createShadowTexture();

const shadowDisc = new THREE.Mesh(
  new THREE.PlaneGeometry(2.7, 1.9),
  new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  })
);
shadowDisc.position.set(0, -0.23, -0.42);
stage.add(shadowDisc);

const softShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 1.15),
  new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
  })
);
softShadow.position.set(0, -0.25, -0.3);
softShadow.scale.set(1.05, 0.7, 1);
stage.add(softShadow);

const textureLoader = new THREE.TextureLoader();
const printTexture = textureLoader.load("./assets/1_3_print_rgba.png");
const whiteTexture = textureLoader.load("./assets/1_3_white_rgba.png");

[printTexture, whiteTexture].forEach((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

// Body stays readable from the front while using physical transmission for acrylic depth.
const acrylicBodyMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#fbfbfa"),
  transparent: true,
  opacity: 1,
  transmission: 0.93,
  thickness: 0.76,
  roughness: 0.07,
  metalness: 0,
  ior: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  specularIntensity: 1,
  envMapIntensity: 1.34,
  attenuationDistance: 2,
  attenuationColor: new THREE.Color("#ffffff"),
});

const acrylicCapMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#ffffff"),
  transparent: true,
  opacity: 1,
  transmission: 0.94,
  thickness: 0.88,
  roughness: 0.04,
  metalness: 0,
  ior: 1.51,
  clearcoat: 1,
  clearcoatRoughness: 0.015,
  specularIntensity: 1.04,
  envMapIntensity: 1.38,
  attenuationDistance: 2,
  attenuationColor: new THREE.Color("#ffffff"),
});

// Side shell gets slightly stronger reflections so the 3mm thickness reads from a near-front angle.
const edgeGlowMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#ffffff"),
  transparent: true,
  opacity: 1,
  transmission: 0.95,
  thickness: 0.96,
  roughness: 0.035,
  metalness: 0,
  ior: 1.51,
  envMapIntensity: 1.42,
  clearcoat: 1,
  clearcoatRoughness: 0.01,
  specularIntensity: 1.08,
  attenuationDistance: 2.2,
  attenuationColor: new THREE.Color("#ffffff"),
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
  color: new THREE.Color("#f1eef4"),
  side: THREE.DoubleSide,
});

const metalMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#c7ccd5"),
  metalness: 1,
  roughness: 0.09,
  envMapIntensity: 1.75,
  clearcoat: 0.26,
  clearcoatRoughness: 0.06,
});

let rootModel;
const cameraLookAt = new THREE.Vector3(0.02, -0.03, 0);
const targetLookAt = cameraLookAt.clone();
const angleParam = searchParams.get("angle");
const initialYaw = THREE.MathUtils.clamp(angleParam === null ? -0.24 : Number(angleParam), -Math.PI, Math.PI);
const baseRotation = {
  x: 0.11,
  y: initialYaw,
  z: 0.012,
};
const rotationState = {
  current: initialYaw,
  target: initialYaw,
  velocity: 0,
  dragging: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  lastX: 0,
  horizontalIntent: false,
  locked: false,
};

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
      rootModel.position.y = 0;
      const scale = 1.15 / Math.max(size.x, size.y);
      rootModel.scale.setScalar(scale);
      rootModel.rotation.x = baseRotation.x;
      rootModel.rotation.y = baseRotation.y;
      rootModel.rotation.z = baseRotation.z;

      keychainGroup.add(rootModel);
      statusLabel.textContent = "Swipe left or right to rotate";
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

function wrapAngle(angle) {
  return THREE.MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI;
}

function onPointerDown(event) {
  rotationState.dragging = true;
  rotationState.pointerId = event.pointerId;
  rotationState.startX = event.clientX;
  rotationState.startY = event.clientY;
  rotationState.lastX = event.clientX;
  rotationState.horizontalIntent = false;
  rotationState.locked = false;
  rotationState.velocity = 0;
  viewer.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!rotationState.dragging || event.pointerId !== rotationState.pointerId) {
    return;
  }

  const deltaX = event.clientX - rotationState.startX;
  const deltaY = event.clientY - rotationState.startY;

  if (!rotationState.locked) {
    const travelX = Math.abs(deltaX);
    const travelY = Math.abs(deltaY);
    if (travelX < 8 && travelY < 8) {
      return;
    }
    rotationState.horizontalIntent = travelX > travelY;
    rotationState.locked = true;
  }

  if (!rotationState.horizontalIntent) {
    return;
  }

  const moveX = event.clientX - rotationState.lastX;
  rotationState.lastX = event.clientX;
  rotationState.velocity = moveX * 0.0024;
  rotationState.target = wrapAngle(rotationState.target + moveX * 0.0125);
  event.preventDefault();
}

function finishPointer(event) {
  if (rotationState.pointerId !== event.pointerId) {
    return;
  }
  rotationState.dragging = false;
  rotationState.pointerId = null;
  rotationState.locked = false;
  rotationState.horizontalIntent = false;
}

viewer.style.touchAction = "pan-y";
viewer.addEventListener("pointerdown", onPointerDown);
viewer.addEventListener("pointermove", onPointerMove);
viewer.addEventListener("pointerup", finishPointer);
viewer.addEventListener("pointercancel", finishPointer);
viewer.addEventListener("pointerleave", finishPointer);

renderer.setAnimationLoop(() => {
  if (!rotationState.dragging) {
    rotationState.target = wrapAngle(rotationState.target + rotationState.velocity);
    rotationState.velocity *= 0.92;
    if (Math.abs(rotationState.velocity) < 0.0001) {
      rotationState.velocity = 0;
    }
  }

  rotationState.current = THREE.MathUtils.lerp(rotationState.current, rotationState.target, 0.16);

  if (rootModel) {
    rootModel.rotation.y = rotationState.current;
  }

  camera.lookAt(targetLookAt);
  renderer.render(scene, camera);
});
