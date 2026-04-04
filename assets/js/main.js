const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// UI
const puntosEl = document.getElementById("puntos");
const vidasEl = document.getElementById("vidas");
const tiempoEl = document.getElementById("tiempo");
const nivelEl = document.getElementById("nivel");

let puntos = 0;
let vidas = 3;
let tiempo = 60;
let nivel = 1;
let juegoActivo = false;

let peces = [];
let particulas = [];
let depredador;

// IMÁGENES
const imgs = {
  azul: new Image(),
  dorado: new Image(),
  beta: new Image(),
  globo: new Image(),
  tiburon: new Image()
};

imgs.azul.src = "assets/img/fish_azul.png";
imgs.dorado.src = "assets/img/fish_dorado.png";
imgs.beta.src = "assets/img/fish_beta.png";
imgs.globo.src = "assets/img/fish_pez_globo.png";
imgs.tiburon.src = "assets/img/fish_linterna.png";

// 🐟 PEZ
class Pez {
  constructor(tipo) {
    this.tipo = tipo;
    this.x = -50;
    this.y = Math.random() * canvas.height;
    this.size = 40;
    this.speed = Math.random() * 2 + nivel * 0.5;
  }

  draw() {
    ctx.drawImage(imgs[this.tipo], this.x, this.y, this.size, this.size);
  }

  update() {
    this.x += this.speed;
    this.draw();
  }
}

// 💥 PARTICULAS (explosión)
class Particula {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.life = 1;
    this.dx = (Math.random() - 0.5) * 4;
    this.dy = (Math.random() - 0.5) * 4;
  }

  draw() {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life -= 0.05;
    this.draw();
  }
}

// 🦈 DEPREDADOR
class Depredador {
  constructor() {
    this.x = 400;
    this.y = 200;
    this.size = 80;
  }

  draw() {
    ctx.drawImage(imgs.tiburon, this.x, this.y, this.size, this.size);
  }

  update() {
    this.comer();
    this.draw();
  }

  comer() {
    peces.forEach((pez, i) => {
      if (
        this.x < pez.x + pez.size &&
        this.x + this.size > pez.x &&
        this.y < pez.y + pez.size &&
        this.y + this.size > pez.y
      ) {
        // 💥 partículas
        for (let j = 0; j < 10; j++) {
          particulas.push(new Particula(pez.x, pez.y));
        }

        peces.splice(i, 1);

        puntos += 1;

        // 🦈 crecer
        this.size += 2;
      }
    });
  }
}

// 🖱️ CONTROL
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  depredador.x = e.clientX - rect.left - depredador.size / 2;
  depredador.y = e.clientY - rect.top - depredador.size / 2;
});

// 🐟 SPAWN CONTINUO
function spawnPez() {
  const tipos = ["azul", "dorado", "beta", "globo"];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  peces.push(new Pez(tipo));
}

// ⏱ TIMER
function iniciarTimer() {
  const timer = setInterval(() => {
    if (!juegoActivo) return;

    tiempo--;

    // subir nivel progresivo
    if (tiempo % 10 === 0) {
      nivel++;
    }

    if (tiempo <= 0 || vidas <= 0) {
      juegoActivo = false;
      clearInterval(timer);
      alert("💀 Game Over\nPuntos: " + puntos);
    }

    actualizarUI();
  }, 1000);
}

// 🐟 GENERADOR AUTOMÁTICO
function iniciarSpawn() {
  setInterval(() => {
    if (!juegoActivo) return;

    spawnPez();
  }, 800 - nivel * 50); // más rápido por nivel
}

// UI
function actualizarUI() {
  puntosEl.textContent = puntos;
  vidasEl.textContent = vidas;
  tiempoEl.textContent = tiempo;
  nivelEl.textContent = nivel;
}

// LOOP
function animate() {
  if (!juegoActivo) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  peces.forEach(p => p.update());

  particulas = particulas.filter(p => p.life > 0);
  particulas.forEach(p => p.update());

  depredador.update();

  requestAnimationFrame(animate);
}

// INICIAR
function iniciarJuego() {
  puntos = 0;
  vidas = 3;
  tiempo = 60;
  nivel = 1;

  peces = [];
  particulas = [];

  juegoActivo = true;

  depredador = new Depredador();

  actualizarUI();
  iniciarTimer();
  iniciarSpawn();
  animate();
}

// BOTÓN
document.getElementById("btnJugar").addEventListener("click", iniciarJuego);