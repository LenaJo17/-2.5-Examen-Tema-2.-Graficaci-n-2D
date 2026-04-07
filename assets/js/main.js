const bCanvas = document.getElementById("burbujas");
const bCtx = bCanvas.getContext("2d");
const gCanvas = document.getElementById("gameCanvas");
const gCtx = gCanvas.getContext("2d");

let juegoActivo = false;
let puntos = 0, vidas = 3, tiempo = 50, nivel = 1;
let burbujas = [], pecesJuego = [];

// Imágenes
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
        // Ajustamos el canvas interno al contenedor de cristal
        gCanvas.width = gCanvas.parentElement.clientWidth;
        gCanvas.height = gCanvas.parentElement.clientHeight;
    }
}
window.addEventListener("resize", resize);
resize();

// Clase Burbuja Realista
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

// Lógica de cambio de pantalla
document.getElementById("btn-jugar").addEventListener("click", () => {
    document.getElementById("menu-inicio").style.display = "none"; // Oculta TODO el inicio
    document.getElementById("game-container").style.display = "flex"; // Muestra el cuadro de juego
    juegoActivo = true;
    resize();
    iniciarContador();
});

gCanvas.addEventListener("mousemove", (e) => {
    const rect = gCanvas.getBoundingClientRect();
    depredador.x = e.clientX - rect.left;
    depredador.y = e.clientY - rect.top;
});

function iniciarContador() {
    const timer = setInterval(() => {
        if (!juegoActivo) { clearInterval(timer); return; }
        tiempo--;
        if (tiempo <= 0 || vidas <= 0) {
            juegoActivo = false;
            alert(`Fin del Juego. Puntos: ${puntos}`);
            location.reload();
        }
    }, 1000);
}

function loop() {
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    burbujas.forEach(b => b.draw());

    if (juegoActivo) {
        gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
        
        // Dibujar depredador (Pez Linterna)
        gCtx.drawImage(imgS.linterna, depredador.x - 40, depredador.y - 40, 80, 80);

        // Generar peces comida
        if (Math.random() < 0.03) {
            const t = ["azul", "dorado", "beta", "globo"];
            pecesJuego.push({
                x: Math.random() * (gCanvas.width - 40),
                y: gCanvas.height + 40,
                tipo: t[Math.floor(Math.random() * 4)],
                speed: 1.5 + (nivel * 0.3)
            });
        }

        pecesJuego.forEach((p, i) => {
            p.y -= p.speed;
            gCtx.drawImage(imgS[p.tipo], p.x, p.y, 45, 45);
            
            // Colisión
            let d = Math.hypot(depredador.x - (p.x + 22), depredador.y - (p.y + 22));
            if (d < 45) {
                if (p.tipo === "globo") vidas--;
                else puntos += 10;
                pecesJuego.splice(i, 1);
            }
        });

        // UI
        document.getElementById("puntos").innerText = puntos;
        document.getElementById("vidas").innerText = vidas;
        document.getElementById("tiempo").innerText = tiempo;
        document.getElementById("nivel").innerText = nivel;
    }
    requestAnimationFrame(loop);
}
loop();