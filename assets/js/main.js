const bCanvas = document.getElementById("burbujas");
const bCtx = bCanvas.getContext("2d");
const gCanvas = document.getElementById("gameCanvas");
const gCtx = gCanvas.getContext("2d");

let juegoActivo = false;
let pausado = false;
let puntos = 0, vidas = 5, tiempo = 50, nivel = 1;
let burbujas = [], pecesJuego = [];
let pecesAtrapados = 0, globosEvitados = 0, doradosAtrapados = 0, totalDanio = 0;

let mejorRecord = localStorage.getItem("mejorRecord") || 0;
document.getElementById("mejor-puntos").innerText = mejorRecord;

const imgS = {
    azul: new Image(), dorado: new Image(), beta: new Image(),
    globo: new Image(), linterna: new Image()
};
imgS.azul.src = "assets/img/azul.png";
imgS.dorado.src = "assets/img/dorado.png";
imgS.beta.src = "assets/img/beta.png";
imgS.globo.src = "assets/img/globo.png";
imgS.linterna.src = "assets/img/linterna.png";

const depredador = { x: 0, y: 0 };

function resize() {
    bCanvas.width = window.innerWidth;
    bCanvas.height = window.innerHeight;
    if (juegoActivo) {
        // Mantiene el diseño del canvas ajustándose al contenedor
        gCanvas.width = gCanvas.parentElement.offsetWidth;
        gCanvas.height = gCanvas.parentElement.offsetHeight;
    }
}
window.addEventListener("resize", resize);
resize();

class Burbuja {
    constructor(initAll) {
        this.size = Math.random() * 20 + 15;
        this.x = Math.random() * bCanvas.width;
        this.y = initAll ? Math.random() * bCanvas.height : bCanvas.height + 50;
        this.speed = Math.random() * 1 + 0.5;
    }
    draw() {
        this.y -= this.speed;
        if (this.y < -50) this.y = bCanvas.height + 50;
        bCtx.save();
        let grad = bCtx.createRadialGradient(this.x-this.size*0.2, this.y-this.size*0.2, this.size*0.1, this.x, this.y, this.size);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        grad.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.4)");
        bCtx.fillStyle = grad;
        bCtx.beginPath(); bCtx.arc(this.x, this.y, this.size, 0, Math.PI*2); bCtx.fill();
        bCtx.restore();
    }
}
for (let i = 0; i < 30; i++) burbujas.push(new Burbuja(true));

document.getElementById("btn-jugar").addEventListener("click", () => {
    document.getElementById("menu-inicio").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
    juegoActivo = true;
    resize();
    iniciarContador();
});

document.querySelector(".btn-pausa-pro").addEventListener("click", () => {
    pausado = !pausado;
    const btn = document.querySelector(".btn-pausa-pro");
    btn.innerText = pausado ? "REANUDAR" : "PAUSA";
});

// EVENTOS DE CONTROL (MOUSE Y TACTIL)
const actPos = (posX, posY) => {
    const rect = gCanvas.getBoundingClientRect();
    depredador.x = posX - rect.left;
    depredador.y = posY - rect.top;
};

gCanvas.addEventListener("mousemove", (e) => actPos(e.clientX, e.clientY));
gCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    actPos(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

function iniciarContador() {
    const timer = setInterval(() => {
        if (!juegoActivo) { clearInterval(timer); return; }
        if (!pausado) {
            tiempo--;
            if (tiempo <= 0 || vidas <= 0) {
                juegoActivo = false;
                if (puntos > mejorRecord) localStorage.setItem("mejorRecord", puntos);
                alert(`Fin del Juego.\nPuntos: ${puntos}`);
                location.reload();
            }
        }
    }, 1000);
}

function actualizarUI() {
    document.getElementById("puntos").innerText = puntos;
    document.getElementById("vidas").innerText = vidas;
    document.getElementById("tiempo").innerText = tiempo;
    document.getElementById("nivel").innerText = nivel;
    document.getElementById("obj-peces").innerText = `${pecesAtrapados}/10`;
    document.getElementById("obj-globos").innerText = `${globosEvitados}/2`;
    document.getElementById("obj-dorado").innerText = `${doradosAtrapados}/1`;
    document.getElementById("stat-peces").innerText = pecesAtrapados;
    document.getElementById("stat-danio").innerText = totalDanio;
}

function loop() {
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    burbujas.forEach(b => b.draw());

    if (juegoActivo && !pausado) {
        gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
        // Mantiene tu diseño de linterna original
        gCtx.drawImage(imgS.linterna, depredador.x - 40, depredador.y - 40, 80, 80);

        if (Math.random() < (0.02 + (nivel * 0.015))) {
            const tipos = ["azul", "dorado", "beta", "globo"];
            pecesJuego.push({
                x: Math.random() * (gCanvas.width - 50),
                y: gCanvas.height + 50,
                tipo: tipos[Math.floor(Math.random() * tipos.length)],
                speed: 1.5 + (nivel * 0.7)
            });
        }

        for (let i = pecesJuego.length - 1; i >= 0; i--) {
            let p = pecesJuego[i];
            p.y -= p.speed;
            gCtx.drawImage(imgS[p.tipo], p.x, p.y, 45, 45);

            if (p.y < -50) {
                if (p.tipo !== "globo") vidas--;
                else globosEvitados++;
                pecesJuego.splice(i, 1);
                continue;
            }

            let dist = Math.hypot(depredador.x - (p.x + 22), depredador.y - (p.y + 22));
            if (dist < 45) {
                if (p.tipo === "globo") { vidas--; totalDanio++; } 
                else { puntos += (p.tipo === "dorado" ? 50 : 10); pecesAtrapados++; if (p.tipo === "dorado") doradosAtrapados++; }
                pecesJuego.splice(i, 1);
            }
        }
        actualizarUI();
    }
    requestAnimationFrame(loop);
}
loop();