const canvas = document.getElementById('wavepush');
const ctx = canvas.getContext('2d');
var w = canvas.width = window.innerWidth;
var h = canvas.height = window.innerHeight;

var waveCount = 12;
var numberOfParticles = 12;
var bandHeight = h / waveCount;
var offScreen = 100;

let wavesArray;
let offset = 0;

// ----------------------------------------------

// Initialize mouse
let mouse = {
    x: undefined,
    y: undefined,
    radius: (h / 80) * (w / 80),
}

// Handle mouse move
window.addEventListener('mousemove',
    function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
);

// Handle mouse off screen
window.addEventListener('mouseout',
    function () {
        mouse.x = undefined;
        mouse.y = undefined;
    }
)

// Handle window resize
window.addEventListener('resize',
    function () {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        bandHeight = h / waveCount;
        mouse.radius = ((h / 80) * (w / 80));
        init();
    }
);

function init() {
    wavesArray = []; // Reset array
    for (let i = 0; i < waveCount; i++) {
        particlesArray = [];
        let y = bandHeight * (i + 1) - bandHeight / 2; // The middle of their band

        for (let p = 0; p < numberOfParticles; p++) {
            let x = -offScreen + ((w + offScreen * 2) / (numberOfParticles - 1)* p);
            
            particlesArray.push({
                x,
                y,
                xPos: x,
                yPos: y,
                vX: 0,
                vY: 0,
                amplitude: 5 + Math.random() * 30,
                period: Math.random()* Math.PI * 2,
                length: 0.005 + Math.random() * 0.01
            });
        }
        wavesArray.push(particlesArray);
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, w, h);
    offset -= 0.005; // Wave speed

    for (let i = 0; i < wavesArray.length; i++) {
        let wave = wavesArray[i];

        for (let j = 0; j < wave.length; j++) {
            p = wave[j];
            const layer1 = Math.sin(offset + p.period + (p.xPos * p.length)) * p.amplitude;
            const layer2 = Math.sin(offset * 2.5 + (p.xPos * 0.03)) * p.amplitude * 0.4;
            const layer3 = Math.sin(offset * 5 + (p.xPos * 0.08)) * 5;

            const dx = p.xPos - mouse.x;
            const dy = p.yPos - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouse.radius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouse.radius - dist) / mouse.radius;
                // The "bounce"
                p.vX += Math.cos(angle) * force;
                p.vY += Math.sin(angle) * force * 3;
            }

            p.vX += (p.xPos - p.x) * 0.05;
            p.vY += (p.yPos + layer1 + layer2 + layer3 - p.y) * 0.05;

            p.vX *= 0.9;
            p.vY *= 0.9;

            p.x += p.vX;
            p.y += p.vY;
        }

        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';

        ctx.moveTo(wave[0].x, wave[0].y);
        for (let p = 1; p < wave.length - 1; p++) {
            // Calculate the midpoint between the next two particles
            const xc = (wave[p].x + wave[p + 1].x) / 2;
            const yc = (wave[p].y + wave[p + 1].y) / 2;

            // Use current particle as Bezier Curve control point and the midpoint as the destination
            ctx.quadraticCurveTo(wave[p].x, wave[p].y, xc, yc);
        }

        ctx.stroke();
    }
    requestAnimationFrame(animateParticles);
}

init();
animateParticles();
