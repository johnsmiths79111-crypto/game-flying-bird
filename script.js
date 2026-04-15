const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreSpan = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

// Mengambil elemen Audio
const bgMusic = document.getElementById("bgMusic");
const hitSound = document.getElementById("hitSound");
const jumpSound = document.getElementById("jumpSound");

let frames = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;

// Objek Burung
const bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    gravity: 0.25,
    lift: -5.5,
    velocity: 0,
    draw() {
        ctx.fillStyle = "#ffcc00"; // Burung direpresentasikan dengan kotak kuning
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Jatuh ke tanah
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            triggerGameOver();
        }
        // Mentok di langit
        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.velocity = this.lift;
        // Putar suara lompat
        jumpSound.currentTime = 0; 
        jumpSound.play().catch(e => console.log("Audio lompat belum siap"));
    }
};

// Objek Pipa
const pipes = {
    position: [],
    width: 50,
    gap: 130, // Jarak celah antar pipa atas dan bawah
    dx: 2, // Kecepatan pipa bergerak ke kiri
    draw() {
        ctx.fillStyle = "#2ecc71"; // Warna hijau pipa
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let topY = p.y;
            let bottomY = p.y + this.gap;

            // Gambar Pipa atas
            ctx.fillRect(p.x, 0, this.width, topY);
            // Gambar Pipa bawah
            ctx.fillRect(p.x, bottomY, this.width, canvas.height - bottomY);
        }
    },
    update() {
        // Tambah pipa baru setiap 100 frame
        if (frames % 100 === 0) {
            this.position.push({
                x: canvas.width,
                y: Math.random() * (canvas.height - this.gap - 50) + 20
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            p.x -= this.dx;

            // Hapus pipa yang sudah lewat layar dan tambah skor
            if (p.x + this.width <= 0) {
                this.position.shift();
                score++;
                i--;
                continue;
            }

            // Deteksi Tabrakan dengan Pipa
            let bottomPipeY = p.y + this.gap;
            if (
                bird.x < p.x + this.width &&
                bird.x + bird.width > p.x &&
                (bird.y < p.y || bird.y + bird.height > bottomPipeY)
            ) {
                triggerGameOver();
            }
        }
    }
};

// Tampilan Skor
function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.fillText(score, canvas.width / 2 - 10, 50);
}

// Fungsi ketika kalah
function triggerGameOver() {
    if (gameOver) return;
    gameOver = true;
    
    // Matikan musik background, hidupkan suara jatuh/tabrak
    bgMusic.pause();
    hitSound.play().catch(e => console.log("Audio jatuh belum siap"));
    
    gameOverScreen.classList.remove("hidden");
    finalScoreSpan.innerText = score;
}

// Fungsi mereset game
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.position = [];
    score = 0;
    frames = 0;
    gameOver = false;
    gameOverScreen.classList.add("hidden");
    
    // Putar ulang musik
    bgMusic.currentTime = 0;
    bgMusic.play().catch(e => console.log("Menunggu interaksi user untuk musik"));
    
    loop();
}

// Game Loop Utama
function loop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan layar

    bird.draw();
    bird.update();

    pipes.draw();
    pipes.update();

    drawScore();

    frames++;
    requestAnimationFrame(loop);
}

// Kontrol (Klik Mouse atau Tombol Spasi)
function handleAction() {
    if (gameOver) return;
    
    // Browser modern mewajibkan user berinteraksi (klik) dulu sebelum musik bisa menyala
    if (!gameStarted) {
        bgMusic.play().catch(e => console.log(e));
        gameStarted = true;
    }
    
    bird.flap();
}

canvas.addEventListener("mousedown", handleAction);
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        handleAction();
    }
});

restartBtn.addEventListener("click", resetGame);

// Mulai Game
loop();
