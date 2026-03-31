import "./styles.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const viewer = document.querySelector("#viewer");
const statusLabel = document.querySelector("#statusLabel");
const cameraButtons = [...document.querySelectorAll("#cameraControls .mode-button")];
const motionButtons = [...document.querySelectorAll("#motionControls .mode-button")];

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
viewer.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

const camera = new THREE.PerspectiveCamera(28, viewer.clientWidth / viewer.clientHeight, 0.01, 50);
scene.add(camera);

const stage = new THREE.Group();
scene.add(stage);

const keychainGroup = new THREE.Group();
stage.add(keychainGroup);

const ambient = new THREE.HemisphereLight(0xfffaf1, 0xb5c5db, 1.25);
scene.add(ambient);

const keyLight = new THREE.SpotLight(0xfff5e7, 90, 0, 0.55, 0.6);
keyLight.position.set(1.8, 2.4, 3.4);
keyLight.castShadow = false;
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x9de7ff, 14, 0, 2);
fillLight.position.set(-2.8, 1.8, 1.5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xb2ffe5, 16, 0, 2);
rimLight.position.set(2.2, -1.6, 0.8);
scene.add(rimLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.4, 64),
  new THREE.ShadowMaterial({ color: 0x83664f, opacity: 0.12 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.22;
floor.scale.set(1, 1, 0.72);
stage.add(floor);

const shadowDisc = new THREE.Mesh(
  new THREE.CircleGeometry(0.88, 64),
  new THREE.MeshBasicMaterial({
    color: 0xe7d2ba,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  })
);
shadowDisc.rotation.x = -Math.PI / 2;
shadowDisc.position.y = -0.215;
shadowDisc.scale.set(1.25, 0.82, 1);
stage.add(shadowDisc);

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 4),
  new THREE.MeshBasicMaterial({
    color: 0xfaf6ef,
    transparent: true,
    opacity: 0.96,
  })
);
backdrop.position.set(0, 0.9, -1.6);
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
  color: new THREE.Color("#edfaff"),
  transmission: 1,
  thickness: 0.45,
  roughness: 0.08,
  ior: 1.49,
  clearcoat: 0.7,
  clearcoatRoughness: 0.05,
  specularIntensity: 1,
  envMapIntensity: 1.45,
  attenuationDistance: 1.6,
  attenuationColor: new THREE.Color("#efffff"),
});

const acrylicCapMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#ffffff"),
  transmission: 1,
  thickness: 0.58,
  roughness: 0.02,
  ior: 1.49,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  specularIntensity: 1.25,
  envMapIntensity: 1.55,
  attenuationDistance: 1.1,
  attenuationColor: new THREE.Color("#ffffff"),
});

const printMaterial = new THREE.MeshStandardMaterial({
  map: printTexture,
  transparent: true,
  alphaTest: 0.1,
  roughness: 0.62,
  metalness: 0.02,
});

const whiteMaskMaterial = new THREE.MeshStandardMaterial({
  map: whiteTexture,
  transparent: true,
  alphaTest: 0.08,
  roughness: 0.88,
  metalness: 0,
  color: new THREE.Color("#ffffff"),
});

const edgeGlowMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#f6ffff"),
  transparent: true,
  opacity: 0.22,
  transmission: 0.92,
  thickness: 0.6,
  roughness: 0.12,
  ior: 1.35,
  envMapIntensity: 1.85,
  clearcoat: 0.25,
});

const cameraTargets = {
  hero: {
    position: new THREE.Vector3(0.58, 0.42, 2.65),
    lookAt: new THREE.Vector3(0, 0.05, 0),
  },
  front: {
    position: new THREE.Vector3(0, 0.15, 2.1),
    lookAt: new THREE.Vector3(0, 0.03, 0),
  },
  detail: {
    position: new THREE.Vector3(0.34, 0.38, 1.56),
    lookAt: new THREE.Vector3(0.08, 0.05, 0),
  },
};

let currentCameraView = "hero";
let autoSpin = true;
let rootModel;
const pointer = new THREE.Vector2(0, 0);
const targetCameraPosition = cameraTargets[currentCameraView].position.clone();
const targetLookAt = cameraTargets[currentCameraView].lookAt.clone();
const cameraLookAt = new THREE.Vector3();
const clock = new THREE.Clock();

const loader = new GLTFLoader();
loader.load(
  "./assets/1_3_keychain_3mm_puffy.glb",
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
      } else {
        child.material = acrylicBodyMaterial;
        child.renderOrder = 1;
      }
    });

    const box = new THREE.Box3().setFromObject(rootModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    rootModel.position.sub(center);
    const scale = 1.8 / Math.max(size.x, size.y);
    rootModel.scale.setScalar(scale);
    rootModel.rotation.x = THREE.MathUtils.degToRad(-12);
    rootModel.rotation.z = THREE.MathUtils.degToRad(-9);
    keychainGroup.add(rootModel);

    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.4),
      new THREE.MeshBasicMaterial({
        color: 0xb2fff0,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    aura.position.set(0.22, 0.08, -0.32);
    keychainGroup.add(aura);

    statusLabel.textContent = "Model ready";
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

function setCameraView(viewName) {
  currentCameraView = viewName;
  targetCameraPosition.copy(cameraTargets[viewName].position);
  targetLookAt.copy(cameraTargets[viewName].lookAt);
  cameraButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

cameraButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCameraView(button.dataset.view);
  });
});

motionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    autoSpin = button.dataset.spin === "on";
    motionButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });
  });
});

viewer.addEventListener("pointermove", (event) => {
  const rect = viewer.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
});

viewer.addEventListener("pointerleave", () => {
  pointer.set(0, 0);
});

function resize() {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();
setCameraView("hero");
camera.position.copy(targetCameraPosition);
camera.lookAt(targetLookAt);
cameraLookAt.copy(targetLookAt);

renderer.setAnimationLoop(() => {
  const elapsed = clock.getElapsedTime();

  targetCameraPosition.copy(cameraTargets[currentCameraView].position);
  targetCameraPosition.x += pointer.x * 0.08;
  targetCameraPosition.y += pointer.y * 0.06;

  targetLookAt.copy(cameraTargets[currentCameraView].lookAt);
  targetLookAt.x += pointer.x * 0.05;
  targetLookAt.y += pointer.y * 0.035;

  camera.position.lerp(targetCameraPosition, 0.065);
  cameraLookAt.lerp(targetLookAt, 0.08);
  camera.lookAt(cameraLookAt);

  if (rootModel) {
    const floatOffset = Math.sin(elapsed * 1.1) * 0.03;
    keychainGroup.position.y = floatOffset;

    if (autoSpin) {
      rootModel.rotation.y = THREE.MathUtils.lerp(
        rootModel.rotation.y,
        THREE.MathUtils.degToRad(18) + Math.sin(elapsed * 0.7) * 0.18,
        0.05
      );
    } else {
      rootModel.rotation.y = THREE.MathUtils.lerp(rootModel.rotation.y, pointer.x * 0.35, 0.08);
    }

    rootModel.rotation.x = THREE.MathUtils.lerp(
      rootModel.rotation.x,
      THREE.MathUtils.degToRad(-12) + pointer.y * 0.08,
      0.08
    );
    rootModel.rotation.z = THREE.MathUtils.lerp(
      rootModel.rotation.z,
      THREE.MathUtils.degToRad(-9) + pointer.x * 0.04,
      0.06
    );
  }

  shadowDisc.material.opacity = 0.3 + (Math.sin(elapsed * 1.1) * 0.04 + 0.04);
  shadowDisc.scale.x = 1.26 - Math.sin(elapsed * 1.1) * 0.04;
  shadowDisc.scale.y = 0.82 - Math.sin(elapsed * 1.1) * 0.02;

  renderer.render(scene, camera);
});
