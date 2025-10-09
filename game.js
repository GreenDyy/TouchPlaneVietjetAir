// ============================================
// GAME CONFIGURATION - TẤT CẢ CẤU HÌNH Ở ĐÂY
// ============================================
// Đã chuyển qua file gameConfig.js

// Trạng thái âm thanh/nhạc (tách riêng)
var audioSettings = {
    isSfxMuted: false,
    isMusicMuted: false
};

// Load trạng thái từ localStorage nếu có
try {
    var savedSfx = localStorage.getItem('vj_sfx_muted');
    var savedMusic = localStorage.getItem('vj_music_muted');
    if (savedSfx !== null) audioSettings.isSfxMuted = savedSfx === '1';
    if (savedMusic !== null) audioSettings.isMusicMuted = savedMusic === '1';
} catch (e) {
    // Storage not available
}

// Helper function để play audio an toàn (tránh lỗi trên Android)
function playSoundSafe(sound) {
    try {
        // Tôn trọng cài đặt mute
        var isMusic = (sound === sounds.menuTheme || sound === sounds.bgMusic);
        if ((isMusic && audioSettings.isMusicMuted) || (!isMusic && audioSettings.isSfxMuted)) {
            return;
        }

        if (sound.readyState >= 2) { // HAVE_CURRENT_DATA
            sound.currentTime = 0;
            sound.play().catch(function (e) {
                // Audio play blocked
            });
        }
    } catch (e) {
        // Audio error
    }
}

// Cập nhật UI icon cho các nút âm thanh/nhạc theo trạng thái hiện tại
function updateAudioButtonsUI() {
    // Sound buttons
    var soundBtns = document.querySelectorAll('.sound-btn');
    for (var i = 0; i < soundBtns.length; i++) {
        var btn = soundBtns[i];
        if (audioSettings.isSfxMuted) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        var img = btn.querySelector('img');
        if (img) {
            img.src = audioSettings.isSfxMuted
                ? 'assets/ui/default/btn/sound_off.png'
                : 'assets/ui/default/btn/sound.png';
        }
    }

    // Music buttons
    var musicBtns = document.querySelectorAll('.music-btn');
    for (var j = 0; j < musicBtns.length; j++) {
        var mbtn = musicBtns[j];
        if (audioSettings.isMusicMuted) {
            mbtn.classList.add('active');
        } else {
            mbtn.classList.remove('active');
        }
        var mimg = mbtn.querySelector('img');
        if (mimg) {
            mimg.src = audioSettings.isMusicMuted
                ? 'assets/ui/default/btn/music_off.png'
                : 'assets/ui/default/btn/music.png';
        }
    }
}

function setSfxMuted(muted) {
    audioSettings.isSfxMuted = !!muted;
    try { localStorage.setItem('vj_sfx_muted', audioSettings.isSfxMuted ? '1' : '0'); } catch (e) { }
    updateAudioButtonsUI();
}

function setMusicMuted(muted) {
    audioSettings.isMusicMuted = !!muted;
    try { localStorage.setItem('vj_music_muted', audioSettings.isMusicMuted ? '1' : '0'); } catch (e) { }
    // Khi tắt nhạc: dừng mọi track nhạc hiện tại
    if (audioSettings.isMusicMuted) {
        sounds.menuTheme.pause();
        sounds.bgMusic.pause();
        sounds.winner.pause();
        sounds.gameOver.pause();
        sounds.rating.pause();
    }
    updateAudioButtonsUI();
}

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
    ],
    // Thêm map images để preload
    map: [
        'assets/map/map_1.jpg',
        'assets/map/map_2.jpg',
        'assets/map/map_3.jpg',
        'assets/map/map_4.jpg',
        'assets/map/map_5.jpg',
        'assets/map/map_6.jpg',
        'assets/map/map_7.jpg',
        'assets/map/map_8.jpg',
        'assets/map/map_9.jpg'
    ]
};

// Preload images
var loadedImages = {
    player: [],
    horizontal: [],
    vertical: [],
    cloud: [],
    map: []  // Cache cho map images
};
var imagesLoaded = false;
var audiosLoaded = false;
var allResourcesLoaded = false;

function preloadAllResources() {
    var totalResources = 0;
    var loadedCount = 0;

    // Đếm tổng số resources (images + audio)
    Object.keys(imageCategories).forEach(function (category) {
        totalResources += imageCategories[category].length;
    });

    // Đếm số audio files
    var audioCount = Object.keys(sounds).length;
    totalResources += audioCount;

    // Hiển thị progress indicator
    var audioUnlockOverlay = document.getElementById('audio-unlock');
    var audioUnlockText = document.querySelector('.audio-unlock-content p');

    if (audioUnlockText) {
        audioUnlockText.textContent = 'Đang tải tài nguyên... 0%';
    }

    // Thêm class loading
    if (audioUnlockOverlay) {
        audioUnlockOverlay.classList.add('loading');
    }

    // Hàm cập nhật progress
    function updateProgress() {
        loadedCount++;
        var progress = Math.round((loadedCount / totalResources) * 100);

        if (audioUnlockText) {
            audioUnlockText.textContent = 'Đang tải tài nguyên... ' + progress + '%';
        }

        // Kiểm tra nếu tất cả resources đã load xong
        if (loadedCount >= totalResources) {
            allResourcesLoaded = true;
            imagesLoaded = true;
            audiosLoaded = true;

            if (audioUnlockText) {
                audioUnlockText.textContent = 'Chạm để bắt đầu';
            }

            if (audioUnlockOverlay) {
                audioUnlockOverlay.classList.remove('loading');
                audioUnlockOverlay.classList.add('loaded');
            }
        }
    }

    // Load images
    Object.keys(imageCategories).forEach(function (category) {
        imageCategories[category].forEach(function (src, index) {
            var img = new Image();
            img.onload = updateProgress;
            img.onerror = updateProgress; // Vẫn tính là "loaded" dù có lỗi
            img.src = src;
            loadedImages[category].push(img);
        });
    });

    // Load audio files
    var audioKeys = Object.keys(sounds);
    var audioTracker = {}; // Track để tránh đếm 2 lần

    audioKeys.forEach(function (key) {
        var audio = sounds[key];
        audioTracker[key] = false;

        function markAudioLoaded() {
            if (!audioTracker[key]) {
                audioTracker[key] = true;
                updateProgress();
            }
        }

        // Event khi audio sẵn sàng phát
        audio.addEventListener('canplaythrough', markAudioLoaded, false);

        // Event khi có đủ data để bắt đầu phát
        audio.addEventListener('loadeddata', markAudioLoaded, false);

        // Event khi có lỗi - vẫn tính là "loaded"
        audio.addEventListener('error', markAudioLoaded, false);

        // Force load
        audio.load();

        // Timeout fallback (nếu audio không trigger event sau 8 giây)
        setTimeout(function () {
            markAudioLoaded();
        }, 8000);
    });
}

// Legacy function name for backward compatibility
function preloadImages() {
    preloadAllResources();
}

// Game state
var gameState = {
    caughtPlanes: 0,
    requiredPlanes: CAMPAIGN_SETTINGS.requiredPlanes,      // Số máy bay cần bắt để thắng (6)
    vietjetSpawned: 0,    // Số máy bay VietJet đã xuất hiện
    maxPlaneVietjet: CAMPAIGN_SETTINGS.totalVietjetPlanes,      // Tổng số VietJet sẽ spawn (10)
    chances: CAMPAIGN_SETTINGS.maxLives,                   // Dùng từ campaign settings
    planesSpawned: 0,
    isGameRunning: false,
    planes: [],
    canvas: null,
    ctx: null,
    animationFrame: null,
    timeLeft: CAMPAIGN_SETTINGS.gameTime,
    timerInterval: null,
    selectedMap: 1,       // Map mặc định
    mapBackground: null,  // Image object của map
    // Canvas dimensions
    canvasWidth: 0,       // Canvas width (viewport)
    canvasHeight: 0,      // Canvas height (viewport)
    resizeTimeout: null,  // Timeout cho debounce resize
    pauseButton: null     // Vùng click của nút pause
};

// Chuyển màn hình
function showScreen(screenId) {
    var screens = document.querySelectorAll('.screen');

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

// Màn hình khảo sát - Gộp chung 2 câu hỏi
// ============================================
// SETTINGS POPUP MANAGEMENT
// ============================================

function showSettingsPopup() {
    var popup = document.getElementById('settings-popup');
    if (popup) {
        popup.classList.add('active');
        // Prevent body scroll when popup is open
        document.body.style.overflow = 'hidden';
    }
}

function hideSettingsPopup() {
    var popup = document.getElementById('settings-popup');
    if (popup) {
        popup.classList.remove('active');
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

function setupSettingsPopupEvents() {
    // Close popup when clicking overlay
    var overlay = document.querySelector('.settings-overlay');
    if (overlay) {
        addClickLikeHandler(overlay, hideSettingsPopup);
    }

    // Close button
    var closeBtn = document.getElementById('settings-close');
    if (closeBtn) {
        addClickLikeHandler(closeBtn, function (e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            hideSettingsPopup();
        });
    }

    // Sound buttons (có thể có nhiều nơi)
    var soundBtns = document.querySelectorAll('.sound-btn');
    if (soundBtns && soundBtns.length) {
        for (var i = 0; i < soundBtns.length; i++) {
            (function (btn) {
                addClickLikeHandler(btn, function (e) {
                    e.stopPropagation();
                    playSoundSafe(sounds.tap);
                    setSfxMuted(!audioSettings.isSfxMuted);
                });
            })(soundBtns[i]);
        }
    }

    // Music buttons (có thể có nhiều nơi)
    var musicBtns = document.querySelectorAll('.music-btn');
    if (musicBtns && musicBtns.length) {
        for (var j = 0; j < musicBtns.length; j++) {
            (function (btn) {
                addClickLikeHandler(btn, function (e) {
                    e.stopPropagation();
                    playSoundSafe(sounds.tap);
                    var willMute = !audioSettings.isMusicMuted;
                    setMusicMuted(willMute);
                    if (!willMute) {
                        // Nếu vừa bật nhạc, phát lại track phù hợp theo ngữ cảnh
                        var isInGame = document.getElementById('game-screen').classList.contains('active');
                        if (isInGame) {
                            playSoundSafe(sounds.bgMusic);
                        } else {
                            playSoundSafe(sounds.menuTheme);
                        }
                    }
                });
            })(musicBtns[j]);
        }
    }

    // Graphic Quality buttons
    var graphicBtns = document.querySelectorAll('.graphic-btn');
    if (graphicBtns && graphicBtns.length) {
        for (var k = 0; k < graphicBtns.length; k++) {
            (function (btn) {
                addClickLikeHandler(btn, function (e) {
                    e.stopPropagation();
                    toggleGraphicQuality();
                });
            })(graphicBtns[k]);
        }
    }

    // Info button
    var infoBtn = document.querySelector('.info-btn');
    if (infoBtn) {
        addClickLikeHandler(infoBtn, function (e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            console.log('Info clicked - Show game info');
            // Show info modal here
        });
    }

    // Exit button
    var exitBtn = document.querySelector('.exit-btn');
    if (exitBtn) {
        addClickLikeHandler(exitBtn, function (e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            console.log('Exit game clicked');
            // Exit game logic here
            if (confirm('Bạn có chắc muốn thoát game?')) {
                window.close();
            }
        });
    }

    // Themes button
    var themesBtn = document.querySelector('.themes-btn');
    if (themesBtn) {
        addClickLikeHandler(themesBtn, function (e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            console.log('Themes clicked');
        });
    }

    // Help button
    var helpBtn = document.querySelector('.help-btn');
    if (helpBtn) {
        addClickLikeHandler(helpBtn, function (e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            console.log('Help clicked');
        });
    }
}

function showSurvey() {
    try {
        showScreen('survey-screen');
        // Reset về câu hỏi 1
        showQuestion(1);
    } catch (error) {
        // Error in showSurvey
    }
}

// Hiển thị câu hỏi cụ thể (1 hoặc 2)
function showQuestion(questionNumber) {
    // Ẩn tất cả câu hỏi
    document.getElementById('question-1').style.display = 'none';
    document.getElementById('question-2').style.display = 'none';

    // Hiển thị câu hỏi được chọn
    document.getElementById('question-' + questionNumber).style.display = 'block';

    // Cập nhật text intro và button
    var introText = document.getElementById('survey-intro');
    var button = document.getElementById('survey-continue-btn');

    if (questionNumber === 1) {
        introText.textContent = 'Trước khi bắt đầu chơi, xin phép bạn trả lời 2 câu hỏi sau đây nhé';
    } else {
    }
}

// Function nextQuestion() đã được thay thế bằng auto-next khi chọn radio button

// Hiển thị flash message khi thiếu câu trả lời
function showFlashMessage(messageId) {
    var flashMessage = document.getElementById(messageId || 'flash-message');

    // Hiển thị message với animation
    flashMessage.classList.add('show');

    // Ẩn message sau 3 giây
    setTimeout(function () {
        flashMessage.classList.remove('show');
    }, 3000);
}

// Function để lấy đường dẫn map mặc định (dùng làm fallback)
function getMapPath(mapId) {
    // Return đường dẫn mặc định với extension .jpg
    return 'assets/map/map_' + mapId + '.jpg';
}

// Function để thử load image với fallback extension
function loadMapImage(mapId, callback) {
    var basePath = 'assets/map/map_' + mapId;
    var extensions = ['jpg', 'png', 'jpeg', 'webp'];
    var currentIndex = 0;

    function tryLoadImage() {
        if (currentIndex >= extensions.length) {
            callback(null);
            return;
        }

        var img = new Image();
        img.onload = function () {
            callback(basePath + '.' + extensions[currentIndex]);
        };
        img.onerror = function () {
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
    loadMapImage(mapId, function (mapPath) {
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
    loadMapImage(gameState.selectedMap, function (mapPath) {
        if (mapPath) {
            gameScreen.style.backgroundImage = 'url(\'' + mapPath + '\')';
        } else {
            // Fallback về jpg nếu không tìm thấy file nào
            var fallbackPath = getMapPath3(gameState.selectedMap);
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

    var count = 0;
    numberElement.textContent = count;

    // Phát âm thanh beep cho số 3
    playSoundSafe(sounds.timerBeep);

    var countdownInterval = setInterval(function () {
        count--;

        if (count > 0) {
            // Hiển thị số 2, 1
            numberElement.textContent = count;

            // Phát âm thanh beep
            playSoundSafe(sounds.timerBeep);

            // Reset animation bằng cách xóa và thêm lại class
            numberElement.style.animation = 'none';
            setTimeout(function () {
                numberElement.style.animation = 'countdownPulse 1s ease-out';
            }, 10);
        } else {
            // Ẩn countdown overlay
            overlay.classList.remove('active');


            // Dừng nhạc menu theme (tôn trọng trạng thái nhạc)
            sounds.menuTheme.pause();
            sounds.menuTheme.currentTime = 0;

            // Bắt đầu game luôn (bỏ cut-in animation)
            initGame();

            // Phát nhạc nền game nếu không mute nhạc
            playSoundSafe(sounds.bgMusic);

            clearInterval(countdownInterval);

            // Reset về 3 cho lần sau (sau khi overlay đã ẩn)
            setTimeout(function () {
                numberElement.textContent = '3';
            }, 500);
        }
    }, 1000);
}

// Cut-in Animation - ĐÃ BỎ (không dùng nữa)
// Giờ sau countdown 3-2-1 sẽ vào game luôn
/*
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
*/

// Khởi tạo game
function initGame() {
    gameState.caughtPlanes = 0;
    gameState.planesSpawned = 0;
    gameState.vietjetSpawned = 0;
    gameState.planes = [];
    gameState.isGameRunning = true;

    // Áp dụng campaign settings
    gameState.timeLeft = CAMPAIGN_SETTINGS.gameTime;
    gameState.chances = CAMPAIGN_SETTINGS.maxLives;
    gameState.requiredPlanes = CAMPAIGN_SETTINGS.requiredPlanes;
    gameState.maxPlaneVietjet = CAMPAIGN_SETTINGS.totalVietjetPlanes;

    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Update UI - Force update lúc init
    updateScore(true);
    // updateTimer(); // Comment vì dùng canvas UI

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

    // Lấy kích thước viewport thực tế
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    // Đảm bảo kích thước tối thiểu
    viewportWidth = Math.max(viewportWidth, 320);
    viewportHeight = Math.max(viewportHeight, 480);

    // Set canvas buffer size = viewport
    gameState.canvas.width = viewportWidth;
    gameState.canvas.height = viewportHeight;

    // Set canvas CSS size = viewport (phủ full màn)
    gameState.canvas.style.width = viewportWidth + 'px';
    gameState.canvas.style.height = viewportHeight + 'px';

    // Reset context transform về identity (không scale)
    gameState.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Lưu state
    gameState.canvasWidth = viewportWidth;
    gameState.canvasHeight = viewportHeight;

    // Log để debug
    console.log('Canvas resized - Buffer: ' +
        gameState.canvas.width + 'x' + gameState.canvas.height);
}


// Function để xử lý resize window
function handleWindowResize() {
    // Debounce resize để tránh gọi quá nhiều lần
    clearTimeout(gameState.resizeTimeout);
    gameState.resizeTimeout = setTimeout(function () {
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
    setTimeout(function () {
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
    // Canvas coordinates (đã scale theo canvas size)
    var canvasX = (e.clientX - rect.left) * (gameState.canvas.width / rect.width);
    var canvasY = (e.clientY - rect.top) * (gameState.canvas.height / rect.height);

    checkHit(canvasX, canvasY);
}

function handleCanvasTouch(e) {
    if (!gameState.isGameRunning) return;

    // Lấy tọa độ từ touch hoặc changedTouches (cho touchend)
    var touch = e.touches && e.touches[0] ? e.touches[0] :
        (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null);

    if (!touch) {
        return;
    }

    // QUAN TRỌNG: preventDefault() PHẢI được gọi để tránh double-tap zoom trên Android cũ
    try {
        e.preventDefault();
    } catch (err) {
        // preventDefault failed
    }

    var rect = gameState.canvas.getBoundingClientRect();
    // Canvas coordinates (đã scale theo canvas size)
    var canvasX = (touch.clientX - rect.left) * (gameState.canvas.width / rect.width);
    var canvasY = (touch.clientY - rect.top) * (gameState.canvas.height / rect.height);

    checkHit(canvasX, canvasY);
}

function checkHit(x, y) {
    // Kiểm tra click vào nút pause trước
    if (gameState.pauseButton) {
        var pauseBtn = gameState.pauseButton;
        // check va chạm vào các vùng biên của nút pause
        if (x >= pauseBtn.x && x <= pauseBtn.x + pauseBtn.width &&
            y >= pauseBtn.y && y <= pauseBtn.y + pauseBtn.height) {
            // Click vào nút pause
            playSoundSafe(sounds.tap);
            showPausePopup();
            return;
        }
    }

    // Kiểm tra click vào máy bay
    for (var i = gameState.planes.length - 1; i >= 0; i--) {
        var plane = gameState.planes[i];
        var distance = Math.sqrt(
            Math.pow(x - plane.x, 2) + Math.pow(y - plane.y, 2)
        );

        // Tăng hitbox bằng HITBOX_MULTIPLIER để dễ click hơn
        var hitRadius = (plane.size / 2) * GAME_CONFIG.HITBOX_MULTIPLIER;

        if (distance < hitRadius) {
            gameState.planes.splice(i, 1);

            if (plane.type === 'player') {
                // Chạm vào máy bay VietJet -> +1 điểm
                gameState.caughtPlanes++;
                // Thưởng thêm thời gian
                gameState.timeLeft += CAMPAIGN_SETTINGS.timeBonus;

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
            particles.forEach(function (p) {
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

// Throttle update UI để tránh lag trên Android yếu
var lastScoreUpdate = 0;
var scoreUpdateThrottle = 100; // ms - chỉ update tối đa mỗi 100ms
var scoreUpdatePending = false;

function updateScore(force) {
    var now = Date.now();

    // Force update (khi init game hoặc game end)
    if (force) {
        doUpdateScore();
        return;
    }

    // Throttle: chỉ update nếu đã qua đủ thời gian
    if (now - lastScoreUpdate < scoreUpdateThrottle) {
        // Đánh dấu cần update sau
        if (!scoreUpdatePending) {
            scoreUpdatePending = true;
            setTimeout(function () {
                scoreUpdatePending = false;
                doUpdateScore();
            }, scoreUpdateThrottle);
        }
        return;
    }

    doUpdateScore();
}

function doUpdateScore() {
    lastScoreUpdate = Date.now();

    // Update DOM (comment để dùng canvas UI)
    // document.getElementById('caught-count').textContent =
    //     gameState.caughtPlanes + '/' + gameState.requiredPlanes;
    // document.getElementById('chances-left').textContent = gameState.chances;
    // document.getElementById('vietjet-spawned').textContent =
    //     gameState.vietjetSpawned + '/' + gameState.maxPlaneVietjet;

    // Debug: kiểm tra game state
    console.log('Game State:', {
        isGameRunning: gameState.isGameRunning,
        caughtPlanes: gameState.caughtPlanes,
        vietjetSpawned: gameState.vietjetSpawned,
        chances: gameState.chances,
        timeLeft: gameState.timeLeft
    });
}

// Preload UI assets
var uiAssets = {
    heart: null,
    clock: null,
    star: null,
    gem: null,
    pause: null
};

// Load UI assets
function loadUIAssets() {
    uiAssets.heart = new Image();
    uiAssets.heart.src = 'assets/icon_512/HeartFull.png';
    
    uiAssets.clock = new Image();
    uiAssets.clock.src = 'assets/clock.png';
    
    uiAssets.star = new Image();
    uiAssets.star.src = 'assets/ui/default/bubble/star_1.png';
    
    uiAssets.gem = new Image();
    uiAssets.gem.src = 'assets/icon_512/GemRed.png';
    
    uiAssets.pause = new Image();
    uiAssets.pause.src = 'assets/ui/default/btn/pause.png';
}

// Call loadUIAssets when game starts
loadUIAssets();

function drawCanvasUI() {
    var ctx = gameState.ctx;
    var canvasWidth = gameState.canvas.width;
    var canvasHeight = gameState.canvas.height;

    // Lưu trạng thái canvas
    ctx.save();

    // ===========================================
    // TOP LEFT: Hearts (Lives) - 3 Cục Máu
    // ===========================================
    drawTopLeftUI(ctx, canvasWidth, canvasHeight);

    // ===========================================
    // TOP CENTER: Timer - Thời Gian
    // ===========================================
    drawTopCenterUI(ctx, canvasWidth, canvasHeight);

    // ===========================================
    // TOP RIGHT: Pause Button - Nút Pause
    // ===========================================
    drawTopRightUI(ctx, canvasWidth, canvasHeight);

    // ===========================================
    // BOTTOM LEFT: Vietjet Spawned Count - Số máy bay đã xuất hiện
    // ===========================================
    drawBottomLeftUI(ctx, canvasWidth, canvasHeight);

    // ===========================================
    // BOTTOM RIGHT: Target Score - Điểm số mục tiêu
    // ===========================================
    drawBottomRightUI(ctx, canvasWidth, canvasHeight);

    // Khôi phục trạng thái canvas
    ctx.restore();
}

function drawTopLeftUI(ctx, canvasWidth, canvasHeight) {
    // TOP LEFT: 3 Cục Máu (Hearts/Lives)
    var isMobile = canvasWidth < 800;
    
    var startX = 20;
    var startY = 20;
    var heartSize = 35;
    var spacing = 40;
    
    // Save context state
    ctx.save();
    
    // Draw hearts (lives)
    for (var i = 0; i < gameState.chances; i++) {
        var heartX = startX + (i * spacing);
        var heartY = startY;
        
        // Heart shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw heart icon if loaded
        if (uiAssets.heart && uiAssets.heart.complete) {
            ctx.drawImage(uiAssets.heart, heartX, heartY, heartSize, heartSize);
        } else {
            // Fallback: draw heart shape
            drawHeart(ctx, heartX + heartSize/2, heartY + heartSize/2, heartSize/2);
        }
        
        // Reset shadow for next iteration
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // Restore context state
    ctx.restore();
}

function drawTopCenterUI(ctx, canvasWidth, canvasHeight) {
    // TOP CENTER: Thời Gian (Timer)
    var timerWidth = 120;
    var timerHeight = 40;
    var timerX = (canvasWidth - timerWidth) / 2; // Center horizontally
    var timerY = 20;
    
    // Save context state
    ctx.save();
    
    // Timer background (white rounded rect with shadow)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    drawRoundedRect(ctx, timerX, timerY, timerWidth, timerHeight, 10);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Timer icon (clock)
    var clockSize = 28;
    if (uiAssets.clock && uiAssets.clock.complete) {
        ctx.drawImage(uiAssets.clock, timerX + 8, timerY + 6, clockSize, clockSize);
    }
    
    // Timer text
    var minutes = Math.floor(gameState.timeLeft / 60);
    var seconds = Math.floor(gameState.timeLeft % 60);
    var timeText = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    ctx.fillStyle = '#00BCD4';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeText, timerX + timerWidth/2 + 10, timerY + timerHeight/2);
    
    // Restore context state
    ctx.restore();
}

function drawTopRightUI(ctx, canvasWidth, canvasHeight) {
    // TOP RIGHT: Nút Pause
    var pauseSize = 56;
    var pauseX = canvasWidth - pauseSize - 20;
    var pauseY = 20;
    
    // Lưu vùng click của nút pause để xử lý click
    gameState.pauseButton = {
        x: pauseX,
        y: pauseY,
        width: pauseSize,
        height: pauseSize
    };
    
    // Vẽ ảnh pause
    if (uiAssets.pause && uiAssets.pause.complete) {
        ctx.drawImage(uiAssets.pause, pauseX, pauseY, pauseSize, pauseSize);
    }
}

function drawBottomLeftUI(ctx, canvasWidth, canvasHeight) {
    // BOTTOM LEFT: Số máy bay đã xuất hiện / Tổng 10
    var boxWidth = 150;
    var boxHeight = 50;
    var boxX = 20;
    var boxY = canvasHeight - boxHeight - 20;
    
    // Save context state
    ctx.save();
    
    // Background (white rounded rect with shadow)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Border for emphasis
    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.stroke();
    
    // Plane icon (circle with plane symbol)
    var iconSize = 32;
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(boxX + 25, boxY + boxHeight/2, iconSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Plane text in circle
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tổng', boxX + 25, boxY + boxHeight/2);
    
    // Counter text
    var counterText = gameState.vietjetSpawned + '/' + gameState.maxPlaneVietjet;
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(counterText, boxX + boxWidth/2 + 25, boxY + boxHeight/2);
    
    // Restore context state
    ctx.restore();
}

function drawBottomRightUI(ctx, canvasWidth, canvasHeight) {
    // BOTTOM RIGHT: Target 6 (Điểm số mục tiêu)
    var boxWidth = 150;
    var boxHeight = 50;
    var boxX = canvasWidth - boxWidth - 20;
    var boxY = canvasHeight - boxHeight - 20;
    
    // Save context state
    ctx.save();
    
    // Background (white rounded rect with shadow)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Border for emphasis
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.stroke();
    
    // Target icon
    var iconSize = 32;
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(boxX + 25, boxY + boxHeight/2, iconSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Target symbol in circle
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Target', boxX + 25, boxY + boxHeight/2);
    
    // Score text
    var scoreText = gameState.caughtPlanes + '/' + gameState.requiredPlanes;
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(scoreText, boxX + boxWidth/2 + 25, boxY + boxHeight/2);
    
    // Restore context state
    ctx.restore();
}

// Helper functions for drawing shapes
function drawStar(ctx, x, y, radius, points) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
        var angle = (i * Math.PI) / points;
        var r = i % 2 === 0 ? radius : radius * 0.5;
        var px = x + Math.cos(angle) * r;
        var py = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function drawHeart(ctx, x, y, size) {
    ctx.fillStyle = '#E91E63';
    ctx.beginPath();
    ctx.moveTo(x, y + size/4);
    ctx.bezierCurveTo(x, y, x - size/2, y, x - size/2, y + size/4);
    ctx.bezierCurveTo(x - size/2, y + size/2, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size/2, y + size/2, x + size/2, y + size/4);
    ctx.bezierCurveTo(x + size/2, y, x, y, x, y + size/4);
    ctx.closePath();
    ctx.fill();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
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
            // updateTimer(); // Comment vì dùng canvas UI

            // Kiểm tra hết giờ
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerInterval);
                // Check điều kiện thắng thua
                if (gameState.caughtPlanes >= CAMPAIGN_SETTINGS.requiredPlanes) {
                    endGame(true); // Thắng nếu đủ số máy bay yêu cầu
                } else {
                    endGame(false); // Thua nếu không đủ
                }
            }
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function checkGameEnd() {
    // Thắng ngay khi bắt được đủ số máy bay yêu cầu
    if (gameState.caughtPlanes >= CAMPAIGN_SETTINGS.requiredPlanes) {
        endGame(true);
        return;
    }

    if (gameState.chances <= 0) {
        // Thua khi hết mạng
        endGame(false);
    } else if (gameState.vietjetSpawned >= gameState.maxPlaneVietjet) {
        // Đã spawn đủ VietJet
        if (gameState.caughtPlanes >= CAMPAIGN_SETTINGS.requiredPlanes) {
            endGame(true); // Thắng khi đủ số máy bay yêu cầu
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
                // Không còn VietJet nào trên màn mà chưa đủ số yêu cầu → Thua
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

    // Force update UI cuối cùng
    updateScore(true);

    // Dừng nhạc nền
    sounds.bgMusic.pause();
    sounds.bgMusic.currentTime = 0;

    setTimeout(function () {
        if (isWin) {
            // Cập nhật QR code
            var qrImage = document.getElementById('qr-image');

            if (qrImage) {
                qrImage.src = CAMPAIGN_SETTINGS.qrCode;
            }

            showScreen('win-screen');
            playSoundSafe(sounds.winner);
        } else {
            // Hiển thị popup "THUA" trước
            showGameOverPopup();
        }
    }, 500);
}

function spawnPlane() {
    if (!gameState.isGameRunning || isGamePaused) {
        return;
    }

    // Kiểm tra giới hạn số object trên màn hình (cho thiết bị yếu)
    if (gameState.planes.length >= GAME_CONFIG.MAX_OBJECTS_ON_SCREEN) {
        // Nếu đã đạt giới hạn, delay ngắn rồi thử lại
        setTimeout(spawnPlane, 200);
        return;
    }

    // Random chọn loại đối tượng
    var type;

    // Nếu đã spawn đủ 10 VietJet thì chỉ spawn horizontal/vertical
    if (gameState.vietjetSpawned >= gameState.maxPlaneVietjet) {
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
    var speed = baseSpeed * CAMPAIGN_SETTINGS.speedMultiplier;

    // Tính kích thước thực tế của máy bay khi vẽ (để spawn ngoài màn hình)
    var planeDisplaySize = GAME_CONFIG.PLANE_SIZE * GAME_CONFIG.PLANE_SIZE_MULTIPLIER;
    var spawnOffset = planeDisplaySize / 2 + 10; // Offset thêm 10px để chắc chắn

    if (type === 'vertical') {
        // Vertical = Bay theo chiều dọc (từ trên xuống hoặc dưới lên)
        var fromTop = Math.random() < 0.5;
        // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền trái/phải)
        x = gameState.canvas.width * 0.1 + Math.random() * (gameState.canvas.width * 0.8);

        if (fromTop) {
            y = -spawnOffset; // Spawn ngoài biên trên
            vx = 0;
            vy = speed;
        } else {
            y = gameState.canvas.height + spawnOffset; // Spawn ngoài biên dưới
            vx = 0;
            vy = -speed;
        }
    } else if (type === 'horizontal') {
        // Horizontal = Bay theo chiều ngang (từ trái qua phải hoặc ngược lại)
        var fromLeft = Math.random() < 0.5;
        // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền trên/dưới)
        y = gameState.canvas.height * 0.2 + Math.random() * (gameState.canvas.height * 0.6);

        if (fromLeft) {
            x = -spawnOffset; // Spawn ngoài biên trái
            vx = speed;
            vy = 0;
        } else {
            x = gameState.canvas.width + spawnOffset; // Spawn ngoài biên phải
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
                y = -spawnOffset; // Spawn ngoài biên trên
                vx = (Math.random() - 0.5) * speed;
                vy = speed;
                break;
            case 1: // right
                x = gameState.canvas.width + spawnOffset; // Spawn ngoài biên phải
                // Giới hạn Y: spawn từ 20% đến 80% chiều cao (tránh quá sát viền)
                y = gameState.canvas.height * 0.2 + Math.random() * (gameState.canvas.height * 0.6);
                vx = -speed;
                vy = (Math.random() - 0.5) * speed;
                break;
            case 2: // bottom
                // Giới hạn X: spawn từ 10% đến 90% chiều rộng (tránh quá sát viền)
                x = gameState.canvas.width * 0.1 + Math.random() * (gameState.canvas.width * 0.8);
                y = gameState.canvas.height + spawnOffset; // Spawn ngoài biên dưới
                vx = (Math.random() - 0.5) * speed;
                vy = -speed;
                break;
            case 3: // left
                x = -spawnOffset; // Spawn ngoài biên trái
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
    var isLastVietjet = (type === 'player' && gameState.vietjetSpawned === gameState.maxPlaneVietjet - 1);

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
        // updateScore(); // Comment - UI được vẽ trong game loop
    }

    // Spawn next plane after delay (spawn liên tục cho đến khi game kết thúc)
    setTimeout(spawnPlane, GAME_CONFIG.SPAWN_DELAY_MIN + Math.random() * GAME_CONFIG.SPAWN_DELAY_RANGE);
}

// Performance optimization: Cross-browser requestAnimationFrame với fallback 30fps
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 30); // fallback 30fps cho thiết bị yếu
        };
})();


function update(deltaSeconds) {
    if (!gameState.isGameRunning || isGamePaused) return;

    // Default deltaSeconds nếu không truyền vào (backward compatibility)
    if (!deltaSeconds) deltaSeconds = 1 / 60; // Fallback 60 FPS

    // Kiểm tra và tự động xóa object cũ nhất nếu vượt quá giới hạn
    // (Biện pháp an toàn cho thiết bị yếu)
    if (gameState.planes.length > GAME_CONFIG.MAX_OBJECTS_ON_SCREEN) {
        // Xóa object cũ nhất (index 0)
        var oldPlane = gameState.planes.shift();
        console.log('Auto-removed old plane due to object limit:', oldPlane.type);
    }

    // Update planes với delta time - TỐC ĐỘ ĐỘC LẬP VỚI FPS
    for (var i = gameState.planes.length - 1; i >= 0; i--) {
        var plane = gameState.planes[i];

        // Update position - NHÂN VỚI deltaSeconds (60 FPS baseline)
        // Velocity đã được scale cho 60 FPS, nên cần normalize
        var speedFactor = deltaSeconds * 60; // 60 FPS làm baseline
        plane.x += plane.vx * speedFactor;
        plane.y += plane.vy * speedFactor;

        // Update rotation cho player planes
        if (plane.type === 'player' || plane.type === 'horizontal' || plane.type === 'vertical') {
            plane.rotationTime += plane.rotationSpeed * speedFactor;
            // Dao động từ -0.15 đến +0.15 radian (~-8° đến +8°)
            plane.rotationOffset = Math.sin(plane.rotationTime) * 0.15;
        }

        // Remove if out of bounds
        var margin = 100; // Buffer để planes bay hoàn toàn ra ngoài trước khi xóa
        if (plane.x < -margin || plane.x > gameState.canvas.width + margin ||
            plane.y < -margin || plane.y > gameState.canvas.height + margin) {

            // Nếu là máy bay VietJet cuối cùng bay mất thì thua ngay
            if (plane.isLastVietjet) {
                gameState.planes.splice(i, 1);
                endGame(false); 
                return;
            }

            gameState.planes.splice(i, 1);

            // Kiểm tra điều kiện kết thúc sau khi xóa máy bay
            checkGameEnd();

            continue;
        }
    }
}

function draw() {
    if (!gameState.isGameRunning) return;

    // Clear canvas - dùng canvas dimensions thực tế
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // Draw clouds

    if (GAME_CONFIG.HIGHT_QUALITY) {
        drawClouds();
    }

    // Draw planes
    for (var i = 0; i < gameState.planes.length; i++) {
        drawPlane(gameState.planes[i]);
    }

    // Draw Canvas UI (thay thế DOM)
    drawCanvasUI();
}

/*
 * ==============================================
 * DELTA TIME SYSTEM - TỐC ĐỘ ĐỘC LẬP VỚI FPS
 * ==============================================
 * 
 * Hệ thống này đảm bảo tốc độ di chuyển của object KHÔNG PHỤ THUỘC vào FPS:
 * - FPS = 24: update 24 lần/giây → mỗi frame di chuyển nhiều hơn
 * - FPS = 240: update 240 lần/giây → mỗi frame di chuyển ít hơn
 * 
 * Công thức: position += velocity * deltaTime * 60
 * - deltaTime = thời gian giữa 2 frame (giây)
 * - *60 = baseline 60 FPS (velocity đã được tune cho 60 FPS)
 * 
 * Kết quả: Tốc độ di chuyển LUÔN GIỐNG NHAU dù FPS là bao nhiêu!
 */

// FPS Limiter - Lock FPS để tối ưu hiệu suất
var lastFrameTime = 0;
var targetFPS = GAME_CONFIG.TARGET_FPS;
var frameInterval = 1000 / targetFPS; // ms per frame
var deltaTime = 0; // Delta time cho game logic (global để update() dùng)

function gameLoop(currentTime) {
    if (!gameState.isGameRunning) return;

    // Tính delta time
    if (!currentTime) currentTime = performance.now();
    if (!lastFrameTime) lastFrameTime = currentTime;

    deltaTime = currentTime - lastFrameTime;

    // Chỉ render khi đủ thời gian
    if (deltaTime >= frameInterval) {
        // Normalize delta time thành giây (để dùng trong physics)
        var deltaSeconds = deltaTime / 1000;

        // Lưu timestamp, điều chỉnh cho frame drift
        lastFrameTime = currentTime - (deltaTime % frameInterval);

        update(deltaSeconds);
        draw();
    }

    gameState.animationFrame = window.requestAnimFrame(gameLoop);
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
            gameState.ctx.globalAlpha = cloud.opacity;

            var img = loadedImages.cloud[cloud.imageIndex];
            var width = cloud.size;
            var height = cloud.size * 0.6; // Tỉ lệ chiều cao/rộng của mây

            gameState.ctx.drawImage(img, cloud.x, cloud.y, width, height);
            gameState.ctx.restore();
        }

        // Di chuyển mây - SỬ DỤNG delta time để tốc độ độc lập với FPS
        var cloudSpeedFactor = (deltaTime / 1000) * 60; // 60 FPS baseline
        cloud.x += cloud.speed * cloudSpeedFactor;
        // Reset từ biên trái khi ra khỏi biên phải
        if (cloud.x > gameState.canvas.width) {
            cloud.x = 0; // Spawn từ biên trái
            cloud.y = Math.random() * gameState.canvas.height;
        }
    }
}

function drawPlane(plane) {
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

    // Cải thiện chất lượng ảnh khi scale (tối ưu cho thiết bị yếu)
    gameState.ctx.imageSmoothingEnabled = GAME_CONFIG.HIGHT_QUALITY
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

    // Không tự động chuyển màn hình nữa - chỉ khi bấm nút gửi
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

    // Reset feedback input
    var feedbackInput = document.getElementById('feedback-input');
    if (feedbackInput) {
        feedbackInput.value = '';
    }
}

// Hàm lưu feedback và rating vào localStorage
function saveFeedbackData() {
    var feedbackInput = document.getElementById('feedback-input');
    var feedbackText = feedbackInput ? feedbackInput.value.trim() : '';

    var feedbackData = {
        rating: selectedRating,
        feedback: feedbackText,
        timestamp: new Date().toISOString(),
        gameData: {
            caughtPlanes: gameState.caughtPlanes,
            totalSpawned: gameState.planesSpawned,
            vietjetSpawned: gameState.vietjetSpawned
        }
    };

    try {
        // Lấy dữ liệu cũ từ localStorage
        var existingData = localStorage.getItem('vj_feedback_data');
        var feedbackHistory = existingData ? JSON.parse(existingData) : [];

        // Thêm dữ liệu mới
        feedbackHistory.push(feedbackData);

        // Lưu lại vào localStorage (giới hạn 50 feedback gần nhất)
        if (feedbackHistory.length > 50) {
            feedbackHistory = feedbackHistory.slice(-50);
        }

        localStorage.setItem('vj_feedback_data', JSON.stringify(feedbackHistory));
        console.log('Feedback saved:', feedbackData);
    } catch (e) {
        console.error('Error saving feedback:', e);
    }
}

// Hàm xử lý khi bấm nút gửi feedback
function handleSendFeedback() {
    if (selectedRating === 0) {
        // Hiển thị thông báo yêu cầu chọn rating
        var ratingValue = document.getElementById('rating-value');
        if (ratingValue) {
            ratingValue.textContent = 'Vui lòng chọn số sao đánh giá!';
            ratingValue.style.color = '#e74c3c';
        }
        return;
    }

    // Lưu dữ liệu feedback
    saveFeedbackData();

    // Phát âm thanh
    playSoundSafe(sounds.tap);

    // Chuyển sang màn hình cảm ơn
    showThankYou();
}

function showThankYou() {
    showScreen('thank-screen');
}

function showWelcome() {
    showScreen('welcome-screen');
    // Phát lại nhạc menu theme nếu không mute nhạc
    playSoundSafe(sounds.menuTheme);
}

// Show instruction screen với 2 mode: normal (có nút start) và FAQ (có nút đóng)
function showInstructionScreen(mode) {
    showScreen('instruction-screen');

    var startGameBtn = document.getElementById('start-game-btn');
    var closeBtn = document.getElementById('instruction-close-btn');

    if (mode === 'faq') {
        // FAQ mode: ẩn nút start, hiện nút đóng
        if (startGameBtn) startGameBtn.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'block';
    } else {
        // Normal mode: hiện nút start, ẩn nút đóng
        if (startGameBtn) startGameBtn.style.display = 'flex';
        if (closeBtn) closeBtn.style.display = 'none';
    }
}

function restartGame() {
    // Dừng timer
    stopTimer();

    // Clear game over timeout nếu có
    if (gameOverTimeout) {
        clearTimeout(gameOverTimeout);
        gameOverTimeout = null;
    }

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

    // Clear canvas ngay lập tức để xóa hết planes đang bay
    if (gameState.ctx && gameState.canvas) {
        gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    }

    // Clear planes array để xóa hết planes đang bay
    gameState.planes = [];

    // Reset game state hoàn toàn
    gameState.caughtPlanes = 0;
    gameState.planesSpawned = 0;
    gameState.vietjetSpawned = 0;
    gameState.chances = CAMPAIGN_SETTINGS.maxChances;
    gameState.timeLeft = CAMPAIGN_SETTINGS.gameTime;
    gameState.isGameRunning = false;

    // Sử dụng map hiện tại để chơi lại (không random map mới)
    if (currentMap) {
        console.log('Restarting with same map:', currentMap);
        selectMap(currentMap);
    } else {
        // Fallback nếu không có map được lưu (trường hợp hiếm)
        console.log('No saved map, going to welcome screen');
        showScreen('welcome-screen');
        // Phát lại nhạc menu theme nếu không mute nhạc
        playSoundSafe(sounds.menuTheme);
    }
}

// Pause feature removed

// Pause functionality
var isGamePaused = false;

// Current map storage
var currentMap = null;

function showPausePopup() {
    var popup = document.getElementById('pause-popup');
    if (popup) {
        popup.classList.add('active');
        pauseGame();
    }
}

function hidePausePopup() {
    var popup = document.getElementById('pause-popup');
    if (popup) {
        popup.classList.remove('active');
        resumeGame();
    }
}

function pauseGame() {
    isGamePaused = true;

    // Dừng timer
    stopTimer();

    // Dừng tất cả âm thanh
    Object.keys(sounds).forEach(function (key) {
        if (sounds[key] && typeof sounds[key].pause === 'function') {
            sounds[key].pause();
        }
    });

    // Dừng spawn planes nhưng vẫn giữ game loop chạy để vẽ game
    // gameState.isGameRunning vẫn true để game loop tiếp tục

    console.log('Game paused');
}

function resumeGame() {
    isGamePaused = false;

    // Tiếp tục game nếu đang trong game
    var gameScreen = document.getElementById('game-screen');
    if (gameScreen && gameScreen.classList.contains('active')) {
        gameState.isGameRunning = true;
        startTimer();

        // Phát lại nhạc nền game nếu không mute
        if (!audioSettings.isMusicMuted) {
            playSoundSafe(sounds.bgMusic);
        }
    }

    console.log('Game resumed');
}

function setupPausePopupButtons() {
    // Sound buttons trong pause popup
    var pauseSoundBtns = document.querySelectorAll('#pause-popup .sound-btn');
    if (pauseSoundBtns && pauseSoundBtns.length) {
        for (var i = 0; i < pauseSoundBtns.length; i++) {
            (function (btn) {
                addClickLikeHandler(btn, function (e) {
                    e.stopPropagation();
                    playSoundSafe(sounds.tap);
                    setSfxMuted(!audioSettings.isSfxMuted);
                });
            })(pauseSoundBtns[i]);
        }
    }

    // Music buttons trong pause popup
    var pauseMusicBtns = document.querySelectorAll('#pause-popup .music-btn');
    if (pauseMusicBtns && pauseMusicBtns.length) {
        for (var j = 0; j < pauseMusicBtns.length; j++) {
            (function (btn) {
                addClickLikeHandler(btn, function (e) {
                    e.stopPropagation();
                    playSoundSafe(sounds.tap);
                    var willMute = !audioSettings.isMusicMuted;
                    setMusicMuted(willMute);
                });
            })(pauseMusicBtns[j]);
        }
    }
}

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
        setTimeout(function () {
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

    el.addEventListener('touchend', function (e) {
        e.preventDefault();
        if (!handled) {
            handled = true;
            handler(e);
            setTimeout(function () { handled = false; }, 500);
        }
    }, false);

    // LUÔN thêm click event (quan trọng cho tất cả thiết bị)
    el.addEventListener('click', function (e) {
        if (!handled) {
            handled = true;
            handler(e);
            setTimeout(function () { handled = false; }, 500);
        }
    }, false);
}

// Audio unlock handler
var audioUnlocked = false;
function unlockAudio() {
    //Check devicePixelRatio || tuyết đối không xoá nhé
    // alert('devicePixelRatio: ' + window.devicePixelRatio);
    console.log('devicePixelRatio: ', window.devicePixelRatio);

    // KIỂM TRA: Chỉ cho phép tiếp tục khi đã load xong 100% tài nguyên (images + audio)
    if (!imagesLoaded || !allResourcesLoaded) {
        console.log('Vui lòng đợi tải tài nguyên hoàn tất...');
        // Thêm hiệu ứng shake để báo hiệu chưa load xong
        var audioUnlock = document.getElementById('audio-unlock');
        if (audioUnlock) {
            audioUnlock.classList.add('shake');
            setTimeout(function () {
                audioUnlock.classList.remove('shake');
            }, 500);
        }
        return; // Không cho phép tiếp tục
    }

    // Gọi API GET tới https://jsonplaceholder.typicode.com/todos/1 
    callAPI({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        onSuccess: function (response) {
            console.log('Kết quả GET:', response);
        },
        onError: function (error) {
            console.log('Lỗi API:', error);
        }
    });

    // Tránh gọi nhiều lần
    if (audioUnlocked) {
        return;
    }

    audioUnlocked = true;

    // Phát nhạc menu theme
    playSoundSafe(sounds.menuTheme);

    // Ẩn overlay - QUAN TRỌNG: XÓA HOÀN TOÀN khỏi DOM
    var audioUnlock = document.getElementById('audio-unlock');
    if (audioUnlock) {
        // Xóa khỏi DOM (cách an toàn nhất)
        if (audioUnlock.parentNode) {
            audioUnlock.parentNode.removeChild(audioUnlock);
        }
    }
}

// Setup ALL event handlers (TẤT CẢ handlers được setup ở đây)
function setupAllEventHandlers() {
    // ============================================
    // SPLASH SCREEN BUTTONS
    // ============================================

    // Audio Unlock Overlay
    var audioUnlock = document.getElementById('audio-unlock');
    if (audioUnlock) {
        addClickLikeHandler(audioUnlock, unlockAudio);
    }

    // Splash Button (TAP TO START)
    var splashButton = document.querySelector('.splash-button');
    if (splashButton) {
        addClickLikeHandler(splashButton, function (e) {
            playSoundSafe(sounds.tap);
            showSurvey();
        });
    }

    // Prize Button
    var prizeBtn = document.getElementById('prize-btn');
    if (prizeBtn) {
        addClickLikeHandler(prizeBtn, function (e) {
            playSoundSafe(sounds.tap);
            // alert('Pixel ngang: ' + window.innerWidth + '\nPixel dọc: ' + window.innerHeight);
            startGame(); // Chạy thẳng game luôn
        });
    }

    // FAQ Button
    var faqBtn = document.getElementById('faq-btn');
    if (faqBtn) {
        addClickLikeHandler(faqBtn, function (e) {
            playSoundSafe(sounds.tap);
            showInstructionScreen('faq'); // Show với FAQ mode
        });
    }

    // ============================================
    // SURVEY SCREEN BUTTONS
    // ============================================

    // Survey Continue Button - đã bỏ, thay bằng auto-next

    // Auto-next khi chọn radio button trong survey
    var q1Radios = document.querySelectorAll('input[name="q1"]');
    var q2Radios = document.querySelectorAll('input[name="q2"]');

    // Câu hỏi 1 - chuyển sang câu 2 sau khi chọn
    for (var i = 0; i < q1Radios.length; i++) {
        addClickLikeHandler(q1Radios[i], function (e) {
            playSoundSafe(sounds.tap);
            // Delay 500ms để người dùng thấy đã chọn
            setTimeout(function () {
                showQuestion(2);
            }, 500);
        });
    }

    // Câu hỏi 2 - chuyển sang instruction screen sau khi chọn
    for (var j = 0; j < q2Radios.length; j++) {
        addClickLikeHandler(q2Radios[j], function (e) {
            playSoundSafe(sounds.tap);
            // Delay 500ms để người dùng thấy đã chọn
            setTimeout(function () {
                showInstructionScreen('normal');
            }, 500);
        });
    }

    // ============================================
    // INSTRUCTION SCREEN BUTTONS
    // ============================================

    // Start Game Button
    var startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        addClickLikeHandler(startGameBtn, function (e) {
            // Ngăn click nhiều lần
            if (startGameBtn.classList.contains('btn-start-animation')) {
                return;
            }

            // Phát âm thanh prepare play
            playSoundSafe(sounds.preparePlay);

            // Thêm class animation để trigger button feedback effect
            startGameBtn.classList.add('btn-start-animation');

            // Random map nhưng không hiện gacha animation
            var randomIndex = Math.floor(Math.random() * MAPS_CONFIG.length);
            var randomMapId = MAPS_CONFIG[randomIndex].id;

            // Lưu map hiện tại để dùng khi restart
            currentMap = randomMapId;

            // Delay 1.2 giây (theo duration animation) trước khi chuyển màn hình
            setTimeout(function () {
                selectMap(randomMapId);
                // Xóa class animation sau khi xong
                startGameBtn.classList.remove('btn-start-animation');
            }, 1200); // 1200ms = 1.2s (duration của animation)
        });
    }

    // Help Button
    var helpButton = document.getElementById('help-button');
    if (helpButton) {
        addClickLikeHandler(helpButton, function (e) {
            playSoundSafe(sounds.tap);
            showRulesModal();
        });
    }

    // Instruction Close Button
    var instructionCloseBtn = document.getElementById('instruction-close-btn');
    if (instructionCloseBtn) {
        addClickLikeHandler(instructionCloseBtn, function (e) {
            playSoundSafe(sounds.tap);
            showWelcome(); // Quay về welcome screen
        });
    }

    // ============================================
    // GAME SCREEN BUTTONS
    // ============================================

    // Pause Button (removed with header)
    // var btnPause = document.getElementById('btn-pause');
    // if (btnPause) {
    //     addClickLikeHandler(btnPause, function (e) {
    //         playSoundSafe(sounds.tap);
    //         showPausePopup();
    //     });
    // }

    // Settings Toggle Button
    var settingsToggle = document.getElementById('settings-toggle');
    if (settingsToggle) {
        addClickLikeHandler(settingsToggle, function (e) {
            playSoundSafe(sounds.tap);
            showSettingsPopup();
        });
    }

    // ============================================
    // PAUSE POPUP BUTTONS
    // ============================================

    // Pause Close Button
    var pauseClose = document.getElementById('pause-close');
    if (pauseClose) {
        addClickLikeHandler(pauseClose, function (e) {
            playSoundSafe(sounds.tap);
            hidePausePopup();
        });
    }

    // Pause Resume Button
    var pauseResumeBtn = document.getElementById('pause-resume-btn');
    if (pauseResumeBtn) {
        addClickLikeHandler(pauseResumeBtn, function (e) {
            playSoundSafe(sounds.tap);
            hidePausePopup();
        });
    }

    // Pause Home Button
    var pauseHomeBtn = document.getElementById('pause-home-btn');
    if (pauseHomeBtn) {
        addClickLikeHandler(pauseHomeBtn, function (e) {
            playSoundSafe(sounds.tap);
            hidePausePopup();
            showWelcome();
        });
    }

    // Pause Restart Button
    var pauseRestartBtn = document.getElementById('pause-restart-btn');
    if (pauseRestartBtn) {
        addClickLikeHandler(pauseRestartBtn, function (e) {
            playSoundSafe(sounds.tap);
            hidePausePopup();
            restartGame();
        });
    }

    // ============================================
    // WIN SCREEN BUTTONS
    // ============================================

    // Win Continue Button
    var winContinueBtn = document.getElementById('win-continue-btn');
    if (winContinueBtn) {
        addClickLikeHandler(winContinueBtn, function (e) {
            playSoundSafe(sounds.tap);
            showRating();
        });
    }

    // ============================================
    // LOSE SCREEN BUTTONS
    // ============================================

    // Lose Continue Button
    var loseContinueBtn = document.getElementById('lose-continue-btn');
    if (loseContinueBtn) {
        addClickLikeHandler(loseContinueBtn, function (e) {
            playSoundSafe(sounds.tap);
            showRating();
        });
    }

    // Lose Close Button
    var loseCloseBtn = document.getElementById('lose-close-btn');
    if (loseCloseBtn) {
        addClickLikeHandler(loseCloseBtn, function (e) {
            playSoundSafe(sounds.tap);
            showWelcome();
        });
    }

    // Lose Restart Button
    var loseRestartBtn = document.getElementById('lose-restart-btn');
    if (loseRestartBtn) {
        addClickLikeHandler(loseRestartBtn, function (e) {
            playSoundSafe(sounds.tap);
            restartGame();
        });
    }

    // ============================================
    // RATING SCREEN BUTTONS
    // ============================================

    // Rating Close Button
    var ratingCloseBtn = document.getElementById('rating-close-btn');
    if (ratingCloseBtn) {
        addClickLikeHandler(ratingCloseBtn, function (e) {
            playSoundSafe(sounds.tap);
            showWelcome();
        });
    }

    // Send Feedback Button
    var sendFeedbackBtn = document.getElementById('send-feedback-btn');
    if (sendFeedbackBtn) {
        addClickLikeHandler(sendFeedbackBtn, function (e) {
            playSoundSafe(sounds.tap);
            handleSendFeedback();
        });
    }

    // Rating Stars
    var stars = document.querySelectorAll('.star');
    if (stars.length > 0) {
        for (var i = 0; i < stars.length; i++) {
            (function (star, index) {
                var value = parseInt(star.getAttribute('data-value'));
                addClickLikeHandler(star, function (e) {
                    playSoundSafe(sounds.tap);
                    rateStar(value);
                });
            })(stars[i], i);
        }
    }

    // ============================================
    // THANK SCREEN BUTTONS
    // ============================================

    // Home Button (Thank screen)
    var homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        addClickLikeHandler(homeBtn, function (e) {
            playSoundSafe(sounds.tap);
            showWelcome();
        });
    }

    // ============================================
    // MODAL BUTTONS
    // ============================================

    // Modal Close Button
    var modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        addClickLikeHandler(modalCloseBtn, function (e) {
            playSoundSafe(sounds.tap);
            closeRulesModal();
        });
    }

    // Modal OK Button
    var modalOkBtn = document.getElementById('modal-ok-btn');
    if (modalOkBtn) {
        addClickLikeHandler(modalOkBtn, function (e) {
            playSoundSafe(sounds.tap);
            closeRulesModal();
        });
    }

    // Modal Overlay
    var modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        addClickLikeHandler(modalOverlay, function (e) {
            closeRulesModal();
        });
    }

    // ============================================
    // SETTINGS POPUP
    // ============================================

    // Setup Settings Popup Events
    setupSettingsPopupEvents();

    // ============================================
    // INITIALIZATION
    // ============================================

    // Cập nhật UI âm thanh/nhạc lúc khởi tạo
    updateAudioButtonsUI();
}

// Initialize game when page loads
window.addEventListener('load', function () {
    // Đợi một chút để đảm bảo DOM đã render hoàn toàn (quan trọng cho Android cũ)
    setTimeout(function () {
        preloadImages();
        showScreen('welcome-screen');
        setupAllEventHandlers();
    }, 100);
});
