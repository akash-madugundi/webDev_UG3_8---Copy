import * as CANNON from 'cannon';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Import the GLTFLoader
import { createTornado, tornadoGroup,tornadoBody,removeTornado,startRain,stopRain,stopSound,isTornadoactive } from './tornado.js';
import { loadHome } from './room.js';

// Scene setup
export const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 3);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
let checkCaught=false;

const startTornadoButton = document.getElementById('startTornado');
startTornadoButton.addEventListener('click', () => {
  createTornado(scene, world);
});

loadHome(scene, world);
export let playerHealth = 100; // Initialize player's health
const healthBarContainer = document.createElement('div');
const healthBar = document.createElement('div');

// Style the health bar container
healthBarContainer.style.position = 'absolute';
healthBarContainer.style.bottom = '20px'; // Position at the bottom
healthBarContainer.style.left = '20px';   // Position to the left
healthBarContainer.style.width = '200px'; // Fixed width for container
healthBarContainer.style.height = '30px'; // Fixed height for container
healthBarContainer.style.border = '2px solid black';
healthBarContainer.style.backgroundColor = '#555'; // Darker background behind the health bar
healthBarContainer.style.borderRadius = '5px';

// Style the actual health bar
healthBar.style.height = '100%'; // Full height of the container
healthBar.style.width = '100%';  // Full width initially (100%)
healthBar.style.backgroundColor = 'green'; // Green to indicate health
healthBar.style.borderRadius = '5px';

// Add the health bar to the container and then the container to the document
healthBarContainer.appendChild(healthBar);
document.body.appendChild(healthBarContainer);


export function update(health) {
    playerHealth = Math.min(100, playerHealth + health);
}

export function refill_health() {
    playerHealth = 100; // Reset health for testing purposes
    // playerBody.position.set(0, 1.6, 0); // Reset player position (if applicable)
    healthBar.style.width = '100%'; // Reset health bar
    healthBar.style.backgroundColor = 'green'; // Reset health bar color
}
export function updateHealth() {
  // Calculate the health percentage
  const healthPercentage = Math.max(playerHealth, 0); // Prevent negative width
  healthBar.style.width = `${healthPercentage}%`;

  // Change color based on health level
  if (healthPercentage > 50) {
      healthBar.style.backgroundColor = 'green';
  } else if (healthPercentage > 25) {
      healthBar.style.backgroundColor = 'yellow';
  } else {
      healthBar.style.backgroundColor = 'red';
  }

  // If player's health reaches 0, end the game
  if (playerHealth <= 0) {
      alert('Game Over!');
      document.getElementById('go').innerHTML = "Stay away from the tornado!!";
      document.getElementById('gameOverPopup2').style.display = 'flex';
      removeTornado(scene,world);
      stopRain();
      stopSound();
      // restartGame();
      // refill_health(playerBody)
      playerHealth = 100; // Reset health for testing purposes
      playerBody.position.set(0, 1.6, 0); // Reset player position (if applicable)
      healthBar.style.width = '100%'; // Reset health bar
      healthBar.style.backgroundColor = 'green'; // Reset health bar color
      player.position.x=0;
      playerHealth=100;
  }
}

export function updateHealth2() {
  document.getElementById('go').innerHTML = "Game Over!!\nDont stay near vehicles with more surface area";
      document.getElementById('gameOverPopup2').style.display = 'flex';
      removeTornado(scene,world);
      stopRain();
      stopSound();
      // restartGame();
      // refill_health(playerBody)
      playerHealth = 100; // Reset health for testing purposes
      playerBody.position.set(0, 1.6, 0); // Reset player position (if applicable)
      healthBar.style.width = '100%'; // Reset health bar
      healthBar.style.backgroundColor = 'green'; // Reset health bar color
      player.position.x=0;
      playerHealth=100;
      // window.location.reload(true);
}
// Sky background color
scene.background = new THREE.Color(0x87ceeb); // Light blue sky color

// Ground setup
const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Greenish ground color
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lie flat
ground.receiveShadow = true;
scene.add(ground);

// Physics ground body
const groundBody = new CANNON.Body({
  mass: 0, // Static body
  position: new CANNON.Vec3(0, 0, 0), // Centered on the world origin
});
const groundShape = new CANNON.Plane();
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Controls
const controls = new PointerLockControls(camera, renderer.domElement);
document.addEventListener('click', () => controls.lock());

// Create Stones (within 100 radius)
function createStones() {
  const stoneGeometry = new THREE.SphereGeometry(0.05, 1, 1);  // Small stones
  const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Grey color

  for (let i = 0; i < 500; i++) {  // Create 50 stones
    const stoneMesh = new THREE.Mesh(stoneGeometry, stoneMaterial);
    const randomX = Math.random() * 100 - 50;  // Random position within 100 radius
    const randomZ = Math.random() * 100 - 50;  // Random position within 100 radius
    const randomY = 0.25;  // Slightly above the ground
    stoneMesh.position.set(randomX, randomY, randomZ);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    scene.add(stoneMesh);

    // Create physics for the stone
    const stoneBody = new CANNON.Body({
      mass: 1, // Stone mass
      position: new CANNON.Vec3(randomX, randomY, randomZ),  // Position based on random location
      shape: new CANNON.Sphere(0.05), // Physics shape (sphere with radius 0.5)
    });

    stoneBody.addShape(new CANNON.Sphere(0.05)); // The stone's shape in physics world

    // Make sure the stone body is added to the physics world
    world.addBody(stoneBody);

    // Sync stone mesh position with physics body position
    stoneMesh.userData.body = stoneBody;  // Store the physics body on the mesh for later updates
  }
}

// Call the function to create stones
createStones();

// Load Character Model
const gltfLoader = new GLTFLoader();
let mixer;
let actions = {};
let activeAction, previousAction;

// Player physics body
export let playerBody = null;
export let player = null; // Declare player variable
let texture1, texture2;

// Load the character model
gltfLoader.load('../../models/global_models/player2.glb', (gltf) => {
  player = gltf.scene;
  player.scale.set(0.5, 0.5, 0.5);
  player.rotation.y = Math.PI;
  scene.add(player);

  // Add physics body for the player
  const capsuleRadius = 0.25; // Player's radius (thickness)
  const capsuleHeight = 0.5; // Player's height

  const sphereTop = new CANNON.Sphere(0.25); // Top of the capsule
  const sphereBottom = new CANNON.Sphere(0); // Bottom of the capsule
  const cylinder = new CANNON.Cylinder(0, 0, capsuleHeight - 2 * capsuleRadius, 8); // The middle cylinder

  // Create playerBody with mass
  playerBody = new CANNON.Body({
    mass: 70, // Player mass
    position: new CANNON.Vec3(20, 0, 20),
    // position: new CANNON.Vec3(30, 0, 30), // Initial player position
    fixedRotation: true, 
    linearDamping: 0.3, 
    angularDamping: 0.3,
  });

  playerBody.addShape(sphereTop, new CANNON.Vec3(0, (capsuleHeight - capsuleRadius) / 2, 0));  
  playerBody.addShape(sphereBottom, new CANNON.Vec3(0, -(capsuleHeight - capsuleRadius) / 2, 0));
  playerBody.addShape(cylinder); // Add the cylinder in the middle

  world.addBody(playerBody);

  mixer = new THREE.AnimationMixer(player);
  const animations = gltf.animations;
  animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    actions[clip.name.toLowerCase()] = action;
  });
  activeAction = actions['idle'];
  activeAction.play();
});

// Player Movement
const keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
const jumpForce = 5;
const speed = { walk: 10, run: 8 };
let isMoving = false;
let isMoving_back = false;
let isRunning = false;
// Define the maximum jump height near the tornado
const randomJumpForceMin = 1;
const randomJumpForceMax = 3;
const tornadoProximityDistance = 15; // The distance within which the player should jump randomly

let yaw = 0;
const pitchLimit = Math.PI / 2 - 0.1;
let pitch = 0;
const radius = 3;
function handleKeyDown(event) {
  if (event.key === ' ' || event.key.toLowerCase() in keys) {
    if (event.key === ' ') {
      keys.space = true;
    } else {
      keys[event.key.toLowerCase()] = true;
    }
    isMoving = keys.w || keys.a || keys.d;
    isRunning = keys.shift;
    isMoving_back = keys.s;
  }
}

function handleKeyUp(event) {
  if (event.key === ' ' || event.key.toLowerCase() in keys) {
    if (event.key === ' ') {
      keys.space = false;
    } else {
      keys[event.key.toLowerCase()] = false;
    }
    isMoving = keys.w || keys.a || keys.d;
    isRunning = keys.shift;
    isMoving_back = keys.s;
  }
}

function handleMouseMove(event) {
  if (controls.isLocked) {
    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * (-0.002);
    pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));
  }
}

// Add event listeners only when checkCaught is false
function updateEventListeners() {
  if (!checkCaught) {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
  } else {
    // Remove event listeners when checkCaught becomes true
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('mousemove', handleMouseMove);
  }
}

// Call updateEventListeners whenever checkCaught changes

const clock = new THREE.Clock();

function animate() {
  // updateHealth();
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  world.step(1 / 60);
  if (mixer) mixer.update(delta);
  movePlayer();

  if (player) {
    player.position.copy(playerBody.position);
    player.quaternion.copy(playerBody.quaternion);

    const cameraX = player.position.x - radius * Math.sin(yaw) * Math.cos(pitch);
    const cameraY = player.position.y + radius * Math.sin(pitch);
    const cameraZ = player.position.z - radius * Math.cos(yaw) * Math.cos(pitch);

    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(player.position);
    player.rotation.y = yaw;
  }

    // Update stone mesh positions based on their physics bodies
    scene.traverse((object) => {
      if (object.userData.body) {  // Check if the object has an associated physics body
        const stoneBody = object.userData.body;
        object.position.copy(stoneBody.position);  // Sync mesh position with physics body
        object.quaternion.copy(stoneBody.quaternion);  // Sync mesh rotation with physics body
      }
    });

  renderer.render(scene, camera);
}

function movePlayer() {
  if (!player) return;

  let moveDirection = new THREE.Vector3();
  const forward = getPlayerForwardDirection();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  if (keys.s) moveDirection.add(forward);
  if (keys.w) moveDirection.add(forward.clone().negate());
  if (keys.d) moveDirection.add(right.clone().negate());
  if (keys.a) moveDirection.add(right);

  moveDirection.normalize();

  if (moveDirection.length() > 0) {
    const speedValue = isRunning ? speed.run : speed.walk;
    playerBody.velocity.x = moveDirection.x * speedValue;
    playerBody.velocity.z = moveDirection.z * speedValue;

    const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation, 0.1) + Math.PI;
  }

  if (keys.space) {
    if (keys.shift) {
      // Shift + Space: Fly upward
      playerBody.velocity.y = jumpForce; // Ascend upwards with a custom force
    } else if (playerBody.position.y <= 1.6) {
      // playerBody.velocity.y = jumpForce;
    }
  }

    // Check for proximity to the tornado and apply random jump
    checkTornadoProximity();

  playerBody.velocity.y = Math.max(playerBody.velocity.y, -20);
  updatePlayerAnimation();
}


// Function to check if the player is close to the tornado and make them jump randomly
// Set a constant for the swirl speed (adjust as needed)
// Constants to control the swirling effect and inward force
// Define parameters for circular motion
// Define parameters for circular motion
const circleRadius = 10; // Distance from the tornado center for circular motion
let angleAroundTornado = 0; // Initial angle in radians
const angularSpeed = 0.05; // Speed at which the player revolves around the tornado

function checkTornadoProximity() {
  if (!tornadoGroup || !player || !isTornadoactive) {updateEventListeners();checkCaught=false;return;}

  // Calculate distance from the player to the tornado
  const tornadoPos = tornadoGroup.position;
  const playerPos = player.position;

  const distanceToTornado = playerPos.distanceTo(tornadoPos);

  // If the player is within the proximity range of the tornado, start circular motion
  if (distanceToTornado < tornadoProximityDistance) {
    let newAction = actions['idle'];
    previousAction.fadeOut(0.2);
    activeAction.reset().fadeIn(0.2).play();
    activeAction = newAction;
    checkCaught=true;
    // Apply a random jump force vertically (optional for vertical movement)
    updateEventListeners();
    playerHealth -= 0.8;
    updateHealth();
    
    playerBody.velocity.x=0;
     playerBody.velocity.z=0;
    playerBody.velocity.y = THREE.MathUtils.randFloat(randomJumpForceMin, randomJumpForceMax);

    // Update the angle to make the player revolve around the tornado
    angleAroundTornado += angularSpeed;
   
    // Calculate new position relative to the tornado's current position
    player.position.y=3;
    player.position.x = tornadoPos.x + circleRadius ;
    player.position.z = tornadoPos.z + circleRadius ;
  }
  if(!(distanceToTornado < tornadoProximityDistance)&&checkCaught)
  {
    let newAction = actions['idle'];
    previousAction.fadeOut(0.2);
    activeAction.reset().fadeIn(0.2).play();
    playerBody.velocity.x=0;
     playerBody.velocity.z=0;
  }
}




function updatePlayerAnimation() {
  if (!player || !mixer) return;
  let newAction;

  if (isMoving) {
    if (isRunning) {
      newAction = actions['crawl']; // Play run animation
    } else {
      newAction = actions['walk_forward']; // Play walk animation
      // newAction = actions['run']; 
    }
  } 
  else if(isMoving_back){
    newAction = actions['walk_backward'];
  } 
  else {
    newAction = actions['idle']; // PlayerBplayerBody is idle
  }

  // If the new action is different from the active action, blend the animations
  if (newAction && newAction !== activeAction) {
    previousAction = activeAction;
    activeAction = newAction;

    // Smoothly blend between animations
    previousAction.fadeOut(0.2);
    activeAction.reset().fadeIn(0.2).play();
  }
}

// Get player forward direction
function getPlayerForwardDirection() {
  const forward = new THREE.Vector3(
    -Math.sin(player.rotation.y), 0, -Math.cos(player.rotation.y)
  );
  return forward.normalize();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
document.getElementById('restartGame').addEventListener('click', () => {
  player.position.x=0;
  player.position.z=0;
  playerBody.velocity.x=0;
    playerBody.velocity.z=0;
    checkCaught=false;
    updateEventListeners();
  restartGame();
});
export function restartGame()
{
  playerBody.position.set(0, 0, 0);
  if(checkCaught)
  {
    player.position.x=0;
    player.position.z=0;
    playerBody.velocity.x=0;
    playerBody.velocity.z=0;
    newAction = actions['idle'];
    previousAction.fadeOut(0.2);
    activeAction.reset().fadeIn(0.2).play();
    activeAction = newAction;
  }
  checkCaught=false;
  updateEventListeners();
    
  
  refill_health();
}

// Start the animation loop
animate();
