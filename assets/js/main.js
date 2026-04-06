const canvas = document.getElementById("burbujas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

class Burbuja {
    constructor(isInitial = false) {
        this.isInitial = isInitial; // Para saber si es la carga inicial
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        
        // Si es el inicio, las esparcimos por toda la pantalla. 
        // Si no, las hacemos nacer desde abajo.
        if (this.isInitial) {
            this.y = Math.random() * canvas.height;
            this.isInitial = false; // Solo se usa una vez
        } else {
            this.y = canvas.height + Math.random() * 200;
        }

        // TAMAÑO MEDIANO: Radio entre 15 y 35
        this.size = Math.random() * 20 + 15; 
        
        this.speedY = Math.random() * 1 + 0.5;
        this.oscilacion = Math.random() * 0.02;
        this.angulo = Math.random() * Math.PI * 2;
    }

    update() {
        this.y -= this.speedY;
        this.angulo += this.oscilacion;
        this.x += Math.sin(this.angulo) * 0.5;

        // Si sale por arriba, reinicia abajo
        if (this.y < -this.size * 2) {
            this.init();
        }
    }

    draw() {
        ctx.save();
        
        let gradient = ctx.createRadialGradient(
            this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.1, 
            this.x, this.y, this.size
        );

        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)"); 
        gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.05)"); 
        gradient.addColorStop(0.9, "rgba(200, 230, 255, 0.3)"); 
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.4)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Reflejo brillante
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.4, this.y - this.size * 0.4, this.size * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();

        ctx.restore();
    }
}

let burbujas = [];
// Aumentamos a 30 para que se vea más poblado al ser medianas
for (let i = 0; i < 30; i++) {
    burbujas.push(new Burbuja(true)); // Enviamos true para que aparezcan en toda la pantalla al cargar
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    burbujas.forEach(b => {
        b.update();
        b.draw();
    });
    requestAnimationFrame(animate);
}

animate();