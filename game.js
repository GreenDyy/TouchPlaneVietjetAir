// Hệ thống âm thanh
const sounds = {
    menuTheme: new Audio('assets/sounds/menu_theme.mp3'),
    bgMusic: new Audio('assets/sounds/bg_song.mp3'),
    touchRight: new Audio('assets/sounds/touch_right.mp3'),
    bruh: new Audio('assets/sounds/bruh.mp3'),
    gameOver: new Audio('assets/sounds/sfx_game_over.mp3'),
    winner: new Audio('assets/sounds/sfx_winner.mp3'),
    cutIn: new Audio('assets/sounds/cut_in.mp3'),
    timerBeep: new Audio('assets/sounds/timer_beep.mp3'),
    rating: new Audio('assets/sounds/rating.mp3'),
    tap: new Audio('assets/sounds/tap_1.mp3'),
    thunder: new Audio('assets/sounds/thunder.mp3')
};

// Cấu hình âm thanh
sounds.menuTheme.loop = true; // Nhạc menu lặp lại
sounds.menuTheme.volume = 1;

sounds.bgMusic.loop = true; // Nhạc nền lặp lại
sounds.bgMusic.volume = 0.5; // Giảm âm lượng nhạc nền

sounds.touchRight.volume = 0.5;
sounds.bruh.volume = 0.5;
sounds.gameOver.volume = 0.5;
sounds.winner.volume = 0.5;
sounds.cutIn.volume = 0.7;
sounds.timerBeep.volume = 0.6;
sounds.rating.volume = 0.5;
sounds.tap.volume = 0.6;
sounds.thunder.volume = 0.7;

// Preload audio cho Android WebView
sounds.menuTheme.preload = 'auto';
sounds.bgMusic.preload = 'auto';
sounds.touchRight.preload = 'auto';
sounds.bruh.preload = 'auto';
sounds.gameOver.preload = 'auto';
sounds.winner.preload = 'auto';
sounds.cutIn.preload = 'auto';
sounds.timerBeep.preload = 'auto';
sounds.rating.preload = 'auto';
sounds.tap.preload = 'auto';
sounds.thunder.preload = 'auto';

// Helper function để play audio an toàn (tránh lỗi trên Android)
function playSoundSafe(sound) {
    try {
        if (sound.readyState >= 2) { // HAVE_CURRENT_DATA
            sound.currentTime = 0;
            sound.play().catch(function(e) {
                console.log('Audio play blocked:', e);
            });
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Game Configuration - Cấu hình game
const GAME_CONFIG = {
    // Debug
    SHOW_HITBOX: false,       // Bật/tắt hiển thị vòng tròn hitbox (true = hiện, false = ẩn)

    // Thời gian chơi
    GAME_TIME: 20,           // Thời gian countdown ban đầu (giây)
    TIME_BONUS: 2,           // Thời gian thưởng khi bắt đúng máy bay (giây)

    // Kích thước máy bay
    PLANE_SIZE: 50,          // Kích thước cơ bản của máy bay (px)
    PLANE_SIZE_MULTIPLIER: 2, // Hệ số nhân khi vẽ ảnh (1.5 = gấp 1.5 lần)

    // Tốc độ bay của máy bay
    SPEED_DEFAULT: 4,        // Tốc độ mặc định
    SPEED_RANGE: 2,          // Khoảng random tốc độ thường

    // Máy bay siêu nhanh (Fast Planes)
    FAST_PLANE_CHANCE: 0.2,  // 20% cơ hội xuất hiện máy bay siêu nhanh
    SPEED_FAST: 4,          // Tốc độ của máy bay siêu nhanh
    SPEED_FAST_RANGE: 2,     // Khoảng random cho máy bay siêu nhanh (10-13)

    // Hit detection - Vùng click
    HITBOX_MULTIPLIER: 1.8,  // Tăng vùng click lên 1.5 lần để dễ bấm hơn

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

// Difficulty settings
const DIFFICULTY_CONFIG = {
    easy: {
        gameTime: 30,
        speedMultiplier: 1,
        qrCode: 'assets/qr_code_level_1.png',
        voucherLink: 'https://evoucher.vietjetair.com',
        hasRain: false,
        hasFireEffect: false
    },
    medium: {
        gameTime: 20,
        speedMultiplier: 1.5,
        qrCode: 'assets/qr_code_level_2.png',
        voucherLink: 'https://evoucher.vietjetair.com/Vouchers/Details?AwardCampaign=454',
        hasRain: false,
        hasFireEffect: false
    },
    hard: {
        gameTime: 15,
        speedMultiplier: 2,
        qrCode: 'assets/qr_code_level_3.png',
        voucherLink: 'https://evoucher.vietjetair.com/Vouchers/Details?AwardCampaign=454',
        hasRain: true,
        hasFireEffect: true
    }
};

// Danh sách hình ảnh theo loại
const imageCategories = {
    player: [
        'assets/player/vj1.png',
        'assets/player/vj2.png',
        'assets/player/vj3.png',
        'assets/player/vj4.png',
        'assets/player/vj5.png',
        'assets/player/vj6.png',
        'assets/player/vj8.png',
        'assets/player/vj9.png',
        'assets/player/vj10.png',
        'assets/player/vj11.png',
        'assets/player/vj12.png',
        'assets/player/vj13.png',
        'assets/player/vj14.png'
    ],
    horizontal: [
        'assets/fly_horizontal/horizontal_1.png',
        'assets/fly_horizontal/horizontal_2.png',
        'assets/fly_horizontal/horizontal_3.png',
        'assets/fly_horizontal/horizontal_4.png',
        'assets/fly_horizontal/horizontal_5.png',
        'assets/fly_horizontal/horizontal_6.png',
        'assets/fly_horizontal/horizontal_7.png',
        'assets/fly_horizontal/horizontal_8.png'

    ],
    vertical: [
        'assets/fly_vertical/vertical_1.png',
        'assets/fly_vertical/vertical_2.png',
        'assets/fly_vertical/vertical_3.png',
        'assets/fly_vertical/vertical_4.png',
        'assets/fly_vertical/vertical_5.png',
        'assets/fly_vertical/vertical_6.png',
        'assets/fly_vertical/vertical_7.png',
        'assets/fly_vertical/vertical_8.png',
        'assets/fly_vertical/vertical_9.png',
        'assets/fly_vertical/vertical_10.png',
        'assets/fly_vertical/vertical_11.png',
    ],
    cloud: [
        'assets/cloud.png',
        'assets/cloud_2.png'
    ]
};

// Preload images
let loadedImages = {
    player: [],
    horizontal: [],
    vertical: [],
    cloud: []
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
    timerInterval: null,
    selectedMap: 1,       // Map mặc định
    mapBackground: null,  // Image object của map
    difficulty: 'medium'  // Độ khó mặc định
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
    createSurveyConfetti();
}

// Tạo hiệu ứng confetti cho survey
function createSurveyConfetti() {
    const confettiContainer = document.querySelector('.survey-confetti-container');
    confettiContainer.innerHTML = '';
    
    // Tạo 40 particles
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        // Random vị trí và timing
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        confettiContainer.appendChild(particle);
    }
}

// Validate và hiển thị màn giới thiệu
function validateAndShowIntro() {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');

    if (!q1 || !q2) {
        showFlashMessage();
        return;
    }

    showScreen('intro-screen');
}

// Hiển thị flash message khi thiếu câu trả lời
function showFlashMessage() {
    const flashMessage = document.getElementById('flash-message');

    // Hiển thị message với animation
    flashMessage.classList.add('show');

    // Ẩn message sau 3 giây
    setTimeout(function () {
        flashMessage.classList.remove('show');
    }, 3000);
}

// Bắt đầu game
// Hiển thị màn hình chọn map
function showMapSelection() {
    showScreen('map-selection-screen');
}

// Hiển thị màn hình chọn độ khó
function showDifficultySelection() {
    showScreen('difficulty-screen');
    createConfettiEffect();
}

// Tạo hiệu ứng confetti
function createConfettiEffect() {
    const confettiContainer = document.querySelector('.confetti-container');
    confettiContainer.innerHTML = '';
    
    // Tạo 30 particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        // Random vị trí và timing
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        confettiContainer.appendChild(particle);
    }
}

// Chọn map và chuyển sang màn hình chọn độ khó
function selectMap(mapId) {
    gameState.selectedMap = mapId;

    // Load ảnh map
    gameState.mapBackground = new Image();
    gameState.mapBackground.src = `assets/map/map_${mapId}.jpg`;

    // Chuyển sang màn hình chọn độ khó
    showDifficultySelection();
}

// Chọn độ khó và bắt đầu game
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    // Áp dụng config theo độ khó
    const config = DIFFICULTY_CONFIG[difficulty];
    gameState.timeLeft = config.gameTime;
    
    // Bắt đầu game
    startGame();
}

function startGame() {
    showScreen('game-screen');
    
    // Set background map cho game screen
    const gameScreen = document.getElementById('game-screen');
    gameScreen.style.backgroundImage = `url('assets/map/map_${gameState.selectedMap}.jpg')`;
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    
    // Hiển thị countdown trước khi bắt đầu game
    showCountdown();
}

function showCountdown() {
    const overlay = document.getElementById('countdown-overlay');
    const numberElement = document.getElementById('countdown-number');
    
    // Hiển thị overlay
    overlay.classList.add('active');
    
    let count = 3;
    numberElement.textContent = count;
    
    // Phát âm thanh beep cho số 3
    playSoundSafe(sounds.timerBeep);
    
    const countdownInterval = setInterval(function() {
        count--;
        
        if (count > 0) {
            // Hiển thị số 2, 1
            numberElement.textContent = count;
            
            // Phát âm thanh beep
            playSoundSafe(sounds.timerBeep);
            
            // Reset animation bằng cách xóa và thêm lại class
            numberElement.style.animation = 'none';
            setTimeout(function() {
                numberElement.style.animation = 'countdownPulse 1s ease-out';
            }, 10);
        } else {
            // Ẩn countdown overlay
            overlay.classList.remove('active');
            numberElement.textContent = '3'; // Reset về 3 cho lần sau
            
            // Hiển thị Cut-in Animation
            showCutinAnimation();
            
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function showCutinAnimation() {
    const cutinOverlay = document.getElementById('cutin-overlay');
    
    // Dừng nhạc menu theme
    sounds.menuTheme.pause();
    sounds.menuTheme.currentTime = 0;
    
    // Phát âm thanh cut-in ngay khi animation bắt đầu
    playSoundSafe(sounds.cutIn);
    
    // Hiển thị cut-in
    cutinOverlay.classList.add('active');
    
    // Sau 2 giây, fade out và bắt đầu game (để animation chạy đủ)
    setTimeout(function() {
        cutinOverlay.classList.add('fadeout');
        
        // Đợi fade out xong rồi mới bắt đầu game
        setTimeout(function() {
            cutinOverlay.classList.remove('active', 'fadeout');
            
            // Bắt đầu game thật sự
            initGame();
            
            // Phát nhạc nền game
            playSoundSafe(sounds.bgMusic);
        }, 500);
    }, 2000);
}

// Khởi tạo game
function initGame() {
    gameState.caughtPlanes = 0;
    gameState.planesSpawned = 0;
    gameState.vietjetSpawned = 0;
    gameState.chances = 3;
    gameState.planes = [];
    gameState.isGameRunning = true;
    
    // Áp dụng thời gian theo độ khó
    const difficultyConfig = DIFFICULTY_CONFIG[gameState.difficulty];
    gameState.timeLeft = difficultyConfig.gameTime;

    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Update UI
    updateScore();
    updateTimer();
    updateDifficultyDisplay();

    // Start countdown timer
    startTimer();
    
    // Start rain effect nếu là hard mode
    if (difficultyConfig.hasRain) {
        startRain();
    }
    
    // Start lightning effect nếu là hard mode
    if (difficultyConfig.hasRain) {
        startLightning();
    }

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

    // Lấy device pixel ratio, giới hạn tối đa 2 cho Android cũ để tăng performance
    let dpr = window.devicePixelRatio || 1;
    
    // Giảm DPR xuống 1.5 hoặc 1 cho thiết bị cũ để tăng FPS
    if (dpr > 2) {
        dpr = 2; // Giới hạn DPR tối đa là 2
    }
    
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight - 80;

    // Set canvas size với device pixel ratio
    gameState.canvas.width = displayWidth * dpr;
    gameState.canvas.height = displayHeight * dpr;

    // Scale canvas để hiển thị đúng kích thước
    gameState.canvas.style.width = displayWidth + 'px';
    gameState.canvas.style.height = displayHeight + 'px';

    // Reset transform và scale context để vẽ đúng tỷ lệ
    gameState.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    e.stopPropagation(); // Ngăn event bubbling để tăng performance
    
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
                playSoundSafe(sounds.touchRight);
            } else {
                // Chạm nhầm vào horizontal/vertical -> -1 mạng
                gameState.chances--;
                showHitEffect(x, y, false);
                playSoundSafe(sounds.bruh);
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

// Update difficulty display
function updateDifficultyDisplay() {
    const difficultyNames = {
        'easy': 'Dễ',
        'medium': 'Thường',
        'hard': 'Khó'
    };
    document.getElementById('difficulty-level').textContent = 
        difficultyNames[gameState.difficulty] || 'Thường';
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
    // Thắng ngay khi bắt được 6 máy bay
    if (gameState.caughtPlanes >= 6) {
        endGame(true);
        return;
    }

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

    // Dừng rain nếu có
    stopRain();
    
    // Dừng lightning nếu có
    stopLightning();
    
    setTimeout(function () {
        if (isWin) {
            // Cập nhật QR code và link theo level
            const qrImage = document.getElementById('qr-image');
            const voucherLink = document.getElementById('voucher-link');
            const difficultyConfig = DIFFICULTY_CONFIG[gameState.difficulty];
            
            qrImage.src = difficultyConfig.qrCode;
            voucherLink.href = difficultyConfig.voucherLink;
            voucherLink.textContent = difficultyConfig.voucherLink;
            
            showScreen('win-screen');
            playSoundSafe(sounds.winner);
        } else {
            // Hiển thị popup "THUA" trước
            showGameOverPopup();
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
    const baseSpeed = isFastPlane
        ? GAME_CONFIG.SPEED_FAST + Math.random() * GAME_CONFIG.SPEED_FAST_RANGE
        : GAME_CONFIG.SPEED_DEFAULT + Math.random() * GAME_CONFIG.SPEED_RANGE;
    
    // Áp dụng speed multiplier theo độ khó
    const difficultyConfig = DIFFICULTY_CONFIG[gameState.difficulty];
    const speed = baseSpeed * difficultyConfig.speedMultiplier;

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
        // Giới hạn vùng spawn: từ 15% đến 75% chiều cao màn hình (tránh quá thấp hoặc quá cao)
        y = gameState.canvas.height * 0.15 + Math.random() * (gameState.canvas.height * 0.6);

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
                // Giới hạn vùng spawn: từ 15% đến 75% chiều cao (tránh quá thấp)
                y = gameState.canvas.height * 0.15 + Math.random() * (gameState.canvas.height * 0.6);
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
                // Giới hạn vùng spawn: từ 15% đến 75% chiều cao (tránh quá thấp)
                y = gameState.canvas.height * 0.15 + Math.random() * (gameState.canvas.height * 0.6);
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
        size: GAME_CONFIG.PLANE_SIZE,
        rotation: rotation,
        type: type,
        imageIndex: imageIndex,
        isFast: isFastPlane,  // Đánh dấu máy bay siêu nhanh
        isLastVietjet: isLastVietjet,  // Đánh dấu máy bay VietJet thứ 10
        // Thêm thuộc tính cho animation xoay nhẹ của player
        rotationOffset: 0,  // Góc xoay hiện tại (dao động)
        rotationSpeed: 0.02 + Math.random() * 0.02,  // Tốc độ xoay (áp dụng bộ object)
        rotationTime: 0  // Biến thời gian để tính sin wave
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

    // Draw map background
    if (gameState.mapBackground && gameState.mapBackground.complete) {
        gameState.ctx.save();

        // Cải thiện chất lượng ảnh background
        gameState.ctx.imageSmoothingEnabled = true;
        // imageSmoothingQuality không được hỗ trợ trên Android 6, kiểm tra trước khi dùng
        if (gameState.ctx.imageSmoothingQuality) {
            gameState.ctx.imageSmoothingQuality = 'high';
        }

        gameState.ctx.drawImage(
            gameState.mapBackground,
            0, 0,
            gameState.canvas.width,
            gameState.canvas.height
        );
        gameState.ctx.restore();
    }

    // Draw clouds
    drawClouds();

    // Update and draw planes
    for (let i = gameState.planes.length - 1; i >= 0; i--) {
        const plane = gameState.planes[i];

        // Update position
        plane.x += plane.vx;
        plane.y += plane.vy;

        // Update rotation cho player planes (tạo hiệu ứng lắc lư nhẹ)
        // Dùng indexOf thay vì includes để tương thích Android 6
        if (plane.type === 'player' || plane.type === 'horizontal' || plane.type === 'vertical') {
            plane.rotationTime += plane.rotationSpeed;
            // Dao động từ -0.15 đến +0.15 radian (~-8° đến +8°)
            plane.rotationOffset = Math.sin(plane.rotationTime) * 0.15;
        }

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
                size: 80 + Math.random() * 100,
                speed: 0.2 + Math.random() * 0.3,
                imageIndex: Math.floor(Math.random() * 2), // Random chọn cloud.png hoặc cloud_2.png
                opacity: 0.5 + Math.random() * 0.3 // Random opacity từ 0.5 đến 0.8
            });
        }
    }

    // Draw and update clouds với ảnh
    for (let cloud of clouds) {
        // Kiểm tra xem ảnh đã load chưa
        if (imagesLoaded && loadedImages.cloud && loadedImages.cloud[cloud.imageIndex]) {
            gameState.ctx.save();

            // Cải thiện chất lượng ảnh mây
            gameState.ctx.imageSmoothingEnabled = true;
            if (gameState.ctx.imageSmoothingQuality) {
                gameState.ctx.imageSmoothingQuality = 'high';
            }

            gameState.ctx.globalAlpha = cloud.opacity;

            const img = loadedImages.cloud[cloud.imageIndex];
            const width = cloud.size;
            const height = cloud.size * 0.6; // Tỉ lệ chiều cao/rộng của mây

            gameState.ctx.drawImage(img, cloud.x, cloud.y, width, height);
            gameState.ctx.restore();
        }

        // Di chuyển mây
        cloud.x += cloud.speed;
        if (cloud.x > gameState.canvas.width + cloud.size) {
            cloud.x = -cloud.size;
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
        // Máy bay siêu nhanh không có hiệu ứng đặc biệt - chỉ dùng hitbox bình thường
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

    // Cải thiện chất lượng ảnh khi scale
    gameState.ctx.imageSmoothingEnabled = true;
    if (gameState.ctx.imageSmoothingQuality) {
        gameState.ctx.imageSmoothingQuality = 'high';
    }
    gameState.ctx.translate(plane.x, plane.y);

    // Xử lý rotation và flip
    switch (plane.type) {
        case 'vertical':
            gameState.ctx.rotate(plane.rotationOffset); break;

        case 'horizontal':
            gameState.ctx.rotate(plane.rotationOffset);
            if (plane.vx < 0) {
                gameState.ctx.scale(-1, 1); // Flip ngang
            }
            break;

        case 'player':
            // Player: Áp dụng rotation nhẹ để tạo cảm giác bay
            gameState.ctx.rotate(plane.rotationOffset);

            // Chỉ flip ngang khi bay từ phải sang trái
            if (plane.vx < 0) {
                gameState.ctx.scale(-1, 1); // Flip ngang
            }
            break;

        default:
            break;
    }

    const img = loadedImages[plane.type][plane.imageIndex];
    const width = plane.size * GAME_CONFIG.PLANE_SIZE_MULTIPLIER;
    const height = plane.size * GAME_CONFIG.PLANE_SIZE_MULTIPLIER;

    gameState.ctx.drawImage(img, -width / 2, -height / 2, width, height);

    gameState.ctx.restore();
}

// Rating system
let selectedRating = 0;

function rateStar(value) {
    selectedRating = value;
    
    // Phát âm thanh rating
    playSoundSafe(sounds.rating);
    
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

    // Emoji tương ứng với từng mức đánh giá
    const emojiMap = {
        1: '😢',  // Rất tệ
        2: '🙁',  // Không hài lòng
        3: '😐',  // Bình thường
        4: '😊',  // Tốt
        5: '😍'   // Tuyệt vời
    };

    document.getElementById('rating-emoji').textContent = emojiMap[value];
    document.getElementById('rating-value').textContent = '';

    setTimeout(function () {
        showThankYou();
    }, 1500);
}

function showRating() {
    showScreen('rating-screen');
    selectedRating = 0;
    // Reset emoji về mặc định
    document.getElementById('rating-emoji').textContent = '🤔';
    document.getElementById('rating-value').textContent = '';
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
    
    // Phát lại nhạc menu theme
    playSoundSafe(sounds.menuTheme);
}

// Rain effect functions
function startRain() {
    const rainContainer = document.getElementById('rain-container');
    rainContainer.classList.add('active');
    
    // Tạo 50 giọt mưa
    for (let i = 0; i < 50; i++) {
        createRaindrop();
    }
}

function createRaindrop() {
    const rainContainer = document.getElementById('rain-container');
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    
    // Random vị trí và timing
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
    drop.style.animationDelay = Math.random() * 2 + 's';
    
    rainContainer.appendChild(drop);
    
    // Tự động tạo giọt mưa mới khi giọt cũ kết thúc
    drop.addEventListener('animationiteration', function() {
        if (rainContainer.classList.contains('active')) {
            drop.style.left = Math.random() * 100 + '%';
        }
    });
}

function stopRain() {
    const rainContainer = document.getElementById('rain-container');
    rainContainer.classList.remove('active');
    rainContainer.innerHTML = '';
}

// Lightning effect functions for hard mode
let lightningInterval = null;

function startLightning() {
    const lightningOverlay = document.getElementById('lightning-overlay');
    
    function triggerLightning() {
        if (!gameState.isGameRunning) return;
        
        // Phát âm thanh sấm
        playSoundSafe(sounds.thunder);
        
        // Add flash class
        lightningOverlay.classList.add('flash');
        
        // Remove class sau khi animation xong
        setTimeout(function() {
            lightningOverlay.classList.remove('flash');
        }, 500);
        
        // Schedule next lightning (random 5-12 giây)
        const nextLightning = 2000 + Math.random() * 5000;
        lightningInterval = setTimeout(triggerLightning, nextLightning);
    }
    
    // Trigger lightning đầu tiên sau 3-8 giây
    const firstLightning = 3000 + Math.random() * 5000;
    lightningInterval = setTimeout(triggerLightning, firstLightning);
}

function stopLightning() {
    if (lightningInterval) {
        clearTimeout(lightningInterval);
        lightningInterval = null;
    }
    
    const lightningOverlay = document.getElementById('lightning-overlay');
    if (lightningOverlay) {
        lightningOverlay.classList.remove('flash');
    }
}

// Game Over Popup
let gameOverTimeout = null;

function showGameOverPopup() {
    const popup = document.getElementById('game-over-popup');
    const popupScore = document.getElementById('popup-score');
    
    // Cập nhật số máy bay bắt được
    popupScore.textContent = gameState.caughtPlanes;
    
    // Phát âm thanh game over
    playSoundSafe(sounds.gameOver);
    
    // Hiển thị popup
    popup.classList.add('show');
    
    // Function để chuyển màn
    function goToLoseScreen() {
        if (gameOverTimeout) {
            clearTimeout(gameOverTimeout);
            gameOverTimeout = null;
        }
        
        popup.classList.remove('show');
        
        // Đợi fade out xong rồi chuyển màn
        setTimeout(function() {
            showScreen('lose-screen');
        }, 300);
        
        // Remove event listeners
        popup.removeEventListener('click', goToLoseScreen);
        popup.removeEventListener('touchstart', goToLoseScreen);
    }
    
    // Thêm event listener cho click/touch để skip
    popup.addEventListener('click', goToLoseScreen);
    popup.addEventListener('touchstart', goToLoseScreen);
    
    // Sau 3 giây, tự động chuyển màn
    gameOverTimeout = setTimeout(goToLoseScreen, 5000);
}

// Audio unlock handler
function unlockAudio() {
    const audioUnlock = document.getElementById('audio-unlock');
    
    // Phát nhạc menu theme
    playSoundSafe(sounds.menuTheme);
    
    // Ẩn overlay
    audioUnlock.classList.add('hidden');
    
    // Remove event listener
    audioUnlock.removeEventListener('click', unlockAudio);
    audioUnlock.removeEventListener('touchstart', unlockAudio);
}

// Setup tap sound cho tất cả buttons
function setupButtonTapSound() {
    // Lấy tất cả các button và element có class btn
    const buttons = document.querySelectorAll('button, .btn, .map-item, .difficulty-card, .star');
    
    buttons.forEach(function(button) {
        // Click event
        button.addEventListener('click', function() {
            playSoundSafe(sounds.tap);
        }, { passive: true });
        
        // Touch event cho mobile
        button.addEventListener('touchstart', function() {
            playSoundSafe(sounds.tap);
        }, { passive: true });
    });
}

// Initialize game when page loads
window.addEventListener('load', function () {
    preloadImages();
    showScreen('welcome-screen');
    
    // Setup audio unlock
    const audioUnlock = document.getElementById('audio-unlock');
    audioUnlock.addEventListener('click', unlockAudio);
    audioUnlock.addEventListener('touchstart', unlockAudio);
    
    // Setup tap sound cho tất cả buttons
    setupButtonTapSound();
});

