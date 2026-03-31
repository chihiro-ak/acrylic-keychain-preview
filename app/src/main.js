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
renderer.toneMappingExposure = 0.7;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewer.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
scene.background = new THREE.Color("#e3e3e3");

const camera = new THREE.PerspectiveCamera(27, viewer.clientWidth / viewer.clientHeight, 0.01, 50);
camera.position.set(0.02, 0.02, 3.12);
scene.add(camera);

const stage = new THREE.Group();
scene.add(stage);

const keychainGroup = new THREE.Group();
stage.add(keychainGroup);

scene.add(new THREE.HemisphereLight(0xf5f5f5, 0xa3abba, 0.54));

const keyLight = new THREE.DirectionalLight(0xfffaf5, 1.18);
keyLight.position.set(1.35, 1.8, 2.9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.bias = -0.00008;
keyLight.shadow.normalBias = 0.01;
keyLight.shadow.camera.left = -2;
keyLight.shadow.camera.right = 2;
keyLight.shadow.camera.top = 2;
keyLight.shadow.camera.bottom = -2;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 8;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe3e7ef, 0.42);
fillLight.position.set(-1.55, 0.72, 2.05);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xcff3ff, 1.22, 0, 2);
rimLight.position.set(1.1, 0.16, 1.2);
scene.add(rimLight);

const warmKick = new THREE.PointLight(0xffe0be, 0.52, 0, 2);
warmKick.position.set(-0.95, -0.1, 1.0);
scene.add(warmKick);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.8, 96),
  new THREE.MeshStandardMaterial({
    color: 0xe1e1e1,
    roughness: 0.18,
    metalness: 0.02,
    envMapIntensity: 0.32,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.36;
floor.scale.set(1.34, 1, 0.94);
stage.add(floor);

const shadowDisc = new THREE.Mesh(
  new THREE.PlaneGeometry(2.8, 1.8),
  new THREE.ShadowMaterial({
    color: 0x2a2427,
    opacity: 0.12,
  })
);
shadowDisc.rotation.x = -Math.PI / 2;
shadowDisc.position.y = -0.359;
shadowDisc.position.z = 0.04;
shadowDisc.receiveShadow = true;
stage.add(shadowDisc);

const softShadow = new THREE.Mesh(
  new THREE.CircleGeometry(1.2, 96),
  new THREE.MeshBasicMaterial({
    color: 0x645952,
    transparent: true,
    opacity: 0.06,
    depthWrite: false,
  })
);
softShadow.rotation.x = -Math.PI / 2;
softShadow.position.y = -0.358;
softShadow.position.z = 0.05;
softShadow.scale.set(1.18, 0.72, 1);
stage.add(softShadow);

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 4),
  new THREE.MeshBasicMaterial({
    color: 0xe3e3e3,
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

// Body stays readable from the front while using physical transmission for acrylic depth.
const acrylicBodyMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#e3fbfb"),
  transparent: true,
  opacity: 1,
  transmission: 0.9,
  thickness: 0.74,
  roughness: 0.1,
  metalness: 0,
  ior: 1.49,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  specularIntensity: 0.86,
  envMapIntensity: 1.18,
  attenuationDistance: 1.6,
  attenuationColor: new THREE.Color("#cbf4f4"),
});

const acrylicCapMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#fbffff"),
  transparent: true,
  opacity: 1,
  transmission: 0.94,
  thickness: 0.92,
  roughness: 0.05,
  metalness: 0,
  ior: 1.5,
  clearcoat: 0.96,
  clearcoatRoughness: 0.03,
  specularIntensity: 0.92,
  envMapIntensity: 1.24,
  attenuationDistance: 1.8,
  attenuationColor: new THREE.Color("#e9ffff"),
});

// Side shell gets slightly stronger reflections so the 3mm thickness reads from a near-front angle.
const edgeGlowMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#d9ffff"),
  transparent: true,
  opacity: 1,
  transmission: 0.92,
  thickness: 1.05,
  roughness: 0.08,
  metalness: 0,
  ior: 1.52,
  envMapIntensity: 1.45,
  clearcoat: 1,
  clearcoatRoughness: 0.025,
  attenuationDistance: 1.9,
  attenuationColor: new THREE.Color("#d7ffff"),
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
  color: new THREE.Color("#c7ccd5"),
  metalness: 1,
  roughness: 0.1,
  envMapIntensity: 1.9,
  clearcoat: 0.32,
  clearcoatRoughness: 0.06,
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

        child.castShadow = true;
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
      rootModel.position.y = -0.01;
      const scale = 1.22 / Math.max(size.x, size.y);
      rootModel.scale.setScalar(scale);
      rootModel.rotation.x = 0.12;
      rootModel.rotation.y = -0.32;
      rootModel.rotation.z = 0.015;

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
      reflectionModel.position.y = -0.7;
      reflectionModel.position.z = 0.03;
      reflectionModel.rotation.x = Math.PI - 0.12;
      reflectionModel.rotation.y = -0.32;
      reflectionModel.rotation.z = 0.015;
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
      aura.position.set(0.03, -0.03, -0.32);
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
