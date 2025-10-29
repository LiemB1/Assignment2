const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const fill = ['#FEE715', '#FBEAEB', '#F9E795', '#FCF6F5', '#FFFFFF', '#CADCFC', '#EA738D'];
const stroke = ['#101820', '#2F3C7E', '#F96167', '#990011', '#8AAAE5', '#00246B', '#89ABE3'];

let velocityX = 0;
let velocityY = 0;
let score = 0;
let timeRemaining = 0;
let gameActive = false;
let timerInterval = null;
let animationId = null;
const collectSound = new Audio('Audios/collect.mp3');//ref: https://pixabay.com/sound-effects/search/game/
const music = new Audio('Audios/music-loop.mp3');//ref: https://pixabay.com/sound-effects/search/game/
music.loop = true;

class Garbage {
  constructor(left, top, fill, stroke) {
    this.left = left;
    this.top = top;
    this.fill = fill;
    this.stroke = stroke;
    this.size = 25;
  }

  draw() {
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(this.left, this.top, this.size, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  move() {
    // Move left
    this.left -= 3.5;

    // Randomly grow or shrink a little
    if (Math.random() < 0.05) { // 5% chance each frame
      const change = getRandomInteger(-4, 4);
      this.size = Math.max(15, Math.min(40, this.size + change));
    }

    // Respawn if off the left side
    if (this.left < -this.size) {
      this.respawn();
    }
  }

  respawn() {
    this.left = 760;
    this.top = getRandomInteger(200, 480);
    this.fill = fill[getRandomInteger(0, fill.length - 1)];
    this.stroke = stroke[getRandomInteger(0, stroke.length - 1)];
    this.size = getRandomInteger(20, 35);
  }
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const man1 = new Image();
const man2 = new Image();
man1.src = 'Images/man1.png';
man2.src = 'Images/man2.png';

let currentMan = man1;
let manX = 10;
let manY = 200;
let currentFrame = 1;
let frameCounter = 0;
let imagesLoaded = false;
let facingLeft = false;

man1.onload = () => {
  imagesLoaded = true;
  drawScene();
};

// Create garbage objects
const garbageItems = [];
for (let i = 0; i < 5; i++) {
  garbageItems.push(
    new Garbage(760, getRandomInteger(200, 480), fill[getRandomInteger(0, fill.length - 1)], stroke[getRandomInteger(0, stroke.length - 1)])
  );
}

// Draw everything
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  garbageItems.forEach(g => g.draw());
  
  // Draw character
  if (imagesLoaded) {
    ctx.save();
    if (facingLeft) {
      ctx.scale(-1, 1);
      ctx.drawImage(currentMan, -manX - 90, manY, 90, 120);
    } 
    else {
      ctx.drawImage(currentMan, manX, manY, 90, 120);
    }
    ctx.restore();
  } 
}

// Collision detection
function isColliding(garbage) {
  const dx = Math.abs((manX + 45) - garbage.left);
  const dy = Math.abs((manY + 60) - garbage.top);
  return dx < 50 && dy < 60;  
}

// Collect garbage
function collectGarbage() {
  if (!gameActive) return;
  for (const g of garbageItems) {
    if (isColliding(g)) {
      collectSound.currentTime = 0;
      collectSound.play();
      g.respawn();
      score++;
      document.getElementById('score').textContent = 'Score: ' + score;
      break;
    }
  }
}

// while game runs it loops
function gameLoop() {
  if (!gameActive) return;
  
  // Update player position
  manX += velocityX;
  manY += velocityY;

  // Keep player within bounds
  if (manX < 10) manX = 10;
  if (manX > 700) manX = 700;
  if (manY < 110) manY = 110;
  if (manY > 380) manY = 380;

  // Move garbage each frame
  garbageItems.forEach(g => g.move());

  // Animate character
  if (velocityX !== 0 || velocityY !== 0) {
    frameCounter++;
    if (frameCounter % 5 === 0) {
      currentFrame = currentFrame === 1 ? 2 : 1;
      currentMan = currentFrame === 1 ? man1 : man2;
    }
  }

  drawScene();
  animationId = requestAnimationFrame(gameLoop);
}

// Timer
function updateTimer() {
  timeRemaining--;
  document.getElementById('time').textContent = 'Time: ' + timeRemaining + 's';
  
  if (timeRemaining <= 0) {
    endGame();
  }
}

// Start game
function startGame() {
  const duration = prompt('Choose game duration:\nEnter "30" for 30 seconds\nEnter "60" for 60 seconds');
  
  if (duration !== '30' && duration !== '60') {
    alert('Invalid choice! Please select 30 or 60 seconds.');
    return;
  }

  // Reset game
  score = 0;
  timeRemaining = parseInt(duration);
  gameActive = true;
  manX = 10;
  manY = 200;
  velocityX = 0;
  velocityY = 0;
  facingLeft = false;

  // Reset garbages
  garbageItems.forEach(g => g.respawn());

  // Update UI
  document.getElementById('score').textContent = 'Score: ' + score;
  document.getElementById('time').textContent = 'Time: ' + timeRemaining + 's';
  document.getElementById('collect').disabled = false;
  document.getElementById('gameOver').style.display = 'none';

  // Start playing music
  music.currentTime = 0;
  music.play();

  // Start timer
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  // Start game loop
  if (animationId) cancelAnimationFrame(animationId);
  gameLoop();
}

// End game
function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  cancelAnimationFrame(animationId);
  velocityX = 0;
  velocityY = 0;
  
  // Stop music
  music.pause();
  music.currentTime = 0;
  
  document.getElementById('collect').disabled = true;
  document.getElementById('finalScore').textContent = 'Final Score: ' + score;
  document.getElementById('gameOver').style.display = 'block';
}

// Event listeners
document.getElementById('start').addEventListener('click', startGame);
document.getElementById('collect').addEventListener('click', collectGarbage);

document.addEventListener('keydown', (e) => {
  if (!gameActive) return;

  if (e.key === 'ArrowRight') {
    velocityX = 5;
    velocityY = 0;
    facingLeft = false;
  } 
  else if (e.key === 'ArrowLeft') {
    velocityX = -5;
    velocityY = 0;
    facingLeft = true;
  } 
  else if (e.key === 'ArrowDown') {
    velocityX = 0;
    velocityY = 5;
  } 
  else if (e.key === 'ArrowUp') {
    velocityX = 0;
    velocityY = -5;
  } 
  else if (e.key === ' ') {
    e.preventDefault();
    collectGarbage();
  }
});

// first draw of game
drawScene();