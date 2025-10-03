// Hệ thống âm thanh
var sounds = {
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
var GAME_CONFIG = {
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
var DIFFICULTY_CONFIG = {
    easy: {
        gameTime: 30,
        speedMultiplier: 1,
        chances: 3,
        qrCode: 'assets/qr_code_level_1.png',
        voucherLink: 'https://evoucher.vietjetair.com',
        hasRain: false,
        hasFireEffect: false
    },
    medium: {
        gameTime: 20,
        speedMultiplier: 1.5,
        chances: 2,
        qrCode: 'assets/qr_code_level_2.png',
        voucherLink: 'https://evoucher.vietjetair.com/Vouchers/Details?AwardCampaign=454',
        hasRain: false,
        hasFireEffect: false
    },
    hard: {
        gameTime: 15,
        speedMultiplier: 2,
        chances: 1,
        qrCode: 'assets/qr_code_level_3.png',
        voucherLink: 'https://evoucher.vietjetair.com/Vouchers/Details?AwardCampaign=454',
        hasRain: true,
        hasFireEffect: true
    }
};

// Danh sách hình ảnh theo loại
var imageCategories = {
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
var loadedImages = {
    player: [],
    horizontal: [],
    vertical: [],
    cloud: []
};
var imagesLoaded = false;

function preloadImages() {
    var totalImages = 0;
    var loadCount = 0;

    // Đếm tổng số ảnh
    Object.keys(imageCategories).forEach(function(category) {
        totalImages += imageCategories[category].length;
    });

    // Load từng category
    Object.keys(imageCategories).forEach(function(category) {
        imageCategories[category].forEach(function(src, index) {
            var img = new Image();
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
var gameState = {
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
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function(screen) {
        screen.classList.remove('active');
    });
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
    console.log('========== SHOW SURVEY CALLED ==========');
    try {
        console.log('Navigating to survey screen...');
        showScreen('survey-screen');
        console.log('Creating confetti...');
        createSurveyConfetti();
        console.log('========== SHOW SURVEY SUCCESS ==========');
    } catch (error) {
        console.error('ERROR in showSurvey:', error);
        console.error('Error stack:', error.stack);
    }
}

// Tạo hiệu ứng confetti cho survey
function createSurveyConfetti() {
    var confettiContainer = document.querySelector('.survey-confetti-container');
    confettiContainer.innerHTML = '';
    
    // Tạo 40 particles
    for (var i = 0; i < 40; i++) {
        var particle = document.createElement('div');
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
    var q1 = document.querySelector('input[name="q1"]:checked');
    var q2 = document.querySelector('input[name="q2"]:checked');

    if (!q1 || !q2) {
        showFlashMessage();
        return;
    }

    showScreen('intro-screen');
}

// Hiển thị flash message khi thiếu câu trả lời
function showFlashMessage() {
    var flashMessage = document.getElementById('flash-message');

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
    var confettiContainer = document.querySelector('.confetti-container');
    confettiContainer.innerHTML = '';
    
    // Tạo 30 particles
    for (var i = 0; i < 30; i++) {
        var particle = document.createElement('div');
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
    gameState.mapBackground.src = 'assets/map/map_' + mapId + '.jpg';

    // Chuyển sang màn hình chọn độ khó
    showDifficultySelection();
}

// Chọn độ khó và bắt đầu game
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    // Áp dụng config theo độ khó
    var config = DIFFICULTY_CONFIG[difficulty];
    gameState.timeLeft = config.gameTime;
    
    // Bắt đầu game
    startGame();
}

function startGame() {
    showScreen('game-screen');
    
    // Set background map cho game screen
    var gameScreen = document.getElementById('game-screen');
    gameScreen.style.backgroundImage = 'url(\'assets/map/map_' + gameState.selectedMap + '.jpg\')';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    
    // Hiển thị countdown trước khi bắt đầu game
    showCountdown();
}

function showCountdown() {
    var overlay = document.getElementById('countdown-overlay');
    var numberElement = document.getElementById('countdown-number');
    
    // Hiển thị overlay
    overlay.classList.add('active');
    
    var count = 3;
    numberElement.textContent = count;
    
    // Phát âm thanh beep cho số 3
    playSoundSafe(sounds.timerBeep);
    
    var countdownInterval = setInterval(function() {
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
    var cutinOverlay = document.getElementById('cutin-overlay');
    
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
    gameState.planes = [];
    gameState.isGameRunning = true;
    
    // Áp dụng config theo độ khó
    var difficultyConfig = DIFFICULTY_CONFIG[gameState.difficulty];
    gameState.timeLeft = difficultyConfig.gameTime;
    gameState.chances = difficultyConfig.chances;

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
    var dpr = window.devicePixelRatio || 1;
    
    // Giảm DPR xuống 1.5 hoặc 1 cho thiết bị cũ để tăng FPS
    if (dpr > 2) {
        dpr = 2; // Giới hạn DPR tối đa là 2
    }
    
    var displayWidth = window.innerWidth;
    var displayHeight = window.innerHeight - 80;

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
    var rect = gameState.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    checkHit(x, y);
}

function handleCanvasTouch(e) {
    if (!gameState.isGameRunning) return;
    e.preventDefault();
    e.stopPropagation(); // Ngăn event bubbling để tăng performance
    
    var rect = gameState.canvas.getBoundingClientRect();
    var touch = e.touches[0];
    var x = touch.clientX - rect.left;
    var y = touch.clientY - rect.top;
    checkHit(x, y);
}

function checkHit(x, y) {
    var hit = false;

    for (var i = gameState.planes.length - 1; i >= 0; i--) {
        var plane = gameState.planes[i];
        var distance = Math.sqrt(
            Math.pow(x - plane.x, 2) + Math.pow(y - plane.y, 2)
        );

        // Tăng hitbox bằng HITBOX_MULTIPLIER để dễ click hơn
        var hitRadius = (plane.size / 2) * GAME_CONFIG.HITBOX_MULTIPLIER;

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
    var ripple = {
        x: x,
        y: y,
        radius: 0,
        maxRadius: isHit ? 80 : 60,
        alpha: 1,
        color: isHit ? '#4CAF50' : '#F44336'
    };

    // Tạo particles bay tứ tung
    var particles = [];
    var particleCount = isHit ? 8 : 6;
    for (var i = 0; i < particleCount; i++) {
        var angle = (Math.PI * 2 / particleCount) * i;
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
    var text = isHit ? '+1' : 'X';
    var textEffect = {
        x: x,
        y: y,
        text: text,
        color: isHit ? '#4CAF50' : '#F44336',
        alpha: 1,
        size: 40,
        scale: 0.5
    };

    var frame = 0;
    var animate = function () {
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
            particles.forEach(function(p) {
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
    var difficultyNames = {
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
    var timerElement = document.getElementById('time-left');
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
    var timerElement = document.getElementById('time-left');

    // Tạo element hiển thị "+2s"
    var bonusText = document.createElement('div');
    bonusText.className = 'time-bonus-effect';
    bonusText.textContent = '+' + GAME_CONFIG.TIME_BONUS + 's';

    // Thêm vào vị trí timer
    var scoreBox = timerElement.closest('.score-box');
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
            var hasVietjetOnScreen = false;
            for (var i = 0; i < gameState.planes.length; i++) {
                if (gameState.planes[i].type === 'player') {
                    hasVietjetOnScreen = true;
                    break;
                }
            }
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
            var qrImage = document.getElementById('qr-image');
            var voucherLink = document.getElementById('voucher-link');
            var difficultyConfig = DIFFICULTY_CONFIG[gameState.difficulty];
            
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
    var type;

    // Nếu đã spawn đủ 10 VietJet thì chỉ spawn horizontal/vertical
    if (gameState.vietjetSpawned >= gameState.maxVietjet) {
        // Chỉ spawn horizontal hoặc vertical để tăng độ khó
        type = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    } else {
        // Còn VietJet thì random như bình thường
        var rand = Math.random();
        if (rand < GAME_CONFIG.SPAWN_RATE.PLAYER) {
            type = 'player';
        } else if (rand < GAME_CONFIG.SPAWN_RATE.PLAYER + GAME_CONFIG.SPAWN_RATE.HORIZONTAL) {
            type = 'horizontal';
        } else {
            type = 'vertical';
        }
    }

    var x, y, vx, vy;

    // Random tạo máy bay siêu nhanh
    var isFastPlane = Math.random() < GAME_CONFIG.FAST_PLANE_CHANCE;
    var baseSpeed = isFastPlane
        ? GAME_CONFIG.SPEED_FAST + Math.random() * GAME_CONFIG.SPEED_FAST_RANGE
        : GAME_CONFIG.SPEED_DEFAULT + Math.random() * GAME_CONFIG.SPEED_RANGE;
    
    // Áp dụng speed multiplier theo độ khó
    var difficultyConfig = DIFFICULTY_CONFIG[gameState.difficulty];
    var speed = baseSpeed * difficultyConfig.speedMultiplier;

    if (type === 'vertical') {
        // Vertical = Bay theo chiều dọc (từ trên xuống hoặc dưới lên)
        var fromTop = Math.random() < 0.5;
        // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền trái/phải)
        x = gameState.canvas.width * 0.1 + Math.random() * (gameState.canvas.width * 0.8);

        if (fromTop) {
            y = 0; // Spawn từ biên trên
            vx = 0;
            vy = speed;
        } else {
            y = gameState.canvas.height; // Spawn từ biên dưới
            vx = 0;
            vy = -speed;
        }
    } else if (type === 'horizontal') {
        // Horizontal = Bay theo chiều ngang (từ trái qua phải hoặc ngược lại)
        var fromLeft = Math.random() < 0.5;
        // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền trên/dưới)
        y = gameState.canvas.height * 0.2 + Math.random() * (gameState.canvas.height * 0.6);

        if (fromLeft) {
            x = 0; // Spawn từ biên trái
            vx = speed;
            vy = 0;
        } else {
            x = gameState.canvas.width; // Spawn từ biên phải
            vx = -speed;
            vy = 0;
        }
    } else {
        // Player: bay từ 4 hướng random
        var side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0: // top
                // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền)
                x = gameState.canvas.width * 0.1 + Math.random() * (gameState.canvas.width * 0.8);
                y = 0; // Spawn từ biên trên
                vx = (Math.random() - 0.5) * speed;
                vy = speed;
                break;
            case 1: // right
                x = gameState.canvas.width; // Spawn từ biên phải
                // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền)
                y = gameState.canvas.height * 0.2 + Math.random() * (gameState.canvas.height * 0.6);
                vx = -speed;
                vy = (Math.random() - 0.5) * speed;
                break;
            case 2: // bottom
                // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền)
                x = gameState.canvas.width * 0.1 + Math.random() * (gameState.canvas.width * 0.8);
                y = gameState.canvas.height; // Spawn từ biên dưới
                vx = (Math.random() - 0.5) * speed;
                vy = -speed;
                break;
            case 3: // left
                x = 0; // Spawn từ biên trái
                // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền)
                y = gameState.canvas.height * 0.2 + Math.random() * (gameState.canvas.height * 0.6);
                vx = speed;
                vy = (Math.random() - 0.5) * speed;
                break;
        }
    }

    // Random chọn ảnh từ category tương ứng
    var imageIndex = Math.floor(Math.random() * imageCategories[type].length);

    // Tính rotation
    var rotation;
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
    var isLastVietjet = (type === 'player' && gameState.vietjetSpawned === gameState.maxVietjet - 1);

    var plane = {
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
    for (var i = gameState.planes.length - 1; i >= 0; i--) {
        var plane = gameState.planes[i];

        // Update position
        plane.x += plane.vx;
        plane.y += plane.vy;

        // Update rotation cho player planes (tạo hiệu ứng lắc lư nhẹ)
        if (plane.type === 'player' || plane.type === 'horizontal' || plane.type === 'vertical') {
            plane.rotationTime += plane.rotationSpeed;
            // Dao động từ -0.15 đến +0.15 radian (~-8° đến +8°)
            plane.rotationOffset = Math.sin(plane.rotationTime) * 0.15;
        }

        // Remove if out of bounds (ra khỏi biên màn hình)
        var margin = 100; // Buffer để planes bay hoàn toàn ra ngoài trước khi xóa
        if (plane.x < -margin || plane.x > gameState.canvas.width + margin ||
            plane.y < -margin || plane.y > gameState.canvas.height + margin) {

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

var clouds = [];

function drawClouds() {
    // Initialize clouds if empty
    if (clouds.length === 0) {
        for (var i = 0; i < 5; i++) {
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
    for (var i = 0; i < clouds.length; i++) {
        var cloud = clouds[i];
        // Kiểm tra xem ảnh đã load chưa
        if (imagesLoaded && loadedImages.cloud && loadedImages.cloud[cloud.imageIndex]) {
            gameState.ctx.save();

            // Cải thiện chất lượng ảnh mây
            gameState.ctx.imageSmoothingEnabled = true;
            if (gameState.ctx.imageSmoothingQuality) {
                gameState.ctx.imageSmoothingQuality = 'high';
            }

            gameState.ctx.globalAlpha = cloud.opacity;

            var img = loadedImages.cloud[cloud.imageIndex];
            var width = cloud.size;
            var height = cloud.size * 0.6; // Tỉ lệ chiều cao/rộng của mây

            gameState.ctx.drawImage(img, cloud.x, cloud.y, width, height);
            gameState.ctx.restore();
        }

        // Di chuyển mây
        cloud.x += cloud.speed;
        // Reset từ biên trái khi ra khỏi biên phải
        if (cloud.x > gameState.canvas.width) {
            cloud.x = 0; // Spawn từ biên trái
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
        var debugRadius = (plane.size / 2) * GAME_CONFIG.HITBOX_MULTIPLIER;
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

    var img = loadedImages[plane.type][plane.imageIndex];
    var width = plane.size * GAME_CONFIG.PLANE_SIZE_MULTIPLIER;
    var height = plane.size * GAME_CONFIG.PLANE_SIZE_MULTIPLIER;

    gameState.ctx.drawImage(img, -width / 2, -height / 2, width, height);

    gameState.ctx.restore();
}

// Rating system
var selectedRating = 0;

function rateStar(value) {
    selectedRating = value;
    
    // Phát âm thanh rating
    playSoundSafe(sounds.rating);
    
    var stars = document.querySelectorAll('.star');

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
    var emojiMap = {
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
    var stars = document.querySelectorAll('.star');
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
    var radios = document.querySelectorAll('input[type="radio"]');
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
    var rainContainer = document.getElementById('rain-container');
    rainContainer.classList.add('active');
    
    // Tạo 50 giọt mưa
    for (var i = 0; i < 50; i++) {
        createRaindrop();
    }
}

function createRaindrop() {
    var rainContainer = document.getElementById('rain-container');
    var drop = document.createElement('div');
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
    var rainContainer = document.getElementById('rain-container');
    rainContainer.classList.remove('active');
    rainContainer.innerHTML = '';
}

// Lightning effect functions for hard mode
var lightningInterval = null;

function startLightning() {
    var lightningOverlay = document.getElementById('lightning-overlay');
    
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
        
        // Schedule next lightning (random 2-7 giây)
        var nextLightning = 2000 + Math.random() * 5000;
        lightningInterval = setTimeout(triggerLightning, nextLightning);
    }
    
    // Trigger lightning đầu tiên sau 3-8 giây
    var firstLightning = 3000 + Math.random() * 5000;
    lightningInterval = setTimeout(triggerLightning, firstLightning);
}

function stopLightning() {
    if (lightningInterval) {
        clearTimeout(lightningInterval);
        lightningInterval = null;
    }
    
    var lightningOverlay = document.getElementById('lightning-overlay');
    if (lightningOverlay) {
        lightningOverlay.classList.remove('flash');
    }
}

// Pause feature removed

// Game Over Popup
var gameOverTimeout = null;

function showGameOverPopup() {
    var popup = document.getElementById('game-over-popup');
    var popupScore = document.getElementById('popup-score');
    
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

// Universal click handler cho touch/mouse/pointer (hỗ trợ tất cả thiết bị)
function addClickLikeHandler(el, handler) {
    // Prevent multiple binds
    if (!el) return;
    
    var handled = false;
    
    // Pointer (modern - Chrome 55+, Safari 13+)
    if ('onpointerdown' in window) {
        el.addEventListener('pointerdown', function(e) {
            console.log('pointerdown event triggered on', el.id || el.className);
            if (!handled) {
                handled = true;
                handler(e);
                setTimeout(function() { handled = false; }, 300);
            }
        }, false);
    }
    
    // Touch fallback (Android/iOS cũ)
    el.addEventListener('touchend', function(e) {
        console.log('touchend event triggered on', el.id || el.className);
        e.preventDefault(); // Tránh sinh mouse events đôi
        if (!handled) {
            handled = true;
            handler(e);
            setTimeout(function() { handled = false; }, 300);
        }
    }, false);
    
    // Mouse fallback (desktop/testing)
    el.addEventListener('click', function(e) {
        console.log('click event triggered on', el.id || el.className);
        if (!handled) {
            handled = true;
            handler(e);
            setTimeout(function() { handled = false; }, 300);
        }
    }, false);
}

// Audio unlock handler
var audioUnlocked = false; // Flag để tránh gọi nhiều lần
function unlockAudio(e) {
    console.log('========== UNLOCK AUDIO START ==========');
    console.log('Event type:', e ? e.type : 'no event');
    console.log('audioUnlocked flag:', audioUnlocked);
    
    // Tránh gọi nhiều lần (vì có nhiều event types)
    if (audioUnlocked) {
        console.log('Already unlocked, returning early');
        return;
    }
    
    try {
        // Ngăn default behavior để tránh conflict
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('Setting audioUnlocked = true');
        audioUnlocked = true;
        
        var audioUnlock = document.getElementById('audio-unlock');
        
        console.log('audioUnlock element:', audioUnlock);
        
        if (!audioUnlock) {
            console.error('CRITICAL: audio-unlock element not found!');
            return;
        }
        
        // Phát nhạc menu theme
        console.log('Playing menu theme...');
        playSoundSafe(sounds.menuTheme);
        
        // Ẩn overlay - thử nhiều cách
        console.log('Hiding overlay...');
        
        // Cách 1: Add class
        audioUnlock.classList.add('hidden');
        console.log('Added .hidden class');
        
        // Cách 2: Inline style (fallback cho Android cũ)
        audioUnlock.style.display = 'none';
        console.log('Set display = none');
        
        // Cách 3: Visibility (thêm fallback)
        audioUnlock.style.visibility = 'hidden';
        console.log('Set visibility = hidden');
        
        console.log('========== UNLOCK AUDIO SUCCESS ==========');
        
    } catch (error) {
        console.error('ERROR in unlockAudio:', error);
        console.error('Error stack:', error.stack);
    }
}

// Setup universal handlers cho tất cả interactive elements
function setupUniversalHandlers() {
    console.log('========== SETUP UNIVERSAL HANDLERS ==========');
    
    // Setup map items
    var mapItems = document.querySelectorAll('.map-item');
    console.log('Found', mapItems.length, 'map items');
    mapItems.forEach(function(item, index) {
        addClickLikeHandler(item, function(e) {
            var mapNumber = index + 1;
            console.log('Map item', mapNumber, 'clicked');
            playSoundSafe(sounds.tap);
            selectMap(mapNumber);
        });
    });
    
    // Setup difficulty cards
    var difficultyCards = document.querySelectorAll('.difficulty-card');
    console.log('Found', difficultyCards.length, 'difficulty cards');
    difficultyCards.forEach(function(card) {
        var difficulty = card.classList.contains('easy') ? 'easy' : 
                         card.classList.contains('normal') ? 'medium' : 'hard';
        addClickLikeHandler(card, function(e) {
            console.log('Difficulty card clicked:', difficulty);
            playSoundSafe(sounds.tap);
            selectDifficulty(difficulty);
        });
    });
    
    // Setup rating stars
    var stars = document.querySelectorAll('.star');
    console.log('Found', stars.length, 'rating stars');
    stars.forEach(function(star) {
        var value = parseInt(star.getAttribute('data-value'));
        addClickLikeHandler(star, function(e) {
            console.log('Star clicked:', value);
            playSoundSafe(sounds.tap);
            rateStar(value);
        });
    });
    
    // Setup all buttons
    var allButtons = document.querySelectorAll('button, .btn');
    console.log('Found', allButtons.length, 'buttons/btns');
    allButtons.forEach(function(button) {
        // Skip các button đã có handler riêng (chỉ splash-button)
        if (button.classList.contains('splash-button')) {
            console.log('Skipping button with dedicated handler:', button.className);
            return;
        }
        
        // Thêm universal handler với tap sound
        addClickLikeHandler(button, function(e) {
            playSoundSafe(sounds.tap);
            // Handler đã có trong onclick attribute sẽ tự chạy
            console.log('Button clicked via universal handler:', button.textContent.trim().substring(0, 20));
        });
    });
    
    console.log('========== SETUP COMPLETE ==========');
}

// Setup tap sound cho tất cả buttons (deprecated - moved to setupUniversalHandlers)
function setupButtonTapSound() {
    console.log('setupButtonTapSound: Now handled by setupUniversalHandlers with tap sound');
    // Tap sound đã được integrated vào setupUniversalHandlers
}

// Initialize game when page loads
window.addEventListener('load', function () {
    console.log('Page loaded, initializing...');
    console.log('User Agent:', navigator.userAgent);
    console.log('Touch support:', 'ontouchstart' in window);
    console.log('Pointer support:', 'onpointerdown' in window);
    
    preloadImages();
    showScreen('welcome-screen');
    
    // Setup audio unlock với universal event handler
    var audioUnlock = document.getElementById('audio-unlock');
    
    console.log('audioUnlock element:', audioUnlock);
    
    if (!audioUnlock) {
        console.error('Missing audio-unlock element!');
        return;
    }
    
    // Sử dụng universal click handler cho overlay (không cần button riêng)
    addClickLikeHandler(audioUnlock, unlockAudio);
    console.log('Added universal event listeners to audio unlock overlay');
    
    // Setup splash button (TAP TO START) với universal handler + tap sound
    var splashButton = document.querySelector('.splash-button');
    if (splashButton) {
        addClickLikeHandler(splashButton, function(e) {
            console.log('Splash button clicked!');
            playSoundSafe(sounds.tap);
            showSurvey();
        });
        console.log('Added universal event listeners to splash button with tap sound');
    } else {
        console.warn('Splash button not found');
    }
    
    // Setup universal handlers cho tất cả các interactive elements
    setupUniversalHandlers();
    
    // Setup tap sound cho tất cả buttons
    setupButtonTapSound();
});
