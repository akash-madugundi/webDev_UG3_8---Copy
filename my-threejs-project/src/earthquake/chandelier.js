import * as THREE from 'three';
import * as CANNON from 'cannon';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { chandelier, chandelierBody,stones } from './globals.js';
import { playerBody, directionalLight, directionalLight2,texture1,texture2,plane1 } from './main.js'; // Assuming `directionalLight` is global
import {  rstgame , first_aid_box1,first_aid_box2,scene} from './main.js';
import { loadStones, updateStones, removeStones ,refill_health} from './Stones.js';
import { crack1,crack2,crack3,crack4,floor2,floor3,floor4,floor5,floor6,floor7 } from './main.js';

let earthquakeActive = false; // Flag to control earthquake
let earthquakeInterval;
let earthqk;
let earthquakeSound; // Reference to earthquake sound
let thudSound;
let soundOn = true; // Flag to track if sound is on

let earthquakeStartTime = 0; // Used for oscillating light
const earthquakeDuration = 10000; // Earthquake duration in milliseconds
const maxDimIntensity = 0.1;
const maxBrightIntensity = 1.5;
const oscillationSpeed = 0.05; // Speed of light oscillation

// Button to toggle sound on/off
const soundToggleBtn = document.getElementById('soundToggleBtn');
soundToggleBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggleBtn.innerHTML = soundOn ? 'Turn Sound Off' : 'Turn Sound On';
  if (!soundOn && earthquakeSound) {
    earthquakeSound.pause();
  } else if (soundOn && earthquakeActive) {
    earthquakeSound.play();
  }
});
// Load the earthquake sound
function loadEarthquakeSound() {
  earthquakeSound = new Audio('../../sounds/earthquake.mp3');
  earthquakeSound.loop = true; // Loop the sound during the earthquake
  thudSound = new Audio('../sounds/thud.mp3'); // Load the thud sound
}

// Button to drop chandelier
const dropChandelierBtn = document.getElementById('dropChandelierBtn');
dropChandelierBtn.addEventListener('click', () => {
  const chandelierPosition = window.chandelier.position;
  const playerPosition = playerBody.position;

  // Check if player's x and z positions match chandelier's x and z positions
  const isDirectlyBelow = Math.abs(playerPosition.x) - Math.abs(chandelierPosition.x) < 0.8 &&
    Math.abs(playerPosition.z) - Math.abs(chandelierPosition.z) < 0.8;
    
  setTimeout(() => {
    dropChandelier();
  }, 30000);

  if (isDirectlyBelow) {
    console.log("Dropping chandelier");
  } else {
    console.log("Player is not directly below the chandelier.");
  }
});

// Load the chandelier model
export function loadChandelier(scene, world) {
  const chandelierLoader = new GLTFLoader();

  chandelierLoader.load('../../models/earthquake/chandelier.glb', (gltf) => {
    window.chandelier = gltf.scene;
    window.chandelier.scale.set(0.0004, 0.0004, 0.0004);
    window.chandelier.position.set(0, 4.5, -0.85);
    window.chandelier.castShadow = true;
    scene.add(window.chandelier);

    const chandelierShape = new CANNON.Box(new CANNON.Vec3(0.8, 1, 0.8));
    window.chandelierBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 4.5, -0.85)
    });
    window.chandelierBody.addShape(chandelierShape);
    world.addBody(window.chandelierBody);
  }, undefined, (error) => {
    console.error('An error occurred while loading the chandelier model:', error);
  });
}
let a = 0;

export function dropChandelier(world, scene) {
  const fallDuration = 1;
  const initialY = window.chandelier.position.y;
  const targetY = 1;

  const startTime = performance.now();

  function animate2() {
    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / 1000;
    const t = Math.min(elapsedTime / fallDuration, 1);

    window.chandelier.position.y = initialY - ((initialY - targetY) * t);

    if (t < 1) {
      requestAnimationFrame(animate2);
    } else {
      // Start the earthquake effect
      const playerPosition = playerBody.position;
      const chandelierPosition = window.chandelier.position;

      const isNear = Math.abs(playerPosition.x) - Math.abs(chandelierPosition.x) < 0.8 &&
        Math.abs(playerPosition.z) - Math.abs(chandelierPosition.z) < 0.8;

      window.chandelierBody.position.set(
        window.chandelier.position.x,
        window.chandelier.position.y,
        window.chandelier.position.z
      );
      window.chandelierBody.mass = 1;
      window.chandelierBody.updateMassProperties();

      // Play thud sound if sound is on
      if (soundOn && thudSound) {
        thudSound.play();
      }

      if (isNear) {
        document.getElementById('go').innerHTML = "You Lost";
      } else {
        document.getElementById('go').innerHTML = "You Won";
      }
      document.getElementById('restartButton').innerHTML = "Restart";
      document.getElementById('gameOverPopup').style.display = 'flex';
    }
  }
  if (earthquakeActive)
    animate2();
}

// Function to simulate earthquake effect
export function startEarthquake(world, scene) {
  earthquakeActive = true;
  earthquakeStartTime = performance.now();
  let shakeStrength = 0.1;

  // Play earthquake sound if sound is on
  if (soundOn && earthquakeSound) {
    earthquakeSound.play();
  }

  // planeShape.map = texture1; 
  // Change to earthquake texture
        // planeShape.needsUpdate = true; 
        // Notify Three.js to update the material
  crack1.visible = true;
  crack2.visible = true;
  crack3.visible = true;
  crack4.visible = true;

  floor2.visible = false;
  floor3.visible = false;
  floor4.visible = false;
  floor5.visible = false;
  floor6.visible = false;
  floor7.visible = false;


  earthquakeInterval = setInterval(() => {
    if (earthquakeActive) {
      const shakeX = (Math.random() - 0.5) * shakeStrength;
      const shakeY = (Math.random() - 0.5) * shakeStrength;

      // Apply shaking to player's position or camera
      playerBody.position.x += shakeX;
      playerBody.position.z += shakeY;

      // Oscillate light intensity using a sine wave
      const elapsedTime = performance.now() - earthquakeStartTime;
      const oscillation = Math.sin(elapsedTime * oscillationSpeed) * 0.5 + 0.5;
      const intensity = THREE.MathUtils.lerp(maxDimIntensity, maxBrightIntensity, oscillation);

      directionalLight.intensity = intensity;
      directionalLight2.intensity = intensity;
      // You can also apply shaking to other objects in the scene if needed
    }
    else {
      removeStones(world)
    }
  }, 50);
  earthqk = setInterval(() => {
    if (earthquakeActive) {
      loadStones(scene, world)
    }
  }, 50);
}

// Stop the earthquake
function stopEarthquake() {
  earthquakeActive = false;
  clearInterval(earthquakeInterval);
  clearInterval(earthqk);

  // Stop earthquake sound
  if (earthquakeSound) {
    earthquakeSound.pause();
    earthquakeSound.currentTime = 0; // Reset the sound to the beginning
  }

  // plane1.material = new THREE.MeshBasicMaterial({ map:texture2 });
  // plane1.material.map=texture2;
  // // Change to earthquake texture
  //       plane1.material.needsUpdate = true; 
        // Notify Three.js to update the material

  if (crack1)  crack1.visible = false;
  if (crack2) crack2.visible = false;
  if (crack3) crack3.visible = false;
  if(crack4) crack4.visible = false;

  if(floor2) floor2.visible = true;
  if(floor3) floor3.visible = true;
  if(floor4) floor4.visible = true;
  if(floor5) floor5.visible = true;
  if(floor6) floor6.visible = true;
  if(floor7) floor7.visible = true;

  // Reset light intensity
  directionalLight.intensity = 1; // Reset to normal intensity
  directionalLight2.intensity = 1; // Reset to normal intensity
}

// Event listener for the restart button
document.getElementById('restartButton').addEventListener('click', () => {
  restartGame();
});

export function restartGame() {
  scene.add(first_aid_box1);
  document.getElementById('gameOverPopup').style.display = 'none';
  scene.add(first_aid_box2);
  // document.getElementById('gameOverPopup').style.display = 'none';

  // Reset the chandelier position
  if (window.chandelier) {
    window.chandelier.position.set(0, 4.5, -0.85);
    window.chandelierBody.position.set(0, 4.5, -0.85);
    window.chandelierBody.mass = 0;
  }

  // Reset player position and stop earthquake
  playerBody.position.set(0, 1, 0);
  stopEarthquake(); // Stop the earthquake effect
  rstgame();
  refill_health();
}

// Load the earthquake sound when the page loads
window.addEventListener('load', loadEarthquakeSound);
