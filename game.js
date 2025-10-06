/*
 * ==============================================
 * VIRTUAL RESOLUTION SYSTEM
 * ==============================================
 * 
 * Hệ thống này đảm bảo game hiển thị đồng nhất trên mọi thiết bị với độ phân giải khác nhau.
 * 
 * Cách hoạt động:
 * 1. Định nghĩa Virtual Resolution cố định (1280×720)
 * 2. Tính scale = min(viewportWidth/virtualWidth, viewportHeight/virtualHeight)
 * 3. Canvas buffer = viewport × DPR (để render sắc nét trên màn hình Retina)
 * 4. Canvas CSS = viewport (phủ full màn hình)
 * 5. Context scale = scale × DPR
 * 6. Tất cả game objects sử dụng virtual coordinates
 * 7. Context tự động convert virtual → screen khi vẽ
 * 
 * Lợi ích~
 * - Game logic luôn dùng tọa độ cố định (1280×720) - dễ code
 * - Tự động scale phù hợp với mọi màn hình
 * - Tận dụng DPR để render sắc nét (test với DPR=3)
 * - Maintain aspect ratio (không bị méo)
 */

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
    tap: new Audio('assets/sounds/tap_1.mp3')
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
    // Virtual Resolution - Độ phân giải ảo cố định
    VIRTUAL_WIDTH: 1280,     // Chiều rộng ảo chuẩn
    VIRTUAL_HEIGHT: 720,     // Chiều cao ảo chuẩn
    
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

// Game settings - cố định (không có chọn độ khó)
var GAME_SETTINGS = {
    gameTime: 20,
    speedMultiplier: 1.5,
    chances: 2,
    qrCode: 'assets/qr_code_level_2.png',
    voucherLink: 'https://evoucher.vietjetair.com/Vouchers/Details?AwardCampaign=454'
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
    // Virtual Resolution System
    virtualWidth: GAME_CONFIG.VIRTUAL_WIDTH,   // Chiều rộng ảo
    virtualHeight: GAME_CONFIG.VIRTUAL_HEIGHT, // Chiều cao ảo
    canvasWidth: 0,       // Canvas display width (viewport)
    canvasHeight: 0,      // Canvas display height (viewport)
    scale: 1,             // Tỷ lệ scale từ virtual → screen
    devicePixelRatio: 1,  // Device pixel ratio được sử dụng
    resizeTimeout: null   // Timeout cho debounce resize
};

// Chuyển màn hình
function showScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    
    // QUAN TRỌNG: Chrome 44 KHÔNG hỗ trợ forEach() cho NodeList!
    // Phải dùng vòng lặp for truyền thống
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    
    document.getElementById(screenId).classList.add('active');
}

// Modal functions
function showRulesModal() {
    document.getElementById('rules-modal').classList.add('active');
}

function closeRulesModal() {
    document.getElementById('rules-modal').classList.remove('active');
}

// Màn hình khảo sát - Câu hỏi 1
function showSurvey() {
    console.log('========== SHOW SURVEY CALLED ==========');
    try {
        console.log('Navigating to survey screen Q1...');
        showScreen('survey-screen-q1');
        console.log('========== SHOW SURVEY Q1 SUCCESS ==========');
    } catch (error) {
        console.error('ERROR in showSurvey:', error);
        console.error('Error stack:', error.stack);
    }
}

// Validate câu hỏi 1 và chuyển sang câu hỏi 2
function validateQ1AndShowQ2() {
    var q1 = document.querySelector('input[name="q1"]:checked');

    if (!q1) {
        showFlashMessage('flash-message-q1');
        return;
    }

    // Slide animation: Q1 trượt ra trái, Q2 trượt vào từ phải ĐỒNG THỜI
    var q1Screen = document.getElementById('survey-screen-q1');
    var q2Screen = document.getElementById('survey-screen-q2');
    
    // Hiện Q2 ngay lập tức (nhưng ở vị trí bên phải, chưa thấy)
    q2Screen.classList.add('active', 'slide-in-right');
    
    // Sau 1 frame để đảm bảo CSS đã apply, bắt đầu slide cả 2 cùng lúc
    requestAnimationFrame(function() {
        // Q1 slide out left
        q1Screen.classList.add('slide-out-left');
        
        // Sau khi animation hoàn thành (400ms)
        setTimeout(function() {
            // Xóa Q1
            q1Screen.classList.remove('active', 'slide-out-left');
            // Xóa class animation của Q2
            q2Screen.classList.remove('slide-in-right');
        }, 400);
    });
}

// Validate câu hỏi 2 và hiển thị màn giới thiệu
function validateQ2AndShowIntro() {
    var q2 = document.querySelector('input[name="q2"]:checked');

    if (!q2) {
        showFlashMessage('flash-message-q2');
        return;
    }

    showScreen('intro-screen');
}

// Hiển thị flash message khi thiếu câu trả lời
function showFlashMessage(messageId) {
    var flashMessage = document.getElementById(messageId || 'flash-message-q1');

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


// Function để lấy đường dẫn map với extension phù hợp (jpg hoặc png)
function getMapPath(mapId) {
    var basePath = 'assets/map/map_' + mapId;
    
    // Ưu tiên các extension theo thứ tự: jpg, png, jpeg, webp
    var extensions = ['jpg', 'png', 'jpeg', 'webp'];
    
    // Trả về đường dẫn với extension đầu tiên (jpg mặc định)
    // Nếu file không tồn tại, browser sẽ tự động fallback hoặc hiển thị lỗi
    return basePath + '.jpg';
}

// Function để thử load image với fallback extension
function loadMapImage(mapId, callback) {
    var basePath = 'assets/map/map_' + mapId;
    var extensions = ['jpg', 'png', 'jpeg', 'webp'];
    var currentIndex = 0;
    
    function tryLoadImage() {
        if (currentIndex >= extensions.length) {
            console.error('Không tìm thấy file map với ID:', mapId);
            callback(null);
            return;
        }
        
        var img = new Image();
        img.onload = function() {
            callback(basePath + '.' + extensions[currentIndex]);
        };
        img.onerror = function() {
            currentIndex++;
            tryLoadImage();
        };
        img.src = basePath + '.' + extensions[currentIndex];
    }
    
    tryLoadImage();
}

// Chọn map và bắt đầu game luôn
function selectMap(mapId) {
    gameState.selectedMap = mapId;

    // Load ảnh map với fallback extension
    loadMapImage(mapId, function(mapPath) {
        if (mapPath) {
            gameState.mapBackground = new Image();
            gameState.mapBackground.src = mapPath;
        } else {
            // Fallback về jpg nếu không tìm thấy file nào
            gameState.mapBackground = new Image();
            gameState.mapBackground.src = getMapPath(mapId);
        }
        
        // Bắt đầu game luôn (không cần chọn độ khó)
        startGame();
    });
}

function startGame() {
    showScreen('game-screen');
    
    // Set background map cho game screen với fallback extension
    var gameScreen = document.getElementById('game-screen');
    loadMapImage(gameState.selectedMap, function(mapPath) {
        if (mapPath) {
            gameScreen.style.backgroundImage = 'url(\'' + mapPath + '\')';
        } else {
            // Fallback về jpg nếu không tìm thấy file nào
            var fallbackPath = getMapPath(gameState.selectedMap);
            gameScreen.style.backgroundImage = 'url(\'' + fallbackPath + '\')';
        }
        gameScreen.style.backgroundSize = 'cover';
        gameScreen.style.backgroundPosition = 'center';
    });
    
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
    
    // Áp dụng config cố định
    gameState.timeLeft = GAME_SETTINGS.gameTime;
    gameState.chances = GAME_SETTINGS.chances;

    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Update UI
    updateScore();
    updateTimer();

    // Start countdown timer
    startTimer();

    // Start spawning planes
    spawnPlane();

    // Start game loop
    gameLoop();

    // Add touch/click event - dùng touchstart cho Android cũ
    gameState.canvas.addEventListener('touchstart', handleCanvasTouch, false);
    gameState.canvas.addEventListener('click', handleCanvasClick, false);
}

function resizeCanvas() {
    if (!gameState.canvas) return;

    // Bước 1: Lấy kích thước viewport thực tế
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight - 80; // Trừ UI bar
    
    // Đảm bảo kích thước tối thiểu
    viewportWidth = Math.max(viewportWidth, 320);
    viewportHeight = Math.max(viewportHeight, 480);
    
    // Bước 2: Lấy và tối ưu Device Pixel Ratio
    var dpr = window.devicePixelRatio || 1;
    
    // Giới hạn DPR để tránh lag (tối đa = 3)
    if (dpr > 3) {
        dpr = 3;
    }
    
    // Bước 3: Tính scale để fit virtual resolution vào viewport
    // Dùng min để maintain aspect ratio (letterbox/pillarbox)
    var scaleX = viewportWidth / gameState.virtualWidth;
    var scaleY = viewportHeight / gameState.virtualHeight;
    var scale = Math.min(scaleX, scaleY);
    
    // Bước 4: Set canvas buffer size = viewport × DPR (cho sắc nét)
    gameState.canvas.width = viewportWidth * dpr;
    gameState.canvas.height = viewportHeight * dpr;
    
    // Bước 5: Set canvas CSS size = viewport (phủ full màn)
    gameState.canvas.style.width = viewportWidth + 'px';
    gameState.canvas.style.height = viewportHeight + 'px';
    
    // Bước 6: Scale context = scale × DPR
    // - DPR để tận dụng pixel density
    // - scale để convert virtual coords → screen coords
    var contextScale = scale * dpr;
    gameState.ctx.setTransform(contextScale, 0, 0, contextScale, 0, 0);
    
    // Bước 7: Cải thiện chất lượng render
    gameState.ctx.imageSmoothingEnabled = true;
    if (gameState.ctx.imageSmoothingQuality) {
        gameState.ctx.imageSmoothingQuality = dpr >= 2 ? 'high' : 'medium';
    }
    
    // Bước 8: Lưu state
    gameState.canvasWidth = viewportWidth;
    gameState.canvasHeight = viewportHeight;
    gameState.scale = scale;
    gameState.devicePixelRatio = dpr;
    
    console.log('Canvas resized with Virtual Resolution:', {
        virtualResolution: gameState.virtualWidth + 'x' + gameState.virtualHeight,
        viewportSize: viewportWidth + 'x' + viewportHeight,
        bufferSize: (viewportWidth * dpr) + 'x' + (viewportHeight * dpr),
        scale: scale.toFixed(3),
        contextScale: contextScale.toFixed(3),
        devicePixelRatio: dpr
    });
}


// Function để xử lý resize window
function handleWindowResize() {
    // Debounce resize để tránh gọi quá nhiều lần
    clearTimeout(gameState.resizeTimeout);
    gameState.resizeTimeout = setTimeout(function() {
        if (gameState.canvas) {
            resizeCanvas();
            // Redraw game nếu đang chạy
            if (gameState.isGameRunning) {
                draw();
            }
        }
    }, 100);
}

// Function để xử lý orientation change
function handleOrientationChange() {
    // Delay để đảm bảo window đã resize xong
    setTimeout(function() {
        if (gameState.canvas) {
            resizeCanvas();
            // Redraw game nếu đang chạy
            if (gameState.isGameRunning) {
                draw();
            }
        }
    }, 200);
}

function handleCanvasClick(e) {
    if (!gameState.isGameRunning) return;
    var rect = gameState.canvas.getBoundingClientRect();
    // Screen coordinates
    var screenX = e.clientX - rect.left;
    var screenY = e.clientY - rect.top;
    
    // Convert screen coords → virtual coords
    var virtualX = screenX / gameState.scale;
    var virtualY = screenY / gameState.scale;
    
    checkHit(virtualX, virtualY);
}

function handleCanvasTouch(e) {
    if (!gameState.isGameRunning) return;
    
    // Lấy tọa độ từ touch hoặc changedTouches (cho touchend)
    var touch = e.touches && e.touches[0] ? e.touches[0] : 
                (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null);
    
    if (!touch) {
        console.warn('No touch data found');
        return;
    }
    
    // QUAN TRỌNG: preventDefault() PHẢI được gọi để tránh double-tap zoom trên Android cũ
    try {
        e.preventDefault();
    } catch (err) {
        console.log('preventDefault failed:', err);
    }
    
    var rect = gameState.canvas.getBoundingClientRect();
    // Screen coordinates
    var screenX = touch.clientX - rect.left;
    var screenY = touch.clientY - rect.top;
    
    // Convert screen coords → virtual coords
    var virtualX = screenX / gameState.scale;
    var virtualY = screenY / gameState.scale;
    
    console.log('Canvas touch at screen:', screenX, screenY, '→ virtual:', virtualX, virtualY);
    checkHit(virtualX, virtualY);
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
    
    setTimeout(function () {
        if (isWin) {
            // Cập nhật QR code và link
            var qrImage = document.getElementById('qr-image');
            var voucherLink = document.getElementById('voucher-link');
            
            qrImage.src = GAME_SETTINGS.qrCode;
            voucherLink.href = GAME_SETTINGS.voucherLink;
            voucherLink.textContent = GAME_SETTINGS.voucherLink;
            
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
    
    // Áp dụng speed multiplier
    var speed = baseSpeed * GAME_SETTINGS.speedMultiplier;

    // Tính kích thước thực tế của máy bay khi vẽ (để spawn ngoài màn hình)
    var planeDisplaySize = GAME_CONFIG.PLANE_SIZE * GAME_CONFIG.PLANE_SIZE_MULTIPLIER;
    var spawnOffset = planeDisplaySize / 2 + 10; // Offset thêm 10px để chắc chắn

    if (type === 'vertical') {
        // Vertical = Bay theo chiều dọc (từ trên xuống hoặc dưới lên)
        var fromTop = Math.random() < 0.5;
        // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền trái/phải)
        // Dùng VIRTUAL coordinates
        x = gameState.virtualWidth * 0.1 + Math.random() * (gameState.virtualWidth * 0.8);

        if (fromTop) {
            y = -spawnOffset; // Spawn ngoài biên trên
            vx = 0;
            vy = speed;
        } else {
            y = gameState.virtualHeight + spawnOffset; // Spawn ngoài biên dưới
            vx = 0;
            vy = -speed;
        }
    } else if (type === 'horizontal') {
        // Horizontal = Bay theo chiều ngang (từ trái qua phải hoặc ngược lại)
        var fromLeft = Math.random() < 0.5;
        // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền trên/dưới)
        // Dùng VIRTUAL coordinates
        y = gameState.virtualHeight * 0.2 + Math.random() * (gameState.virtualHeight * 0.6);

        if (fromLeft) {
            x = -spawnOffset; // Spawn ngoài biên trái
            vx = speed;
            vy = 0;
        } else {
            x = gameState.virtualWidth + spawnOffset; // Spawn ngoài biên phải
            vx = -speed;
            vy = 0;
        }
    } else {
        // Player: bay từ 4 hướng random
        var side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0: // top
                // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền)
                // Dùng VIRTUAL coordinates
                x = gameState.virtualWidth * 0.1 + Math.random() * (gameState.virtualWidth * 0.8);
                y = -spawnOffset; // Spawn ngoài biên trên
                vx = (Math.random() - 0.5) * speed;
                vy = speed;
                break;
            case 1: // right
                x = gameState.virtualWidth + spawnOffset; // Spawn ngoài biên phải
                // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền)
                // Dùng VIRTUAL coordinates
                y = gameState.virtualHeight * 0.2 + Math.random() * (gameState.virtualHeight * 0.6);
                vx = -speed;
                vy = (Math.random() - 0.5) * speed;
                break;
            case 2: // bottom
                // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền)
                // Dùng VIRTUAL coordinates
                x = gameState.virtualWidth * 0.1 + Math.random() * (gameState.virtualWidth * 0.8);
                y = gameState.virtualHeight + spawnOffset; // Spawn ngoài biên dưới
                vx = (Math.random() - 0.5) * speed;
                vy = -speed;
                break;
            case 3: // left
                x = -spawnOffset; // Spawn ngoài biên trái
                // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền)
                // Dùng VIRTUAL coordinates
                y = gameState.virtualHeight * 0.2 + Math.random() * (gameState.virtualHeight * 0.6);
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

    // Clear canvas - dùng VIRTUAL dimensions
    gameState.ctx.clearRect(0, 0, gameState.virtualWidth, gameState.virtualHeight);

    // Draw map background - dùng VIRTUAL dimensions
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
            gameState.virtualWidth,
            gameState.virtualHeight
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

        // Remove if out of bounds - dùng VIRTUAL dimensions
        var margin = 100; // Buffer để planes bay hoàn toàn ra ngoài trước khi xóa
        if (plane.x < -margin || plane.x > gameState.virtualWidth + margin ||
            plane.y < -margin || plane.y > gameState.virtualHeight + margin) {

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
    // Initialize clouds if empty - dùng VIRTUAL dimensions
    if (clouds.length === 0) {
        for (var i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * gameState.virtualWidth,
                y: Math.random() * gameState.virtualHeight,
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
        // Reset từ biên trái khi ra khỏi biên phải - dùng VIRTUAL dimensions
        if (cloud.x > gameState.virtualWidth) {
            cloud.x = 0; // Spawn từ biên trái
            cloud.y = Math.random() * gameState.virtualHeight;
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

    // Chrome 44: Dùng for loop thay vì forEach
    for (var i = 0; i < stars.length; i++) {
        if (i < value) {
            stars[i].classList.add('active');
            stars[i].textContent = '★';
        } else {
            stars[i].classList.remove('active');
            stars[i].textContent = '☆';
        }
    }

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
    
    // Chrome 44: Dùng for loop thay vì forEach
    for (var i = 0; i < stars.length; i++) {
        stars[i].classList.remove('active');
        stars[i].textContent = '☆';
    }
    
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
    
    // Chrome 44: Dùng for loop thay vì forEach
    for (var i = 0; i < radios.length; i++) {
        radios[i].checked = false;
    }

    // Reset clouds
    clouds = [];

    // Show welcome screen
    showScreen('welcome-screen');
    
    // Phát lại nhạc menu theme
    playSoundSafe(sounds.menuTheme);
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
// Đơn giản hóa cho Android 6 / Chrome 44
function addClickLikeHandler(el, handler) {
    if (!el) return;
    
    var handled = false;
    var hasTouchSupport = 'ontouchstart' in window;
    
    console.log('Adding click handler to element:', el.id || el.className, 'Touch support:', hasTouchSupport);
    
    // Cho Android 6 / Chrome 44 - phương pháp đơn giản nhất
    if (hasTouchSupport) {
        // Dùng touchstart cho phản hồi ngay lập tức
        el.addEventListener('touchstart', function(e) {
            console.log('touchstart event triggered on', el.id || el.className);
            // KHÔNG preventDefault() - để browser xử lý bình thường
            if (!handled) {
                handled = true;
                handler(e);
                setTimeout(function() { handled = false; }, 500);
            }
        }, false);
    }
    
    // LUÔN thêm click event (quan trọng cho tất cả thiết bị)
    el.addEventListener('click', function(e) {
        console.log('click event triggered on', el.id || el.className);
        if (!handled) {
            handled = true;
            handler(e);
            setTimeout(function() { handled = false; }, 500);
        }
    }, false);
}

// Audio unlock handler
var audioUnlocked = false;
function unlockAudio() {
    console.log('========== UNLOCK AUDIO START ==========');
    console.log('Device Pixel Ratio:', window.devicePixelRatio);
    
    // Tránh gọi nhiều lần
    if (audioUnlocked) {
        console.log('Already unlocked');
        return;
    }
    
    audioUnlocked = true;
    
    // Phát nhạc menu theme
    console.log('Playing menu theme...');
    playSoundSafe(sounds.menuTheme);
    
    // Ẩn overlay - QUAN TRỌNG: XÓA HOÀN TOÀN khỏi DOM
    var audioUnlock = document.getElementById('audio-unlock');
    if (audioUnlock) {
        console.log('Removing overlay from DOM...');
        
        // Xóa khỏi DOM (cách an toàn nhất)
        if (audioUnlock.parentNode) {
            audioUnlock.parentNode.removeChild(audioUnlock);
            console.log('Overlay removed successfully');
        }
    }
    
    console.log('========== UNLOCK AUDIO SUCCESS ==========');
}

// Setup ALL event handlers (TẤT CẢ handlers được setup ở đây)
function setupAllEventHandlers() {
    console.log('========== SETUP ALL EVENT HANDLERS START ==========');
    
    // 1. Setup Audio Unlock Overlay
    var audioUnlock = document.getElementById('audio-unlock');
    if (audioUnlock) {
        console.log('✓ Setting up audio-unlock overlay');
        addClickLikeHandler(audioUnlock, unlockAudio);
    }
    
    // 2. Setup Splash Button (TAP TO START)
    var splashButton = document.querySelector('.splash-button');
    if (splashButton) {
        console.log('✓ Setting up splash-button');
        addClickLikeHandler(splashButton, function(e) {
            console.log('Splash button clicked!');
            playSoundSafe(sounds.tap);
            showSurvey();
        });
    }
    
    // 3. Setup Survey Q1 Continue Button
    var surveyQ1ContinueBtn = document.getElementById('survey-q1-continue-btn');
    if (surveyQ1ContinueBtn) {
        console.log('✓ Setting up survey-q1-continue-btn');
        addClickLikeHandler(surveyQ1ContinueBtn, function(e) {
            playSoundSafe(sounds.tap);
            validateQ1AndShowQ2();
        });
    }
    
    // 3b. Setup Survey Q2 Continue Button
    var surveyQ2ContinueBtn = document.getElementById('survey-q2-continue-btn');
    if (surveyQ2ContinueBtn) {
        console.log('✓ Setting up survey-q2-continue-btn');
        addClickLikeHandler(surveyQ2ContinueBtn, function(e) {
            playSoundSafe(sounds.tap);
            validateQ2AndShowIntro();
        });
    }
    
    // 4. Setup Help Button
    var helpButton = document.getElementById('help-button');
    if (helpButton) {
        console.log('✓ Setting up help-button');
        addClickLikeHandler(helpButton, function(e) {
            playSoundSafe(sounds.tap);
            showRulesModal();
        });
    }
    
    // 5. Setup Start Game Button
    var startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        console.log('✓ Setting up start-game-btn');
        addClickLikeHandler(startGameBtn, function(e) {
            playSoundSafe(sounds.tap);
            showMapSelection();
        });
    }
    
    // 6. Setup Win Continue Button
    var winContinueBtn = document.getElementById('win-continue-btn');
    if (winContinueBtn) {
        console.log('✓ Setting up win-continue-btn');
        addClickLikeHandler(winContinueBtn, function(e) {
            playSoundSafe(sounds.tap);
            showRating();
        });
    }
    
    // 8. Setup Lose Continue Button
    var loseContinueBtn = document.getElementById('lose-continue-btn');
    if (loseContinueBtn) {
        console.log('✓ Setting up lose-continue-btn');
        addClickLikeHandler(loseContinueBtn, function(e) {
            playSoundSafe(sounds.tap);
            showRating();
        });
    }
    
    // 9. Setup Restart Button
    var restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        console.log('✓ Setting up restart-btn');
        addClickLikeHandler(restartBtn, function(e) {
            playSoundSafe(sounds.tap);
            restartGame();
        });
    }
    
    // 10. Setup Modal Close Button
    var modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        console.log('✓ Setting up modal-close-btn');
        addClickLikeHandler(modalCloseBtn, closeRulesModal);
    }
    
    // 11. Setup Modal Overlay
    var modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        console.log('✓ Setting up modal-overlay');
        addClickLikeHandler(modalOverlay, closeRulesModal);
    }
    
    // 12. Setup Modal OK Button
    var modalOkBtn = document.getElementById('modal-ok-btn');
    if (modalOkBtn) {
        console.log('✓ Setting up modal-ok-btn');
        addClickLikeHandler(modalOkBtn, function(e) {
            playSoundSafe(sounds.tap);
            closeRulesModal();
        });
    }
    
    console.log('========== SETUP BASIC BUTTONS COMPLETE ==========');
    
    // Setup map items với data-map attribute
    var mapItems = document.querySelectorAll('.map-item');
    console.log('Found', mapItems.length, 'map items');
    
    // Chrome 44: Dùng for loop thay vì forEach
    if (mapItems.length > 0) {
        for (var i = 0; i < mapItems.length; i++) {
            (function(item, index) {
                var mapNumber = parseInt(item.getAttribute('data-map'));
                console.log('Setting up map item', index + 1, 'with data-map:', mapNumber);
                addClickLikeHandler(item, function(e) {
                    console.log('Map item', mapNumber, 'clicked');
                    playSoundSafe(sounds.tap);
                    selectMap(mapNumber);
                });
            })(mapItems[i], i);
        }
    } else {
        console.warn('WARNING: No map items found!');
    }
    
    
    // Setup rating stars
    var stars = document.querySelectorAll('.star');
    console.log('Found', stars.length, 'rating stars');
    
    // Chrome 44: Dùng for loop thay vì forEach
    if (stars.length > 0) {
        for (var i = 0; i < stars.length; i++) {
            (function(star, index) {
                var value = parseInt(star.getAttribute('data-value'));
                console.log('Setting up star', index + 1, 'with value:', value);
                addClickLikeHandler(star, function(e) {
                    console.log('Star clicked:', value);
                    playSoundSafe(sounds.tap);
                    rateStar(value);
                });
            })(stars[i], i);
        }
    } else {
        console.warn('WARNING: No stars found!');
    }
    
    // Setup specific buttons với ID
    var buttonHandlers = {
        'help-button': showRulesModal,
        'start-game-btn': showMapSelection,
        'win-continue-btn': showRating,
        'lose-continue-btn': showRating,
        'restart-btn': restartGame,
        'modal-close-btn': closeRulesModal,
        'modal-ok-btn': closeRulesModal
    };
    
    console.log('Setting up', Object.keys(buttonHandlers).length, 'specific buttons...');
    Object.keys(buttonHandlers).forEach(function(btnId) {
        var btn = document.getElementById(btnId);
        if (btn) {
            console.log('✓ Found button:', btnId);
            addClickLikeHandler(btn, function(e) {
                console.log('Button clicked:', btnId);
                playSoundSafe(sounds.tap);
                buttonHandlers[btnId]();
            });
        } else {
            console.warn('✗ Button NOT found:', btnId);
        }
    });
    
    // Setup modal overlay
    var modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        console.log('✓ Found modal overlay');
        addClickLikeHandler(modalOverlay, function(e) {
            console.log('Modal overlay clicked');
            closeRulesModal();
        });
    } else {
        console.warn('✗ Modal overlay NOT found');
    }
    
    console.log('========== SETUP ALL EVENT HANDLERS COMPLETE ==========');
}

// Setup tap sound cho tất cả buttons (deprecated - moved to setupUniversalHandlers)
function setupButtonTapSound() {
    console.log('setupButtonTapSound: Now handled by setupUniversalHandlers with tap sound');
    // Tap sound đã được integrated vào setupUniversalHandlers
}

// Initialize game when page loads
window.addEventListener('load', function () {
    console.log('========== PAGE LOAD START ==========');
    console.log('User Agent:', navigator.userAgent);
    console.log('Touch support:', 'ontouchstart' in window);
    console.log('Pointer support:', 'onpointerdown' in window);
    
    // Debug: Thêm global touch listener để test
    document.addEventListener('touchstart', function(e) {
        console.log('🟢 GLOBAL touchstart detected at:', e.touches[0].clientX, e.touches[0].clientY);
        console.log('Target element:', e.target.tagName, e.target.className, e.target.id);
    }, false);
    
    document.addEventListener('touchend', function(e) {
        console.log('🔴 GLOBAL touchend detected');
    }, false);
    
    document.addEventListener('click', function(e) {
        console.log('🔵 GLOBAL click detected at:', e.clientX, e.clientY);
        console.log('Target element:', e.target.tagName, e.target.className, e.target.id);
    }, false);
    
    // Đợi một chút để đảm bảo DOM đã render hoàn toàn (quan trọng cho Android cũ)
    setTimeout(function() {
        console.log('========== INITIALIZING AFTER DELAY ==========');
        
        preloadImages();
        showScreen('welcome-screen');
        
        // Chờ người dùng click vào overlay "Chạm để bắt đầu" để unlock audio
        console.log('Waiting for user to tap audio-unlock overlay...');
        
        // Setup TẤT CẢ event handlers
        setupAllEventHandlers();
        
        console.log('========== INITIALIZATION COMPLETE ==========');
    }, 100); // Đợi 100ms để DOM render
});
