const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================== VARIABLES ================== */
let fishes = [];
let bubbles = [];
let particles = [];

let score = 0;
let lives = 3;
let time = 50;
let level = 1;

let mouse = { x: canvas.width/2, y: canvas.height/2 };
let player = { x: mouse.x, y: mouse.y };

let gameOver = false;

/* ================== IMAGES ================== */
const fishImages = [
    "assets/img/fish_azul.png",
    "assets/img/fish_beta.png",
    "assets/img/fish_dorado.png",
    "assets/img/fish_linterna.png"
];

/* ================== CLASES ================== */
class Fish {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50;
        this.size = 40 + Math.random() * 30;
        this.speed = 1 + Math.random() * level;
        this.angle = Math.random() * 2;
        this.img = new Image();
        this.img.src = fishImages[Math.floor(Math.random()*fishImages.length)];
    }

    update() {
        this.y -= this.speed;
        this.x += Math.sin(this.angle) * 2;
        this.angle += 0.05;
    }

    draw() {
        ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
    }
}

class Bubble {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.size = Math.random()*5;
        this.speed = Math.random()*2;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();
    }
}

class Particle {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.size = Math.random()*3;
        this.life = 30;
        this.vx = (Math.random()-0.5)*4;
        this.vy = (Math.random()-0.5)*4;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        ctx.fillStyle = "rgba(0,200,255,0.5)";
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }
}

/* ================== PLAYER ================== */
function drawPlayer() {
    player.x += (mouse.x - player.x) * 0.1;
    player.y += (mouse.y - player.y) * 0.1;

    ctx.beginPath();
    ctx.arc(player.x, player.y, 30, 0, Math.PI*2);
    ctx.fillStyle = "#00aaff";
    ctx.fill();
}

/* ================== EVENTOS ================== */
canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener("click", () => {
    fishes.forEach((fish, i) => {
        let dx = fish.x - player.x;
        let dy = fish.y - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < 50) {
            fishes.splice(i,1);
            score += 10;

            // partículas
            for(let j=0;j<10;j++){
                particles.push(new Particle(fish.x,fish.y));
                bubbles.push(new Bubble(fish.x,fish.y));
            }
        }
    });
});

/* ================== GAME LOOP ================== */
function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawPlayer();

    // peces
    fishes.forEach((fish, i) => {
        fish.update();
        fish.draw();

        if(fish.y < -50) {
            fishes.splice(i,1);
            lives--;
        }
    });

    // burbujas
    bubbles.forEach((b,i)=>{
        b.update();
        b.draw();
        if(b.y < 0) bubbles.splice(i,1);
    });

    // partículas
    particles.forEach((p,i)=>{
        p.update();
        p.draw();
        if(p.life <= 0) particles.splice(i,1);
    });

    // spawn peces
    if(Math.random() < 0.02 + level*0.005) {
        fishes.push(new Fish());
    }

    // subir nivel
    if(score > level * 100) {
        level++;
    }

    updateUI();

    if(!gameOver) requestAnimationFrame(animate);
}

/* ================== UI ================== */
function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = lives;
    document.getElementById("time").innerText = time;
    document.getElementById("level").innerText = level;

    if(lives <= 0 || time <= 0) {
        gameOver = true;
        alert("GAME OVER");
    }
}

/* ================== TIMER ================== */
setInterval(()=>{
    if(!gameOver) time--;
},1000);

/* ================== RESTART ================== */
function restartGame() {
    fishes = [];
    bubbles = [];
    particles = [];

    score = 0;
    lives = 3;
    time = 50;
    level = 1;
    gameOver = false;

    animate();
}

/* ================== START ================== */
animate();