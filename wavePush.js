const canvas = document.getElementById('wavepush');
canvas.style.overflow = 'hidden';
const ctx = canvas.getContext('2d');
var w = canvas.width = window.innerWidth;
var h = canvas.height = window.innerHeight;

let offScreen = 100;
let wavesArray;
let offset = 0;

var waveCount, bandHeight, numberOfParticles, waveColor, waveSize, randomMult;

// Set customizeable value defaults
function setDefaultValues() {
    offScreen = 100;
    waveCount = 12;
    bandHeight = h / waveCount;
    numberOfParticles = 12;
    waveColor = '#fff';
    waveSize = 8;
    randomMult = 1;
}

setDefaultValues();

// ----------------------------------------------
const form = document.forms[0];
const apply = document.getElementById('apply');
const reset = document.getElementById('reset');

// Customizeable form input processing
var pending;
apply.addEventListener('click', (e) => {
    e.preventDefault();
    if (form.lineColor.value !== "")
        waveColor = form.lineColor.value;

    if (form.waveCount.value !== "") {
        pending = parseInt(form.waveCount.value);
        if (Number.isInteger(pending)) {
            if (pending < 1) pending = 1;
            if (pending > 500) pending = 500;
            waveCount = pending;
            bandHeight = h / waveCount;
        }
    }

    if (form.size.value !== "") {
        pending = parseInt(form.size.value);
        if (Number.isInteger(pending)) {
            if (pending < 1) pending = 1;
            if (pending > 50) pending = 50;
            waveSize = pending;
        }
    }

    if (form.particleCount.value !== "") {
        pending = parseInt(form.particleCount.value);
        if (Number.isInteger(pending)) {
            if (pending < 3) pending = 3;
            if (pending > 200) pending = 200;
            numberOfParticles = pending;
        }
    }

    if (form.random.value !== "") {
        pending = parseInt(form.random.value);
        if (Number.isInteger(pending)) {
            if (pending < 1) pending = 1;
            if (pending > 100) pending = 100;
            randomMult = pending / 10;
        }
    }

    init();
});

// Reset form input values
reset.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent page refresh
    form.lineColor.value = "";
    form.waveCount.value = "";
    form.size.value = "";
    form.particleCount.value = "";
    form.random.value = "";

    setDefaultValues(); // Reset values
    init();
});

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
            let x = -offScreen + ((w + offScreen * 2) / (numberOfParticles - 1) * p);

            particlesArray.push({
                x,
                y,
                xPos: x,
                yPos: y,
                vX: 0,
                vY: 0,
                amplitude: 5 + Math.random() * 30,
                period: Math.random() * Math.PI * 2,
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
            const layer1 = Math.sin(offset + p.period + (p.xPos * p.length)) * p.amplitude * randomMult;
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
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = waveSize;
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
