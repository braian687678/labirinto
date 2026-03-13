/**
 * Shadows in the Grass - Core Game Logic
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const deathCountEl = document.getElementById('death-count');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const restartBtn = document.getElementById('restart-btn');
const levelDisplayEl = document.getElementById('level-display');
const musicToggleBtn = document.getElementById('music-toggle');

// --- Configuration ---
const TILE_SIZE = 48;
const PLAYER_SIZE = 40;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;

const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const timerDisplayEl = document.getElementById('timer-display');

canvas.width = MAP_WIDTH * TILE_SIZE;
canvas.height = MAP_HEIGHT * TILE_SIZE;

// 0: Floor, 1: Wall, 2: Spikes (Lethal), 3: Portal
const levels = [
    [ // Nível 1
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [ // Nível 2
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0, 0, 3, 1],
        [1, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 1],
        [1, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0, 1],
        [1, 2, 2, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1],
        [1, 0, 0, 0, 2, 0, 1, 1, 1, 1, 1, 0, 2, 2, 1],
        [1, 0, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [ // Nível 3
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 2, 1],
        [1, 0, 1, 0, 0, 0, 1, 3, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

const enemyData = [
    [],
    [
        { x: 5 * TILE_SIZE, y: 7 * TILE_SIZE, vx: 2, vy: 0, range: 4 * TILE_SIZE, startX: 5 * TILE_SIZE, startY: 7 * TILE_SIZE },
        { x: 9 * TILE_SIZE, y: 4 * TILE_SIZE, vx: 0, vy: -2, range: 3 * TILE_SIZE, startX: 9 * TILE_SIZE, startY: 4 * TILE_SIZE }
    ],
    [
        { x: 7 * TILE_SIZE, y: 5 * TILE_SIZE, vx: 3, vy: 0, range: 5 * TILE_SIZE, startX: 7 * TILE_SIZE, startY: 5 * TILE_SIZE },
        { x: 2 * TILE_SIZE, y: 3 * TILE_SIZE, vx: 0, vy: 2, range: 4 * TILE_SIZE, startX: 2 * TILE_SIZE, startY: 3 * TILE_SIZE }
    ]
];

// --- Assets ---
const assets = {
    spikes: new Image(),
    floor: new Image(),
    wall: new Image(),
    portal: new Image(),
    player: new Image()
};

// --- Game State ---
let player = {
    x: TILE_SIZE * 1.5,
    y: TILE_SIZE * 1.5,
    targetX: TILE_SIZE * 1.5,
    targetY: TILE_SIZE * 1.5,
    isMoving: false,
    speed: 4,
    vx: 0,
    vy: 0
};

let gameStarted = false;
let gameTime = 0; // seconds
let secondTimer = 0; // ms accumulator
let deaths = 0;
let isGameOver = false;
let enemies = [];
let currentLevel = 0;
let map = levels[currentLevel];
let obstacles = [];
let targets = [];
let projectiles = [];
let playerTrail = []; // Tail/Trail effect

// --- Classes ---

class FloatingObstacle {
    constructor(x, y, radius, speed, amplitude) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.amplitude = amplitude;
        this.angle = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.angle += (this.speed * dt) / 1000;
        this.y = this.baseY + Math.sin(this.angle) * this.amplitude;
        this.x = this.baseX + Math.cos(this.angle * 0.5) * this.amplitude * 0.5;

        // Collision with player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        if (Math.sqrt(dx * dx + dy * dy) < this.radius + 18) { // Ball radius is 20, 18 for slightly tighter collision
            die();
        }
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, '#9d4edd');
        grad.addColorStop(1, '#3c096c');
        
        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#9d4edd';
        ctx.fill();
        
        // Shine
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        
        ctx.restore();
    }
}

class Target {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.hit = false;
        this.pulse = 0;
    }

    update(dt) {
        this.pulse += dt * 0.005;
    }

    draw() {
        if (this.hit) return;
        ctx.save();
        const size = this.radius + Math.sin(this.pulse) * 3;
        
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff0054';
        
        // Crosshair style
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x - size - 5, this.y);
        ctx.lineTo(this.x + size + 5, this.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - size - 5);
        ctx.lineTo(this.x, this.y + size + 5);
        ctx.stroke();
        
        ctx.restore();
    }
}

class Projectile {
    constructor(x, y, tx, ty) {
        this.x = x;
        this.y = y;
        const angle = Math.atan2(ty - y, tx - x);
        this.vx = Math.cos(angle) * 8;
        this.vy = Math.sin(angle) * 8;
        this.radius = 5;
        this.life = 1000;
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= dt;

        // Collision with targets
        targets.forEach(t => {
            if (!t.hit) {
                const dx = this.x - t.x;
                const dy = this.y - t.y;
                if (Math.sqrt(dx * dx + dy * dy) < t.radius + this.radius) {
                    t.hit = true;
                    this.life = 0;
                }
            }
        });
    }

    draw() {
        ctx.fillStyle = '#ff9100';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Audio ---
let bgMusic = new Audio('assets/went.mp3');
bgMusic.loop = true;
let isMusicPlaying = false;

// --- Cycle and Timers ---
let grassState = 'safe'; 
let grassTimer = 0;
let lastTime = 0;

const CYCLE = {
    safe: 3000,
    warning: 1000,
    danger: 1500
};

// --- Input Handling ---
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Throw projectile on click
canvas.addEventListener('mousedown', e => {
    if (!gameStarted || isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    projectiles.push(new Projectile(player.x, player.y, mx, my));
});

restartBtn.addEventListener('click', () => {
    if (isGameOver) {
        isGameOver = false;
        resetGame();
        requestAnimationFrame(gameLoop);
    }
});

startBtn.addEventListener('click', () => {
    gameStarted = true;
    startScreen.classList.add('hidden');
    resetGame();
    if (!isMusicPlaying) {
        isMusicPlaying = true;
        bgMusic.play().catch(e => console.log("Erro ao tocar música:", e));
        musicToggleBtn.classList.add('active');
    }
    requestAnimationFrame(gameLoop);
});

musicToggleBtn.addEventListener('click', () => {
    isMusicPlaying = !isMusicPlaying;
    if (isMusicPlaying) {
        bgMusic.play().catch(e => console.log("Erro ao tocar música:", e));
        musicToggleBtn.classList.add('active');
    } else {
        bgMusic.pause();
        musicToggleBtn.classList.remove('active');
    }
});

function drawPreview() {
    if (gameStarted) return;
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 120;
    previewCanvas.height = 120;
    previewCanvas.style.marginBottom = '20px';
    previewCanvas.id = 'player-preview';
    
    if (!document.getElementById('player-preview')) {
        startScreen.querySelector('.overlay-content').prepend(previewCanvas);
    }
    
    const pCtx = previewCanvas.getContext('2d');
    
    function animatePreview() {
        if (gameStarted) {
            previewCanvas.remove();
            return;
        }
        pCtx.clearRect(0, 0, 120, 120);
        pCtx.save();
        pCtx.translate(60, 60);
        
        const time = Date.now();
        const pulse = Math.sin(time / 200) * 0.1 + 1;
        pCtx.scale(pulse, pulse);
        
        pCtx.shadowBlur = 20;
        pCtx.shadowColor = 'rgba(255, 158, 0, 0.8)';
        
        if (assets.player.complete && assets.player.naturalWidth !== 0) {
            pCtx.drawImage(assets.player, -40, -40, 80, 80);
        } else {
            const ballGrad = pCtx.createRadialGradient(-5, -5, 0, 0, 0, 40);
            ballGrad.addColorStop(0, '#ff9e00');
            ballGrad.addColorStop(1, '#ff5400');
            pCtx.beginPath();
            pCtx.arc(0, 0, 40, 0, Math.PI * 2);
            pCtx.fillStyle = ballGrad;
            pCtx.fill();
            
            pCtx.fillStyle = 'white';
            pCtx.beginPath();
            pCtx.arc(-12, -8, 8, 0, Math.PI * 2);
            pCtx.arc(12, -8, 8, 0, Math.PI * 2);
            pCtx.fill();
            pCtx.fillStyle = 'black';
            pCtx.beginPath();
            pCtx.arc(-12, -8, 4, 0, Math.PI * 2);
            pCtx.arc(12, -8, 4, 0, Math.PI * 2);
            pCtx.fill();
        }
        pCtx.restore();
        requestAnimationFrame(animatePreview);
    }
    animatePreview();
}
drawPreview();

const optionsBtn = document.getElementById('options-btn');
const creditsBtn = document.getElementById('credits-btn');

optionsBtn.addEventListener('click', () => {
    alert("Opções: Ajuste de volume e controles em breve!");
});

creditsBtn.addEventListener('click', () => {
    alert("Shadows in the Grass\nDesenvolvido por: Antigravity AI\nArte e Música: Ativos de Demonstração");
});

function initLevel() {
    obstacles = [];
    targets = [];
    projectiles = [];
    
    // Add obstacles based on level
    if (currentLevel === 0) {
        obstacles.push(new FloatingObstacle(TILE_SIZE * 6, TILE_SIZE * 5, 20, 2, 50));
        obstacles.push(new FloatingObstacle(TILE_SIZE * 3, TILE_SIZE * 5, 15, 1.5, 30));
        targets.push(new Target(TILE_SIZE * 13, TILE_SIZE * 1.5));
        targets.push(new Target(TILE_SIZE * 1, TILE_SIZE * 7.5));
    } else if (currentLevel === 1) {
        obstacles.push(new FloatingObstacle(TILE_SIZE * 4, TILE_SIZE * 3, 25, 1.5, 80));
        obstacles.push(new FloatingObstacle(TILE_SIZE * 10, TILE_SIZE * 6, 20, 2.5, 40));
        obstacles.push(new FloatingObstacle(TILE_SIZE * 7, TILE_SIZE * 2, 18, 2, 60));
        targets.push(new Target(TILE_SIZE * 1, TILE_SIZE * 1.5));
        targets.push(new Target(TILE_SIZE * 13, TILE_SIZE * 4));
    } else {
        obstacles.push(new FloatingObstacle(TILE_SIZE * 7, TILE_SIZE * 4, 30, 1, 100));
        obstacles.push(new FloatingObstacle(TILE_SIZE * 3, TILE_SIZE * 4, 20, 3, 40));
        obstacles.push(new FloatingObstacle(TILE_SIZE * 11, TILE_SIZE * 4, 20, 3, 40));
        targets.push(new Target(TILE_SIZE * 7, TILE_SIZE * 3));
        targets.push(new Target(TILE_SIZE * 7, TILE_SIZE * 7));
        targets.push(new Target(TILE_SIZE * 1, TILE_SIZE * 4));
    }
}

function resetGame() {
    map = levels[currentLevel];
    
    if (currentLevel === 1) {
        player.x = TILE_SIZE * 13.5;
        player.y = TILE_SIZE * 8.5;
    } else {
        player.x = TILE_SIZE * 1.5;
        player.y = TILE_SIZE * 1.5;
    }
    player.targetX = player.x;
    player.targetY = player.y;
    player.isMoving = false;

    isGameOver = false;
    gameTime = 0;
    secondTimer = 0;
    timerDisplayEl.innerText = `Tempo: 1`; // Start display at 1 or 0? Let's keep 0 and it ticks to 1
    overlay.classList.add('hidden');
    
    enemies = JSON.parse(JSON.stringify(enemyData[currentLevel] || []));
    initLevel();
    
    levelDisplayEl.innerText = `Nível: ${currentLevel + 1}`;
}

function die() {
    if (isGameOver) return;
    isGameOver = true;
    deaths++;
    deathCountEl.innerText = `Mortes: ${deaths}`;
    gameTime = 0; // Reset timer on death
    timerDisplayEl.innerText = `Tempo: 1`; 
    overlayTitle.innerText = "Fim de Jogo";
    overlayTitle.style.color = "var(--danger-color)";
    overlayMessage.innerText = "A bola caiu!"; 
    overlay.classList.remove('hidden');
}

function win() {
    if (isGameOver) return;
    
    if (currentLevel < levels.length - 1) {
        currentLevel++;
        resetGame();
    } else {
        isGameOver = true;
        overlayTitle.innerText = "Você Escapou!";
        overlayTitle.style.color = "lightgreen";
        overlayMessage.innerText = `Parabéns! Tempo final: ${gameTime + 1}s`;
        overlay.classList.remove('hidden');
    }
}

function showNotice(title, msg) {
    if (overlay.classList.contains('hidden')) {
        overlayTitle.innerText = title;
        overlayTitle.style.color = "white";
        overlayMessage.innerText = msg;
        overlay.classList.remove('hidden');
        setTimeout(() => {
            if (!isGameOver) overlay.classList.add('hidden');
        }, 2000);
    }
}

// --- Logic ---
function update(dt) {
    if (isGameOver || !gameStarted) return;

    // Timer logic
    secondTimer += dt;
    if (secondTimer >= 1000) {
        gameTime++;
        secondTimer -= 1000;
        if (gameTime > 59) gameTime = 59; // Cap so gameTime + 1 = 60
        timerDisplayEl.innerText = `Tempo: ${gameTime + 1}`;
    }

    // Grid Movement Logic
    if (!player.isMoving) {
        let dx = 0;
        let dy = 0;
        if (keys['ArrowUp'] || keys['KeyW']) dy = -1;
        else if (keys['ArrowDown'] || keys['KeyS']) dy = 1;
        else if (keys['ArrowLeft'] || keys['KeyA']) dx = -1;
        else if (keys['ArrowRight'] || keys['KeyD']) dx = 1;

        if (dx !== 0 || dy !== 0) {
            const nextTx = Math.floor(player.x / TILE_SIZE) + dx;
            const nextTy = Math.floor(player.y / TILE_SIZE) + dy;

            if (nextTx >= 0 && nextTx < MAP_WIDTH && nextTy >= 0 && nextTy < MAP_HEIGHT) {
                if (map[nextTy][nextTx] !== 1) { // 1 is wall
                    player.targetX = (nextTx + 0.5) * TILE_SIZE;
                    player.targetY = (nextTy + 0.5) * TILE_SIZE;
                    player.isMoving = true;
                }
            }
        }
    }

    if (player.isMoving) {
        const step = player.speed;
        if (Math.abs(player.x - player.targetX) > step) {
            player.x += Math.sign(player.targetX - player.x) * step;
        } else {
            player.x = player.targetX;
        }

        if (Math.abs(player.y - player.targetY) > step) {
            player.y += Math.sign(player.targetY - player.y) * step;
        } else {
            player.y = player.targetY;
        }

        if (player.x === player.targetX && player.y === player.targetY) {
            player.isMoving = false;
        }
    }

    // Update Trail
    playerTrail.push({ x: player.x, y: player.y, alpha: 0.5 });
    if (playerTrail.length > 10) playerTrail.shift();
    playerTrail.forEach(t => t.alpha -= 0.05);
    playerTrail = playerTrail.filter(t => t.alpha > 0);

    // Update Obstacles
    obstacles.forEach(ob => ob.update(dt));

    // Update Projectiles
    projectiles = projectiles.filter(p => p.life > 0);
    projectiles.forEach(p => p.update(dt));

    // Update Targets
    targets.forEach(t => t.update(dt));

    // Enemy movement
    enemies.forEach(en => {
        en.x += en.vx;
        en.y += en.vy;
        
        const dist = Math.sqrt(Math.pow(en.x - en.startX, 2) + Math.pow(en.y - en.startY, 2));
        if (dist > en.range) {
            en.vx *= -1;
            en.vy *= -1;
        }

        const dx = player.x - en.x;
        const dy = player.y - en.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) { // Ball(20) + Enemy(15) = 35. 30 for safety.
            die();
        }
    });

    // Spikes check
    const tx = Math.floor(player.x / TILE_SIZE);
    const ty = Math.floor(player.y / TILE_SIZE);
    if (map[ty] && map[ty][tx] === 2) die();
    
    // Portal check
    if (map[ty] && map[ty][tx] === 3) {
        if (targets.every(t => t.hit)) {
            win();
        } else {
            showNotice("Ainda não!", "Você precisa atingir todos os alvos primeiro!");
        }
    }
}

// --- Drawing ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tile = map[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (tile !== 1) ctx.drawImage(assets.floor, px, py, TILE_SIZE, TILE_SIZE);
            if (tile === 1) ctx.drawImage(assets.wall, px, py, TILE_SIZE, TILE_SIZE);
            else if (tile === 2) ctx.drawImage(assets.spikes, px, py, TILE_SIZE, TILE_SIZE);
            else if (tile === 3) ctx.drawImage(assets.portal, px, py, TILE_SIZE, TILE_SIZE);
        }
    }

    enemies.forEach(en => {
        ctx.save();
        ctx.translate(en.x, en.y);
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(255, 0, 84, 0.6)";
        ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(-5, -2, 2, 0, Math.PI * 2);
        ctx.arc(5, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    obstacles.forEach(ob => ob.draw());
    targets.forEach(t => t.draw());
    projectiles.forEach(p => p.draw());

    // Darkness Mask
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    tempCtx.globalCompositeOperation = 'destination-out';
    const grad = tempCtx.createRadialGradient(player.x, player.y, TILE_SIZE * 0.5, player.x, player.y, TILE_SIZE * 3.5);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    tempCtx.fillStyle = grad;
    tempCtx.beginPath();
    tempCtx.arc(player.x, player.y, TILE_SIZE * 4, 0, Math.PI * 2);
    tempCtx.fill();
    ctx.drawImage(tempCanvas, 0, 0);

    // Player (Ball / PNG)
    const time = Date.now();
    
    // Trail drawing
    playerTrail.forEach((t, i) => {
        ctx.save();
        ctx.globalAlpha = t.alpha * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 15 * (i / playerTrail.length), 0, Math.PI * 2);
        ctx.fillStyle = '#ff9e00';
        ctx.fill();
        ctx.restore();
    });

    ctx.save();
    // Floating and Breathing animation
    const bobbing = Math.sin(time / 400) * 5;
    const pulse = Math.sin(time / 200) * 0.1 + 1.05; 
    ctx.translate(player.x, player.y + bobbing);
    ctx.scale(pulse, pulse);

    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 158, 0, 0.6)';

    // Ball shadow
    ctx.beginPath();
    ctx.ellipse(0, 18, 15 * pulse, 7 * pulse, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow for body

    // Rotate when moving
    if (player.isMoving) {
        ctx.rotate(time / 100);
    }

    if (assets.player.complete && assets.player.naturalWidth !== 0) {
        ctx.drawImage(assets.player, -22, -22, 44, 44);
    } else {
        const ballGrad = ctx.createRadialGradient(-5, -5, 0, 0, 0, 20);
        ballGrad.addColorStop(0, '#ff9e00');
        ballGrad.addColorStop(1, '#ff5400');
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();
        
        // Eyes for the fallback
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-6, -4, 4, 0, Math.PI * 2);
        ctx.arc(6, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-6, -4, 2, 0, Math.PI * 2);
        ctx.arc(6, -4, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function gameLoop(time) {
    if (!gameStarted) return;
    if (lastTime === 0) lastTime = time;
    const dt = time - lastTime;
    lastTime = time;
    
    update(dt);
    draw();
    
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Assets load and start screen
let assetsLoaded = 0;
const totalAssets = Object.keys(assets).length;

// Pre-process player image to remove white background if needed
assets.player.onload = () => {
    if (assets.player.src.startsWith('data:')) return;
    try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = assets.player.width;
        tempCanvas.height = assets.player.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(assets.player, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            if (r > 200 && g > 200 && b > 200) {
                data[i+3] = 0;
                count++;
            }
        }
        console.log(`Processed player image: removed ${count} white-ish pixels.`);
        
        tempCtx.putImageData(imageData, 0, 0);
        assets.player.src = tempCanvas.toDataURL();
    } catch (e) {
        console.warn("Could not auto-remove background due to browser security (CORS). Please use a transparent PNG if possible.", e);
        assetsLoaded++; // Count it anyway even if processing fails
    }
};

Object.entries(assets).forEach(([name, img]) => {
    if (name === 'player') return; // Handled separately above
    img.onload = () => {
        assetsLoaded++;
    };
});

// Final check for the processed player image
const finalPlayerLoad = new Image();
assets.player.addEventListener('load', function countOnce() {
    if (assets.player.src.startsWith('data:')) {
        assetsLoaded++;
        assets.player.removeEventListener('load', countOnce);
        checkAllLoaded();
    }
}, false);

function checkAllLoaded() {
    if (assetsLoaded === totalAssets) {
        console.log("All assets loaded and processed.");
    }
}

// Start loading assets AFTER handlers are set
assets.spikes.src = 'assets/grass_active.png';
assets.floor.src = 'assets/floor.png';
assets.wall.src = 'assets/wall.png';
assets.portal.src = 'assets/portal.png';
assets.player.src = 'assets/player.png';
