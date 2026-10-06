import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('laia3d');
const status = document.getElementById('model3dStatus');
if (!container) throw new Error('No se encontró el visor 3D de LAIA.');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07130d);

const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 1000);
camera.position.set(0, 1.1, 4.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 1.4;
controls.maxDistance = 7;
controls.target.set(0, 1, 0);
controls.rotateSpeed = 0.75;
controls.zoomSpeed = 0.8;

// Solo permitimos explorar el frente y los perfiles laterales.
// 0 rad = frente; valores negativos/positivos llevan a izquierda/derecha.
// Al llegar al límite, el visor se detiene antes de mostrar la parte trasera.
controls.minAzimuthAngle = -1.38; // ~79° hacia la izquierda
controls.maxAzimuthAngle = 1.38;  // ~79° hacia la derecha
controls.minPolarAngle = 0.75;
controls.maxPolarAngle = 2.15;

scene.add(new THREE.HemisphereLight(0xffffff, 0x163d27, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 3.2);
key.position.set(3, 5, 4);
scene.add(key);
const rim = new THREE.DirectionalLight(0x8cffb8, 2.2);
rim.position.set(-4, 2, -3);
scene.add(rim);

const loader = new FBXLoader();
let model;

function frameModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2.25 / maxDim;
  object.scale.setScalar(scale);
  object.position.sub(center.multiplyScalar(scale));
  const scaledBox = new THREE.Box3().setFromObject(object);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
  object.position.x -= scaledCenter.x;
  object.position.y -= scaledBox.min.y - 0.05;
  object.position.z -= scaledCenter.z;
  controls.target.set(0, (scaledBox.max.y - scaledBox.min.y) * 0.45, 0);
  camera.position.set(0, (scaledBox.max.y - scaledBox.min.y) * 0.52, 3.2);
  controls.update();
}

loader.load(
  'assets/models/LAIA/AVATARLAIAO.fbx',
  (object) => {
    model = object;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
        }
      }
    });
    frameModel(model);
    scene.add(model);
    status.textContent = 'Listo · explora a LAIA';
    status.classList.add('ready');
  },
  (event) => {
    if (event.total) {
      status.textContent = `Cargando modelo… ${Math.round(event.loaded / event.total * 100)}%`;
    }
  },
  (error) => {
    console.error('No se pudo cargar el FBX de LAIA:', error);
    status.textContent = 'No se pudo cargar el modelo 3D. Revisa que el FBX y la textura estén en la carpeta del proyecto.';
    status.classList.add('error');
  }
);

function resize() {
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 520;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
window.addEventListener('resize', resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
