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
        gCanvas.width = gCanvas.parentElement.clientWidth;
        gCanvas.height = gCanvas.parentElement.clientHeight;
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
    btn.style.background = pausado ? "#00ffaa" : "#ff6600";
});

// Mouse
gCanvas.addEventListener("mousemove", (e) => {
    const rect = gCanvas.getBoundingClientRect();
    depredador.x = e.clientX - rect.left;
    depredador.y = e.clientY - rect.top;
});

// Táctil (Añadido para celular)
const handleTouch = (e) => {
    e.preventDefault();
    const rect = gCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    depredador.x = touch.clientX - rect.left;
    depredador.y = touch.clientY - rect.top;
};
gCanvas.addEventListener("touchstart", handleTouch, {passive: false});
gCanvas.addEventListener("touchmove", handleTouch, {passive: false});

function iniciarContador() {
    const timer = setInterval(() => {
        if (!juegoActivo) { clearInterval(timer); return; }
        if (!pausado) {
            tiempo--;
            if (tiempo <= 0 || vidas <= 0) {
                juegoActivo = false;
                if (puntos > mejorRecord) {
                    localStorage.setItem("mejorRecord", puntos);
                }
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

    const spanPeces = document.getElementById("obj-peces");
    const spanGlobos = document.getElementById("obj-globos");
    const spanDorado = document.getElementById("obj-dorado");

    spanPeces.innerText = `${pecesAtrapados}/10`;
    spanGlobos.innerText = `${globosEvitados}/2`;
    spanDorado.innerText = `${doradosAtrapados}/1`;

    if (pecesAtrapados >= 10) spanPeces.style.color = "#00ffaa";
    if (globosEvitados >= 2) spanGlobos.style.color = "#00ffaa";
    if (doradosAtrapados >= 1) spanDorado.style.color = "#00ffaa";

    document.getElementById("stat-peces").innerText = pecesAtrapados;
    document.getElementById("stat-danio").innerText = totalDanio;
}

function obtenerXDispersa() {
    let nuevaX;
    let intentos = 0;
    let muyCerca;
    do {
        nuevaX = Math.random() * (gCanvas.width - 50);
        muyCerca = pecesJuego.some(p => Math.abs(p.x - nuevaX) < 60 && p.y > gCanvas.height - 100);
        intentos++;
    } while (muyCerca && intentos < 10);
    return nuevaX;
}

function loop() {
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    burbujas.forEach(b => b.draw());

    if (juegoActivo && !pausado) {
        gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
        gCtx.drawImage(imgS.linterna, depredador.x - 40, depredador.y - 40, 80, 80);

        if (nivel === 1 && puntos >= 250) nivel = 2;
        else if (nivel === 2 && puntos >= 500) nivel = 3;
        else if (nivel === 3 && puntos >= 750) nivel = 4;
        else if (nivel === 4 && puntos >= 1000) nivel = 5;

        if (Math.random() < (0.02 + (nivel * 0.015))) {
            const tipos = ["azul", "dorado", "beta", "globo"];
            pecesJuego.push({
                x: obtenerXDispersa(),
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
                if (p.tipo === "globo") {
                    vidas--;
                    totalDanio++;
                } else {
                    puntos += (p.tipo === "dorado" ? 50 : 10);
                    pecesAtrapados++;
                    if (p.tipo === "dorado") doradosAtrapados++;
                }
                pecesJuego.splice(i, 1);
            }
        }
        actualizarUI();
    }
    requestAnimationFrame(loop);
}
loop();