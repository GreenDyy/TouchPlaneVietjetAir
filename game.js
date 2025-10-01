// Hệ thống âm thanh
const sounds = {
    bgMusic: new Audio('assets/sounds/bg_song.mp3'),
    touchRight: new Audio('assets/sounds/touch_right.mp3'),
    bruh: new Audio('assets/sounds/bruh.mp3'),
    gameOver: new Audio('assets/sounds/sfx_game_over.mp3'),
    winner: new Audio('assets/sounds/sfx_winner.mp3')
};

// Cấu hình âm thanh
sounds.bgMusic.loop = true; // Nhạc nền lặp lại
sounds.bgMusic.volume = 0.5; // Giảm âm lượng nhạc nền

sounds.touchRight.volume = 0.5;
sounds.bruh.volume = 0.5;
sounds.gameOver.volume = 0.5;
sounds.winner.volume = 0.5;

// Game Configuration - Cấu hình game
const GAME_CONFIG = {
    // Debug
    SHOW_HITBOX: false,       // Bật/tắt hiển thị vòng tròn hitbox (true = hiện, false = ẩn)

    // Thời gian chơi
    GAME_TIME: 20,           // Thời gian countdown ban đầu (giây)
    TIME_BONUS: 2,           // Thời gian thưởng khi bắt đúng máy bay (giây)

    // Tốc độ bay của máy bay
    SPEED_DEFAULT: 6,        // Tốc độ mặc định
    SPEED_RANGE: 2,          // Khoảng random tốc độ thường

    // Máy bay siêu nhanh (Fast Planes)
    FAST_PLANE_CHANCE: 0.2,  // 20% cơ hội xuất hiện máy bay siêu nhanh
    SPEED_FAST: 10,          // Tốc độ của máy bay siêu nhanh
    SPEED_FAST_RANGE: 3,     // Khoảng random cho máy bay siêu nhanh (10-13)

    // Hit detection - Vùng click
    HITBOX_MULTIPLIER: 1.5,  // Tăng vùng click lên 1.5 lần để dễ bấm hơn

    // Spawn timing
    SPAWN_DELAY_MIN: 400,       // Delay tối thiểu giữa các lần spawn (ms)
    SPAWN_DELAY_RANGE: 400,     // Khoảng random delay (ms) - spawn mỗi 0.5-1 giây

    // Tỷ lệ spawn các loại máy bay
    SPAWN_RATE: {
        PLAYER: 0.5,      // 50% là máy bay VietJet
        HORIZONTAL: 0.25, // 25% bay ngang
        VERTICAL: 0.25    // 25% bay dọc
    }
};

// Danh sách hình ảnh theo loại
const imageCategories = {
    player: [
        'assets/player/vj1.png',
        'assets/player/vj2.png',
        'assets/player/vj3.png',
        'assets/player/vj4.png',
        'assets/player/vj5.png'
    ],
    horizontal: [
        'assets/fly_horizontal/horizontal_1.png',
        'assets/fly_horizontal/horizontal_2.png',
        'assets/fly_horizontal/horizontal_3.png',
    ],
    vertical: [
        'assets/fly_vertical/vertical_1.png',
        'assets/fly_vertical/vertical_2.png',
        'assets/fly_vertical/vertical_3.png'
    ]
};

// Preload images
let loadedImages = {
    player: [],
    horizontal: [],
    vertical: []
};
let imagesLoaded = false;

function preloadImages() {
    let totalImages = 0;
    let loadCount = 0;

    // Đếm tổng số ảnh
    Object.keys(imageCategories).forEach(category => {
        totalImages += imageCategories[category].length;
    });

    // Load từng category
    Object.keys(imageCategories).forEach(category => {
        imageCategories[category].forEach((src, index) => {
            const img = new Image();
            img.onload = function () {
                loadCount++;
                if (loadCount === totalImages) {
                    imagesLoaded = true;
                }
            };
            img.src = src;
            loadedImages[category].push(img);
        });
    });
}

// Game state
let gameState = {
    caughtPlanes: 0,
    totalPlanes: 10,
    vietjetSpawned: 0,    // Số máy bay VietJet đã xuất hiện
    maxVietjet: 10,       // Tổng số máy bay VietJet sẽ xuất hiện
    chances: 3,
    planesSpawned: 0,
    isGameRunning: false,
    planes: [],
    canvas: null,
    ctx: null,
    animationFrame: null,
    timeLeft: GAME_CONFIG.GAME_TIME,
    timerInterval: null
};

// Chuyển màn hình
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Modal functions
function showRulesModal() {
    document.getElementById('rules-modal').classList.add('active');
}

function closeRulesModal() {
    document.getElementById('rules-modal').classList.remove('active');
}

// Màn hình khảo sát
function showSurvey() {
    showScreen('survey-screen');
}

// Validate và hiển thị màn giới thiệu
function validateAndShowIntro() {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');

    if (!q1 || !q2) {
        alert('Vui lòng trả lời tất cả các câu hỏi!');
        return;
    }

    showScreen('intro-screen');
}

// Bắt đầu game
function startGame() {
    showScreen('game-screen');
    initGame();

    // Phát nhạc nền
    sounds.bgMusic.currentTime = 0;
    sounds.bgMusic.play().catch(e => console.log('Auto-play bị chặn:', e));
}

// Khởi tạo game
function initGame() {
    gameState.caughtPlanes = 0;
    gameState.planesSpawned = 0;
    gameState.vietjetSpawned = 0;
    gameState.chances = 3;
    gameState.planes = [];
    gameState.isGameRunning = true;
    gameState.timeLeft = GAME_CONFIG.GAME_TIME;

    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Update UI
    updateScore();
    updateTimer();

    // Start countdown timer
    startTimer();

    // Start spawning planes
    spawnPlane();

    // Start game loop
    gameLoop();

    // Add touch/click event
    gameState.canvas.addEventListener('click', handleCanvasClick);
    gameState.canvas.addEventListener('touchstart', handleCanvasTouch);
}

function resizeCanvas() {
    if (!gameState.canvas) return;
    gameState.canvas.width = window.innerWidth;
    gameState.canvas.height = window.innerHeight - 80;
}

function handleCanvasClick(e) {
    if (!gameState.isGameRunning) return;
    const rect = gameState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    checkHit(x, y);
}

function handleCanvasTouch(e) {
    if (!gameState.isGameRunning) return;
    e.preventDefault();
    const rect = gameState.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    checkHit(x, y);
}

function checkHit(x, y) {
    let hit = false;

    for (let i = gameState.planes.length - 1; i >= 0; i--) {
        const plane = gameState.planes[i];
        const distance = Math.sqrt(
            Math.pow(x - plane.x, 2) + Math.pow(y - plane.y, 2)
        );

        // Tăng hitbox bằng HITBOX_MULTIPLIER để dễ click hơn
        const hitRadius = (plane.size / 2) * GAME_CONFIG.HITBOX_MULTIPLIER;

        if (distance < hitRadius) {
            // Hit!
            hit = true;
            gameState.planes.splice(i, 1);

            if (plane.type === 'player') {
                // Chạm vào máy bay VietJet -> +1 điểm
                gameState.caughtPlanes++;

                // Thưởng thêm thời gian
                gameState.timeLeft += GAME_CONFIG.TIME_BONUS;
                updateTimer();
                showTimeBonusEffect();

                showHitEffect(x, y, true);
                sounds.touchRight.currentTime = 0;
                sounds.touchRight.play();
            } else {
                // Chạm nhầm vào horizontal/vertical -> -1 mạng
                gameState.chances--;
                showHitEffect(x, y, false);
                sounds.bruh.currentTime = 0;
                sounds.bruh.play();
            }

            updateScore();
            checkGameEnd();
            break;
        }
    }

    // Không làm gì khi miss (không click trúng gì)
}

function showHitEffect(x, y, isHit) {
    // Tạo vòng tròn lan tỏa (ripple)
    const ripple = {
        x: x,
        y: y,
        radius: 0,
        maxRadius: isHit ? 80 : 60,
        alpha: 1,
        color: isHit ? '#4CAF50' : '#F44336'
    };

    // Tạo particles bay tứ tung
    const particles = [];
    const particleCount = isHit ? 8 : 6;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3),
            size: 8 + Math.random() * 6,
            alpha: 1,
            color: isHit ? '#4CAF50' : '#F44336'
        });
    }

    // Text effect
    const text = isHit ? '+1' : 'X';
    const textEffect = {
        x: x,
        y: y,
        text: text,
        color: isHit ? '#4CAF50' : '#F44336',
        alpha: 1,
        size: 40,
        scale: 0.5
    };

    let frame = 0;
    const animate = function () {
        if (frame < 40) {
            gameState.ctx.save();

            // Vẽ ripple
            if (ripple.alpha > 0) {
                gameState.ctx.globalAlpha = ripple.alpha;
                gameState.ctx.strokeStyle = ripple.color;
                gameState.ctx.lineWidth = 4;
                gameState.ctx.beginPath();
                gameState.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                gameState.ctx.stroke();

                ripple.radius += 3;
                ripple.alpha -= 0.03;
            }

            // Vẽ particles
            particles.forEach(p => {
                if (p.alpha > 0) {
                    gameState.ctx.globalAlpha = p.alpha;
                    gameState.ctx.fillStyle = p.color;
                    gameState.ctx.shadowBlur = 10;
                    gameState.ctx.shadowColor = p.color;
                    gameState.ctx.beginPath();
                    gameState.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    gameState.ctx.fill();

                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.2; // Gravity
                    p.size *= 0.96;
                    p.alpha -= 0.03;
                }
            });

            // Vẽ text với bounce effect
            if (textEffect.alpha > 0) {
                // Bounce scale
                if (frame < 10) {
                    textEffect.scale = 0.5 + (frame / 10) * 0.7; // 0.5 -> 1.2
                } else if (frame < 15) {
                    textEffect.scale = 1.2 - ((frame - 10) / 5) * 0.2; // 1.2 -> 1.0
                }

                gameState.ctx.globalAlpha = textEffect.alpha;
                gameState.ctx.font = 'bold ' + (textEffect.size * textEffect.scale) + 'px Arial';
                gameState.ctx.fillStyle = textEffect.color;
                gameState.ctx.textAlign = 'center';
                gameState.ctx.textBaseline = 'middle';

                // Glow effect
                gameState.ctx.shadowBlur = 20;
                gameState.ctx.shadowColor = textEffect.color;

                gameState.ctx.fillText(textEffect.text, textEffect.x, textEffect.y);

                textEffect.y -= 2;
                textEffect.alpha -= 0.025;
            }

            gameState.ctx.restore();

            frame++;
            requestAnimationFrame(animate);
        }
    };
    animate();
}

function updateScore() {
    document.getElementById('caught-count').textContent =
        gameState.caughtPlanes + '/' + gameState.totalPlanes;
    document.getElementById('chances-left').textContent = gameState.chances;
    document.getElementById('vietjet-spawned').textContent =
        gameState.vietjetSpawned + '/' + gameState.maxVietjet;
}

// Timer functions
function startTimer() {
    // Clear existing timer nếu có
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(function () {
        if (gameState.isGameRunning) {
            gameState.timeLeft--;
            updateTimer();

            // Kiểm tra hết giờ
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerInterval);
                // Check điều kiện thắng thua
                if (gameState.caughtPlanes >= 6) {
                    endGame(true); // Thắng nếu đủ 6 máy bay
                } else {
                    endGame(false); // Thua nếu không đủ
                }
            }
        }
    }, 1000);
}

function updateTimer() {
    const timerElement = document.getElementById('time-left');
    timerElement.textContent = gameState.timeLeft + 's';

    // Thêm class warning/danger dựa vào thời gian còn lại
    timerElement.classList.remove('warning', 'danger');

    if (gameState.timeLeft <= 3) {
        timerElement.classList.add('danger');
    } else if (gameState.timeLeft <= 5) {
        timerElement.classList.add('warning');
    }
}

function showTimeBonusEffect() {
    const timerElement = document.getElementById('time-left');

    // Tạo element hiển thị "+2s"
    const bonusText = document.createElement('div');
    bonusText.className = 'time-bonus-effect';
    bonusText.textContent = '+' + GAME_CONFIG.TIME_BONUS + 's';

    // Thêm vào vị trí timer
    const scoreBox = timerElement.closest('.score-box');
    scoreBox.appendChild(bonusText);

    // Flash effect cho timer
    timerElement.classList.add('time-bonus-flash');

    // Xóa sau 1 giây
    setTimeout(function () {
        bonusText.remove();
        timerElement.classList.remove('time-bonus-flash');
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function checkGameEnd() {
    if (gameState.chances <= 0) {
        // Thua khi hết mạng
        endGame(false);
    } else if (gameState.vietjetSpawned >= gameState.maxVietjet) {
        // Đã spawn đủ 10 VietJet
        if (gameState.caughtPlanes >= 6) {
            endGame(true); // Thắng khi đủ 6 máy bay
        } else {
            // Kiểm tra xem còn VietJet nào trên màn hình không
            const hasVietjetOnScreen = gameState.planes.some(p => p.type === 'player');
            if (!hasVietjetOnScreen) {
                // Không còn VietJet nào trên màn mà chưa đủ 6 → Thua
                endGame(false);
            }
        }
    }
}

function endGame(isWin) {
    gameState.isGameRunning = false;

    if (gameState.animationFrame) {
        cancelAnimationFrame(gameState.animationFrame);
    }

    // Dừng timer
    stopTimer();

    // Dừng nhạc nền
    sounds.bgMusic.pause();
    sounds.bgMusic.currentTime = 0;

    setTimeout(function () {
        if (isWin) {
            showScreen('win-screen');
            sounds.winner.currentTime = 0;
            sounds.winner.play();
        } else {
            showScreen('lose-screen');
            sounds.gameOver.currentTime = 0;
            sounds.gameOver.play();
        }
    }, 500);
}

function spawnPlane() {
    if (!gameState.isGameRunning) {
        return;
    }

    // Random chọn loại đối tượng
    let type;

    // Nếu đã spawn đủ 10 VietJet thì chỉ spawn horizontal/vertical
    if (gameState.vietjetSpawned >= gameState.maxVietjet) {
        // Chỉ spawn horizontal hoặc vertical để tăng độ khó
        type = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    } else {
        // Còn VietJet thì random như bình thường
        const rand = Math.random();
        if (rand < GAME_CONFIG.SPAWN_RATE.PLAYER) {
            type = 'player';
        } else if (rand < GAME_CONFIG.SPAWN_RATE.PLAYER + GAME_CONFIG.SPAWN_RATE.HORIZONTAL) {
            type = 'horizontal';
        } else {
            type = 'vertical';
        }
    }

    let x, y, vx, vy;

    // Random tạo máy bay siêu nhanh
    const isFastPlane = Math.random() < GAME_CONFIG.FAST_PLANE_CHANCE;
    const speed = isFastPlane
        ? GAME_CONFIG.SPEED_FAST + Math.random() * GAME_CONFIG.SPEED_FAST_RANGE
        : GAME_CONFIG.SPEED_DEFAULT + Math.random() * GAME_CONFIG.SPEED_RANGE;

    if (type === 'vertical') {
        // Vertical = Bay theo chiều dọc (từ trên xuống hoặc dưới lên)
        const fromTop = Math.random() < 0.5;
        x = Math.random() * gameState.canvas.width;

        if (fromTop) {
            y = -50;
            vx = 0;
            vy = speed;
        } else {
            y = gameState.canvas.height + 50;
            vx = 0;
            vy = -speed;
        }
    } else if (type === 'horizontal') {
        // Horizontal = Bay theo chiều ngang (từ trái qua phải hoặc ngược lại)
        const fromLeft = Math.random() < 0.5;
        y = Math.random() * gameState.canvas.height;

        if (fromLeft) {
            x = -50;
            vx = speed;
            vy = 0;
        } else {
            x = gameState.canvas.width + 50;
            vx = -speed;
            vy = 0;
        }
    } else {
        // Player: bay từ 4 hướng random như cũ
        const side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0: // top
                x = Math.random() * gameState.canvas.width;
                y = -50;
                vx = (Math.random() - 0.5) * speed;
                vy = speed;
                break;
            case 1: // right
                x = gameState.canvas.width + 50;
                y = Math.random() * gameState.canvas.height;
                vx = -speed;
                vy = (Math.random() - 0.5) * speed;
                break;
            case 2: // bottom
                x = Math.random() * gameState.canvas.width;
                y = gameState.canvas.height + 50;
                vx = (Math.random() - 0.5) * speed;
                vy = -speed;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * gameState.canvas.height;
                vx = speed;
                vy = (Math.random() - 0.5) * speed;
                break;
        }
    }

    // Random chọn ảnh từ category tương ứng
    const imageIndex = Math.floor(Math.random() * imageCategories[type].length);

    // Tính rotation
    let rotation;
    if (type === 'vertical') {
        // Vertical: xoay theo hướng dọc
        if (vy > 0) {
            rotation = Math.PI / 2; // Bay xuống: 90° (đầu hướng xuống)
        } else {
            rotation = -Math.PI / 2; // Bay lên: -90° (đầu hướng lên)
        }
    } else {
        // Player và Horizontal: không xoay, chỉ flip khi cần
        rotation = 0;
    }

    // Đánh dấu nếu là VietJet thứ 10
    const isLastVietjet = (type === 'player' && gameState.vietjetSpawned === gameState.maxVietjet - 1);

    const plane = {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: 60,
        rotation: rotation,
        type: type,
        imageIndex: imageIndex,
        isFast: isFastPlane,  // Đánh dấu máy bay siêu nhanh
        isLastVietjet: isLastVietjet  // Đánh dấu máy bay VietJet thứ 10
    };

    gameState.planes.push(plane);
    gameState.planesSpawned++;

    // Nếu là VietJet thì tăng counter
    if (type === 'player') {
        gameState.vietjetSpawned++;
        updateScore(); // Update UI ngay
    }

    // Spawn next plane after delay (spawn liên tục cho đến khi game kết thúc)
    setTimeout(spawnPlane, GAME_CONFIG.SPAWN_DELAY_MIN + Math.random() * GAME_CONFIG.SPAWN_DELAY_RANGE);
}

function gameLoop() {
    if (!gameState.isGameRunning) return;

    // Clear canvas
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // Draw clouds
    drawClouds();

    // Update and draw planes
    for (let i = gameState.planes.length - 1; i >= 0; i--) {
        const plane = gameState.planes[i];

        // Update position
        plane.x += plane.vx;
        plane.y += plane.vy;

        // Remove if out of bounds
        if (plane.x < -100 || plane.x > gameState.canvas.width + 100 ||
            plane.y < -100 || plane.y > gameState.canvas.height + 100) {

            // Nếu là máy bay VietJet thứ 10 bay mất thì thua ngay
            if (plane.isLastVietjet) {
                gameState.planes.splice(i, 1);
                endGame(false); // Thua do để máy bay VietJet thứ 10 bay mất
                return;
            }

            gameState.planes.splice(i, 1);

            // Kiểm tra điều kiện kết thúc sau khi xóa máy bay
            checkGameEnd();

            continue;
        }

        // Draw plane
        drawPlane(plane);
    }

    gameState.animationFrame = requestAnimationFrame(gameLoop);
}

let clouds = [];

function drawClouds() {
    // Initialize clouds if empty
    if (clouds.length === 0) {
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * gameState.canvas.width,
                y: Math.random() * gameState.canvas.height,
                size: 40 + Math.random() * 60,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }

    // Draw and update clouds
    gameState.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let cloud of clouds) {
        gameState.ctx.beginPath();
        gameState.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        gameState.ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        gameState.ctx.arc(cloud.x - cloud.size * 0.6, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        gameState.ctx.fill();

        cloud.x += cloud.speed;
        if (cloud.x > gameState.canvas.width + cloud.size * 2) {
            cloud.x = -cloud.size * 2;
            cloud.y = Math.random() * gameState.canvas.height;
        }
    }
}

function drawPlane(plane) {
    // Chỉ vẽ các hiệu ứng khi SHOW_HITBOX = true
    if (GAME_CONFIG.SHOW_HITBOX) {
        // Vẽ hiệu ứng đặc biệt cho máy bay VietJet thứ 10 (QUAN TRỌNG!)
        if (plane.isLastVietjet) {
            gameState.ctx.save();
            gameState.ctx.strokeStyle = '#FFD700'; // Màu vàng kim
            gameState.ctx.lineWidth = 5;
            gameState.ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 150) * 0.3; // Nhấp nháy nhanh
            gameState.ctx.beginPath();
            gameState.ctx.arc(plane.x, plane.y, plane.size / 2 + 10, 0, Math.PI * 2);
            gameState.ctx.stroke();

            // Vẽ vòng thứ 2 để nổi bật hơn
            gameState.ctx.strokeStyle = '#FFA500';
            gameState.ctx.lineWidth = 3;
            gameState.ctx.beginPath();
            gameState.ctx.arc(plane.x, plane.y, plane.size / 2 + 15, 0, Math.PI * 2);
            gameState.ctx.stroke();
            gameState.ctx.restore();
        }
        // Vẽ hiệu ứng cho máy bay siêu nhanh
        else if (plane.isFast) {
            gameState.ctx.save();
            gameState.ctx.strokeStyle = '#FFA500'; // Màu cam
            gameState.ctx.lineWidth = 3;
            gameState.ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.4; // Nhấp nháy
            gameState.ctx.beginPath();
            gameState.ctx.arc(plane.x, plane.y, plane.size / 2 + 5, 0, Math.PI * 2);
            gameState.ctx.stroke();
            gameState.ctx.restore();
        }
    }

    // Vẽ vòng tròn debug để thấy phạm vi click (chỉ khi SHOW_HITBOX = true)
    if (GAME_CONFIG.SHOW_HITBOX) {
        gameState.ctx.save();
        gameState.ctx.strokeStyle = plane.type === 'player' ? '#00FF00' : '#FF0000';
        gameState.ctx.lineWidth = 2;
        gameState.ctx.beginPath();
        const debugRadius = (plane.size / 2) * GAME_CONFIG.HITBOX_MULTIPLIER;
        gameState.ctx.arc(plane.x, plane.y, debugRadius, 0, Math.PI * 2);
        gameState.ctx.stroke();
        gameState.ctx.restore();
    }

    // Kiểm tra xem ảnh đã load chưa
    if (!imagesLoaded || !loadedImages[plane.type] || !loadedImages[plane.type][plane.imageIndex]) {
        // Vẽ hình mặc định nếu ảnh chưa load
        gameState.ctx.save();
        gameState.ctx.translate(plane.x, plane.y);
        gameState.ctx.rotate(plane.rotation);

        gameState.ctx.fillStyle = '#E20074';
        gameState.ctx.beginPath();
        gameState.ctx.ellipse(0, 0, plane.size * 0.5, plane.size * 0.2, 0, 0, Math.PI * 2);
        gameState.ctx.fill();

        gameState.ctx.restore();
        return;
    }

    // Vẽ ảnh máy bay
    gameState.ctx.save();
    gameState.ctx.translate(plane.x, plane.y);

    // Xử lý rotation và flip
    switch (plane.type) {
        case 'vertical':
            // gameState.ctx.rotate(plane.rotation);
            break;

        case 'horizontal':
            if (plane.vx < 0) {
                gameState.ctx.scale(-1, 1); // Flip ngang
            }
            break;
            
        case 'player':
            // Player: Chỉ flip ngang khi bay từ phải sang trái
            if (plane.vx < 0) {
                gameState.ctx.scale(-1, 1); // Flip ngang
            }
            break;
            
        default:
            break;
    }

    const img = loadedImages[plane.type][plane.imageIndex];
    const width = plane.size * 1.5;
    const height = plane.size * 1.5;

    gameState.ctx.drawImage(img, -width / 2, -height / 2, width, height);

    gameState.ctx.restore();
}

// Rating system
let selectedRating = 0;

function rateStar(value) {
    selectedRating = value;
    const stars = document.querySelectorAll('.star');

    stars.forEach(function (star, index) {
        if (index < value) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });

    document.getElementById('rating-value').textContent =
        'Bạn đã đánh giá ' + value + ' sao';

    setTimeout(function () {
        showThankYou();
    }, 1500);
}

function showRating() {
    showScreen('rating-screen');
    selectedRating = 0;
    const stars = document.querySelectorAll('.star');
    stars.forEach(function (star) {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    document.getElementById('rating-value').textContent = '';
}

function showThankYou() {
    showScreen('thank-screen');
}

function restartGame() {
    // Dừng timer
    stopTimer();

    // Dừng tất cả âm thanh
    sounds.bgMusic.pause();
    sounds.bgMusic.currentTime = 0;
    sounds.winner.pause();
    sounds.gameOver.pause();

    // Reset survey
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(function (radio) {
        radio.checked = false;
    });

    // Reset clouds
    clouds = [];

    // Show welcome screen
    showScreen('welcome-screen');
}

// Initialize game when page loads
window.addEventListener('load', function () {
    preloadImages();
    showScreen('welcome-screen');
});

