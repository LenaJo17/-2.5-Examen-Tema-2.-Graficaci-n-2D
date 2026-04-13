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

let timerInterval;
function iniciarContador() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!juegoActivo) { clearInterval(timerInterval); return; }
        if (!pausado) {
            tiempo--;
            if (tiempo <= 0 || vidas <= 0) {
                finalizarJuego();
                clearInterval(timerInterval);
            }
        }
    }, 1000);
}

function finalizarJuego() {
    juegoActivo = false;
    if (puntos > mejorRecord) {
        mejorRecord = puntos;
        localStorage.setItem("mejorRecord", puntos);
    }
    document.getElementById("game-over-screen").style.display = "flex";
    document.getElementById("final-puntos").innerText = puntos;
    document.getElementById("final-mejor").innerText = mejorRecord;
}

document.getElementById("btn-reintentar").addEventListener("click", () => {
    puntos = 0; vidas = 5; tiempo = 50; nivel = 1; pecesJuego = [];
    pecesAtrapados = 0; globosEvitados = 0; doradosAtrapados = 0; totalDanio = 0;
    actualizarUI();
    document.getElementById("game-over-screen").style.display = "none";
    juegoActivo = true;
    iniciarContador();
});

document.getElementById("btn-volver-menu").addEventListener("click", () => {
    location.reload();
});

// NIVELES ACTUALIZADOS (1 a 5)
function verificarNivel() {
    if (puntos >= 1000) nivel = 5;
    else if (puntos >= 750) nivel = 4;
    else if (puntos >= 500) nivel = 3;
    else if (puntos >= 250) nivel = 2;
    else nivel = 1;
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
    document.getElementById("mejor-puntos").innerText = mejorRecord;
}

function loop() {
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    burbujas.forEach(b => b.draw());

    if (juegoActivo && !pausado) {
        gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
        gCtx.drawImage(imgS.linterna, depredador.x - 40, depredador.y - 40, 80, 80);

        // FRECUENCIA DE APARICIÓN: Aumenta con cada nivel
        if (Math.random() < (0.02 + (nivel * 0.02))) {
            const tipos = ["azul", "dorado", "beta", "globo"];
            pecesJuego.push({
                x: Math.random() * (gCanvas.width - 50),
                y: gCanvas.height + 50,
                tipo: tipos[Math.floor(Math.random() * tipos.length)],
                // VELOCIDAD: Escala más agresivamente en niveles 4 y 5
                speed: 1.5 + (nivel * 0.9) 
            });
        }

        for (let i = pecesJuego.length - 1; i >= 0; i--) {
            let p = pecesJuego[i];
            p.y -= p.speed;
            gCtx.drawImage(imgS[p.tipo], p.x, p.y, 45, 45);

            if (p.y < -50) {
                if (p.tipo !== "globo") {
                    vidas--;
                    if(vidas <= 0) finalizarJuego();
                } else globosEvitados++;
                pecesJuego.splice(i, 1);
                continue;
            }

            let dist = Math.hypot(depredador.x - (p.x + 22), depredador.y - (p.y + 22));
            if (dist < 45) {
                if (p.tipo === "globo") { 
                    vidas--; totalDanio++; 
                    if(vidas <= 0) finalizarJuego();
                } else { 
                    puntos += (p.tipo === "dorado" ? 50 : 10); 
                    pecesAtrapados++; 
                    if (p.tipo === "dorado") doradosAtrapados++; 
                    verificarNivel();
                }
                pecesJuego.splice(i, 1);
            }
        }
        actualizarUI();
    }
    requestAnimationFrame(loop);
}
loop();