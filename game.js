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

// ============================================
// GAME CONFIGURATION - TẤT CẢ CẤU HÌNH Ở ĐÂY
// ============================================

// ⚙️ GAME_CONFIG - Dev Configuration (Technical Settings)
// KHÔNG ĐƯỢC SỬA BỪA - Ảnh hưởng đến game mechanics
var GAME_CONFIG = {
    // Virtual Resolution - Độ phân giải ảo cố định
    VIRTUAL_WIDTH: 1280,     // Chiều rộng ảo chuẩn
    VIRTUAL_HEIGHT: 720,     // Chiều cao ảo chuẩn (16:9 ratio)
    
    // Debug
    SHOW_HITBOX: false,       // Bật/tắt hiển thị vòng tròn hitbox (true = hiện, false = ẩn)

    // Kích thước máy bay
    PLANE_SIZE: 50,          // Kích thước cơ bản của máy bay (px)
    PLANE_SIZE_MULTIPLIER: 2, // Hệ số nhân khi vẽ ảnh (1.5 = gấp 1.5 lần)

    // Tốc độ bay của máy bay
    SPEED_DEFAULT: 1,        // Tốc độ mặc định
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

// 🎮 CAMPAIGN_SETTINGS - Campaign Configuration (Business Settings)
// ADMIN CÓ THỂ THAY ĐỔI - Theo từng campaign/event
var CAMPAIGN_SETTINGS = {
    // Gameplay Settings
    gameTime: 20,               // Thời gian chơi (giây)
    timeBonus: 2,               // Thời gian thưởng khi bắt đúng máy bay (giây)
    speedMultiplier: 1.5,       // Độ khó: 1 = Dễ, 1.5 = Trung bình, 2 = Khó
    maxLives: 3,                // Số mạng/cơ hội
    requiredPlanes: 6,          // Số máy bay VietJet cần bắt để thắng
    totalVietjetPlanes: 10,     // Tổng số máy bay VietJet sẽ xuất hiện
    
    // Business Settings
    qrCode: 'assets/qr_code_level_2.png',
    voucherLink: 'https://evoucher.vietjetair.com/Vouchers/Details?AwardCampaign=454',
    campaignId: 'vietjet-holiday-2024',
    campaignName: 'VietJet Holiday Campaign'
};

// Cấu hình timing cho Gacha Animation
var GACHA_CONFIG = {
    // Thời gian quay nhanh (spinning) trước khi bắt đầu dừng
    SPIN_DURATION: 5000,        
    
    // Thời gian chuyển động chậm lại (easing) khi dừng
    STOP_TRANSITION_DURATION: 1000,  // 1000ms = 1 giây để dừng mượt
    
    // Thời gian phát âm thanh kết quả (sau khi bắt đầu dừng)
    SOUND_DELAY: 800,           // 800ms
    
    // Thời gian hiển thị tên map (sau khi dừng hoàn toàn)
    RESULT_DISPLAY_DELAY: 1000, // 1000ms = 1 giây
    
    // Thời gian chờ trước khi chuyển sang game (sau khi hiện tên map)
    GO_TO_GAME_DELAY: 2000,     // 2000ms = 2 giây
};

// Cấu hình danh sách maps
var MAPS_CONFIG = [
    { id: 1, image: 'assets/map/map_1.jpg', name: 'Map 1' },
    { id: 2, image: 'assets/map/map_2.jpg', name: 'Map 2' },
    { id: 3, image: 'assets/map/map_3.jpg', name: 'Map 3' },
    { id: 4, image: 'assets/map/map_4.jpg', name: 'Map 4' },
    { id: 5, image: 'assets/map/map_5.jpg', name: 'Map 5' },
    { id: 6, image: 'assets/map/map_6.jpg', name: 'Map 6' },
    { id: 7, image: 'assets/map/map_7.jpg', name: 'Map 7' },
    { id: 8, image: 'assets/map/map_8.jpg', name: 'Map 8' },
    { id: 9, image: 'assets/map/map_9.jpg', name: 'Map 9' }
];

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
    wheel: new Audio('assets/sounds/wheel.mp3')  // Âm thanh gacha wheel
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
sounds.wheel.volume = 1;  // Âm lượng wheel gacha

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
sounds.wheel.preload = 'auto';

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
            sound.play().catch(function(e) {
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
    try { localStorage.setItem('vj_sfx_muted', audioSettings.isSfxMuted ? '1' : '0'); } catch (e) {}
    updateAudioButtonsUI();
}

function setMusicMuted(muted) {
    audioSettings.isMusicMuted = !!muted;
    try { localStorage.setItem('vj_music_muted', audioSettings.isMusicMuted ? '1' : '0'); } catch (e) {}
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

function preloadImages() {
    var totalImages = 0;
    var loadCount = 0;

    // Đếm tổng số ảnh
    Object.keys(imageCategories).forEach(function(category) {
        totalImages += imageCategories[category].length;
    });

    // Hiển thị progress indicator (optional)
    var audioUnlockText = document.querySelector('.audio-unlock-content p');
    if (audioUnlockText) {
        audioUnlockText.textContent = 'Đang tải... 0%';
    }

    // Load từng category
    Object.keys(imageCategories).forEach(function(category) {
        imageCategories[category].forEach(function(src, index) {
            var img = new Image();
            img.onload = function () {
                loadCount++;
                
                // Cập nhật progress
                var progress = Math.round((loadCount / totalImages) * 100);
                if (audioUnlockText) {
                    audioUnlockText.textContent = 'Đang tải... ' + progress + '%';
                }
                
                if (loadCount === totalImages) {
                    imagesLoaded = true;
                    // Đổi text khi load xong
                    if (audioUnlockText) {
                        audioUnlockText.textContent = 'Chạm để bắt đầu';
                    }
                }
            };
            img.onerror = function() {
                // Xử lý lỗi load ảnh (vẫn tính là đã "load")
                loadCount++;
                var progress = Math.round((loadCount / totalImages) * 100);
                if (audioUnlockText) {
                    audioUnlockText.textContent = 'Đang tải... ' + progress + '%';
                }
                if (loadCount === totalImages) {
                    imagesLoaded = true;
                    if (audioUnlockText) {
                        audioUnlockText.textContent = 'Chạm để bắt đầu';
                    }
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
    totalPlanes: CAMPAIGN_SETTINGS.totalVietjetPlanes,     // Dùng từ campaign settings
    vietjetSpawned: 0,    // Số máy bay VietJet đã xuất hiện
    maxVietjet: CAMPAIGN_SETTINGS.totalVietjetPlanes,      // Dùng từ campaign settings
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
    headerHeight: 0,      // Chiều cao header (sẽ được tính động)
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
        addClickLikeHandler(closeBtn, function(e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            hideSettingsPopup();
        });
    }
    
    // Sound buttons (có thể có nhiều nơi)
    var soundBtns = document.querySelectorAll('.sound-btn');
    if (soundBtns && soundBtns.length) {
        for (var i = 0; i < soundBtns.length; i++) {
            (function(btn){
                addClickLikeHandler(btn, function(e) {
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
            (function(btn){
                addClickLikeHandler(btn, function(e) {
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
    
    // Info button
    var infoBtn = document.querySelector('.info-btn');
    if (infoBtn) {
        addClickLikeHandler(infoBtn, function(e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            console.log('Info clicked - Show game info');
            // Show info modal here
        });
    }
    
    // Exit button
    var exitBtn = document.querySelector('.exit-btn');
    if (exitBtn) {
        addClickLikeHandler(exitBtn, function(e) {
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
        addClickLikeHandler(themesBtn, function(e) {
            e.stopPropagation();
            playSoundSafe(sounds.tap);
            console.log('Themes clicked');
        });
    }
    
    // Help button
    var helpBtn = document.querySelector('.help-btn');
    if (helpBtn) {
        addClickLikeHandler(helpBtn, function(e) {
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

// Xử lý nút tiếp tục trong khảo sát
function nextQuestion() {
    var currentQuestion = document.getElementById('question-1').style.display !== 'none' ? 1 : 2;
    
    if (currentQuestion === 1) {
        // Validate câu hỏi 1
        var q1 = document.querySelector('input[name="q1"]:checked');
        if (!q1) {
            showFlashMessage('flash-message');
            return;
        }
        // Chuyển sang câu hỏi 2
        showQuestion(2);
    } else {
        // Validate câu hỏi 2
        var q2 = document.querySelector('input[name="q2"]:checked');
        if (!q2) {
            showFlashMessage('flash-message');
            return;
        }
        // Chuyển sang màn giới thiệu
        showScreen('intro-screen');
    }
}

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

// ============================================
// GACHA ANIMATION - Random Map Selection (ĐÃ BỎ - KHÔNG DÙNG NỮA)
// ============================================
// Giờ game sẽ vào chơi trực tiếp khi bấm "Bắt đầu", không random map nữa

/*
var gachaState = {
    isSpinning: false,
    selectedMapId: null
};

// Hiển thị màn hình gacha và bắt đầu animation
function showGachaAnimation() {
    showScreen('gacha-screen');
    
    // Tắt nhạc menu theme để nghe rõ wheel sound
    sounds.menuTheme.pause();
    
    // Tạo slot items
    renderSlotItems();
    
    // Bắt đầu spin sau 500ms
    setTimeout(function() {
        startGachaSpin();
    }, 500);
}
*/

/*
// Render các map items vào slot
function renderSlotItems() {
    var slotContent = document.getElementById('slot-content');
    if (!slotContent) return;
    
    slotContent.innerHTML = '';
    
    // Tạo nhiều lần lặp để có hiệu ứng xoay dài (3 vòng)
    var loops = 3;
    for (var loop = 0; loop < loops; loop++) {
        MAPS_CONFIG.forEach(function(map, index) {
            var slotItem = document.createElement('div');
            slotItem.className = 'slot-item';
            slotItem.setAttribute('data-map-id', map.id);
            
            // Tạo mới image element và LUÔN set src
            var img = document.createElement('img');
            img.src = map.image; // QUAN TRỌNG: Set src từ MAPS_CONFIG
            img.alt = map.name;
            
            // Nếu đã có cached image thì dùng để tránh load lại
            if (imagesLoaded && loadedImages.map && loadedImages.map[index]) {
                // Copy src từ cached image
                img.src = loadedImages.map[index].src;
            }
            
            slotItem.appendChild(img);
            slotContent.appendChild(slotItem);
        });
    }
}

// Bắt đầu animation quay gacha
function startGachaSpin() {
    if (gachaState.isSpinning) return;
    
    gachaState.isSpinning = true;
    
    var slotContent = document.getElementById('slot-content');
    
    // Random chọn map
    var randomIndex = Math.floor(Math.random() * MAPS_CONFIG.length);
    gachaState.selectedMapId = MAPS_CONFIG[randomIndex].id;
    
    sounds.wheel.play();
    
    // Tính toán vị trí cuối cùng ngay từ đầu
    var selectedIndex = MAPS_CONFIG.findIndex(function(m) {
        return m.id === gachaState.selectedMapId;
    });
    var targetIndex = MAPS_CONFIG.length * 2 + selectedIndex; // Vòng 3 + vị trí
    var itemHeight = 220;
    
    // Tính khoảng cách cần scroll (scroll nhiều vòng để có hiệu ứng đẹp)
    var totalDistance = targetIndex * itemHeight;
    
    // Animation quay mượt với easing function tùy chỉnh
    animateGachaSpin(slotContent, totalDistance, GACHA_CONFIG.SPIN_DURATION);
}

// Easing function: chậm → nhanh → chậm (ease-in-out)
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Animation gacha với easing mượt mà
function animateGachaSpin(element, targetDistance, duration) {
    var startTime = Date.now();
    var startPosition = 0;
    
    function animate() {
        var currentTime = Date.now();
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1); // 0 → 1
        
        // Áp dụng easing function
        var easedProgress = easeInOutCubic(progress);
        
        // Tính vị trí hiện tại
        var currentPosition = startPosition - (targetDistance * easedProgress);
        
        // Cập nhật transform
        element.style.transform = 'translateY(' + currentPosition + 'px)';
        
        // Tiếp tục animation nếu chưa xong
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation xong, gọi stopGachaSpin
            stopGachaSpin();
        }
    }
    
    // Bắt đầu animation
    animate();
}

// Dừng animation và hiển thị kết quả
function stopGachaSpin() {
    var slotContent = document.getElementById('slot-content');
    var resultText = document.getElementById('gacha-result');
    
    // Dừng âm thanh wheel
    sounds.wheel.pause();
    sounds.wheel.currentTime = 0;
    
    // Tính vị trí cuối cùng để hiển thị map đã chọn ở giữa chính xác
    var selectedMap = MAPS_CONFIG.find(function(m) {
        return m.id === gachaState.selectedMapId;
    });
    
    var itemHeight = 220;
    var selectedIndex = MAPS_CONFIG.findIndex(function(m) {
        return m.id === gachaState.selectedMapId;
    });
    
    // Vị trí ở vòng thứ 2 (middle loop) + center offset
    var targetIndex = MAPS_CONFIG.length + selectedIndex;
    var finalOffset = -(targetIndex * itemHeight) + 40; // +40 để center chính xác
    
    // Smooth transition nhẹ để điều chỉnh vị trí cuối (bounce effect)
    var transitionDuration = GACHA_CONFIG.STOP_TRANSITION_DURATION / 1000;
    slotContent.style.transition = 'transform ' + transitionDuration + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Ease-out-back (có bounce nhẹ)
    slotContent.style.transform = 'translateY(' + finalOffset + 'px)';
    
    // Phát âm thanh kết quả ngay lập tức
    playSoundSafe(sounds.touchRight);
    
    // Hiển thị tên map sau một chút
    setTimeout(function() {
        resultText.classList.add('show-result');
        resultText.innerHTML = `
        <p>🌏 Hành trình mới bắt đầu tại <b>${selectedMap.name}</b>!<br>Sẵn sàng bắt máy bay VietJet chưa? ✈️</p>
      `;
              
        gachaState.isSpinning = false;
        
        // Chuyển sang game sau thời gian delay
        setTimeout(function() {
            selectMap(gachaState.selectedMapId);
        }, GACHA_CONFIG.GO_TO_GAME_DELAY);
    }, 2000); // 500ms để animation bounce xong
}
*/

// ============================================
// OLD MAP CAROUSEL CODE (COMMENTED OUT - KHÔNG DÙNG NỮA)
// ============================================
// Map carousel functions đã được thay thế bởi Gacha Animation
/*
function updateMapSlider() { ... }
function updateCarouselButtons() { ... }
function slideMapPrev() { ... }
function slideMapNext() { ... }
function initCarouselSwipe() { ... }
... (tất cả carousel code đã bị xóa)
*/

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
            
            // Dừng nhạc menu theme (tôn trọng trạng thái nhạc)
            sounds.menuTheme.pause();
            sounds.menuTheme.currentTime = 0;
            
            // Bắt đầu game luôn (bỏ cut-in animation)
            initGame();
            
            // Phát nhạc nền game nếu không mute nhạc
            playSoundSafe(sounds.bgMusic);
            
            clearInterval(countdownInterval);
            
            // Reset về 3 cho lần sau (sau khi overlay đã ẩn)
            setTimeout(function() {
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
    gameState.totalPlanes = CAMPAIGN_SETTINGS.totalVietjetPlanes;
    gameState.maxVietjet = CAMPAIGN_SETTINGS.totalVietjetPlanes;

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

    // Tính chiều cao header động
    var header = document.querySelector('.game-header');
    gameState.headerHeight = header ? header.offsetHeight : 80;

    // Bước 1: Lấy kích thước viewport thực tế
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    
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
    // Dùng MAX để fill full màn hình (có thể crop một chút nhưng không có khoảng trống)
    var scaleX = viewportWidth / gameState.virtualWidth;
    var scaleY = viewportHeight / gameState.virtualHeight;
    var scale = Math.max(scaleX, scaleY);
    
    // Bước 4: Set canvas buffer size = viewport × DPR (cho sắc nét)
    gameState.canvas.width = viewportWidth * dpr;
    gameState.canvas.height = viewportHeight * dpr;
    
    // Bước 5: Set canvas CSS size = viewport (phủ full màn)
    gameState.canvas.style.width = viewportWidth + 'px';
    gameState.canvas.style.height = viewportHeight + 'px';
    
    // Bước 6: Scale context = scale × DPR
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
        return;
    }
    
    // QUAN TRỌNG: preventDefault() PHẢI được gọi để tránh double-tap zoom trên Android cũ
    try {
        e.preventDefault();
    } catch (err) {
        // preventDefault failed
    }
    
    var rect = gameState.canvas.getBoundingClientRect();
    // Screen coordinates
    var screenX = touch.clientX - rect.left;
    var screenY = touch.clientY - rect.top;
    
    // Convert screen coords → virtual coords
    var virtualX = screenX / gameState.scale;
    var virtualY = screenY / gameState.scale;
    
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
                gameState.timeLeft += CAMPAIGN_SETTINGS.timeBonus;
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
                if (gameState.caughtPlanes >= CAMPAIGN_SETTINGS.requiredPlanes) {
                    endGame(true); // Thắng nếu đủ số máy bay yêu cầu
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
    bonusText.textContent = '+' + CAMPAIGN_SETTINGS.timeBonus + 's';

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
    // Thắng ngay khi bắt được đủ số máy bay yêu cầu
    if (gameState.caughtPlanes >= CAMPAIGN_SETTINGS.requiredPlanes) {
        endGame(true);
        return;
    }

    if (gameState.chances <= 0) {
        // Thua khi hết mạng
        endGame(false);
    } else if (gameState.vietjetSpawned >= gameState.maxVietjet) {
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
    var speed = baseSpeed * CAMPAIGN_SETTINGS.speedMultiplier;

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
    
    // Vẫn vẽ game khi pause, nhưng không cập nhật logic

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

        // Update position (chỉ khi không pause)
        if (!isGamePaused) {
            plane.x += plane.vx;
            plane.y += plane.vy;
        }

        // Update rotation cho player planes (chỉ khi không pause)
        if (!isGamePaused && (plane.type === 'player' || plane.type === 'horizontal' || plane.type === 'vertical')) {
            plane.rotationTime += plane.rotationSpeed;
            // Dao động từ -0.15 đến +0.15 radian (~-8° đến +8°)
            plane.rotationOffset = Math.sin(plane.rotationTime) * 0.15;
        }

        // Remove if out of bounds (chỉ khi không pause)
        if (!isGamePaused) {
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
    if (gameState.ctx) {
        gameState.ctx.clearRect(0, 0, gameState.virtualWidth, gameState.virtualHeight);
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
    Object.keys(sounds).forEach(function(key) {
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
            (function(btn){
                addClickLikeHandler(btn, function(e) {
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
            (function(btn){
                addClickLikeHandler(btn, function(e) {
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
    
    el.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (!handled) {
            handled = true;
            handler(e);
            setTimeout(function() { handled = false; }, 500);
        }
    }, false);
    
    // LUÔN thêm click event (quan trọng cho tất cả thiết bị)
    el.addEventListener('click', function(e) {
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
    //Check devicePixelRatio || tuyết đối không xoá nhé
    // alert('devicePixelRatio: ' + window.devicePixelRatio);
    console.log('devicePixelRatio: ', window.devicePixelRatio);
    
    // Gọi API GET tới https://jsonplaceholder.typicode.com/todos/1 
    callAPI({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        onSuccess: function(response) {
            console.log('Kết quả GET:', response);
        },
        onError: function(error) {
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
    // 1. Setup Audio Unlock Overlay
    var audioUnlock = document.getElementById('audio-unlock');
    if (audioUnlock) {
        addClickLikeHandler(audioUnlock, unlockAudio);
    }
    
    // 2. Setup Splash Button (TAP TO START)
    var splashButton = document.querySelector('.splash-button');
    if (splashButton) {
        addClickLikeHandler(splashButton, function(e) {
            playSoundSafe(sounds.tap);
            showSurvey();
        });
    }
    
    // 3. Setup Survey Continue Button (gộp chung)
    var surveyContinueBtn = document.getElementById('survey-continue-btn');
    if (surveyContinueBtn) {
        addClickLikeHandler(surveyContinueBtn, function(e) {
            playSoundSafe(sounds.tap);
            nextQuestion();
        });
    }
    
    // 4. Setup Help Button
    var helpButton = document.getElementById('help-button');
    if (helpButton) {
        addClickLikeHandler(helpButton, function(e) {
            playSoundSafe(sounds.tap);
            showRulesModal();
        });
    }
    
    // 5. Setup Start Game Button
    var startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        addClickLikeHandler(startGameBtn, function(e) {
            playSoundSafe(sounds.tap);
            // Random map nhưng không hiện gacha animation
            var randomIndex = Math.floor(Math.random() * MAPS_CONFIG.length);
            var randomMapId = MAPS_CONFIG[randomIndex].id;
            
            // Lưu map hiện tại để dùng khi restart
            currentMap = randomMapId;
            
            selectMap(randomMapId);
        });
    }
    
    // 6. Setup Settings Toggle Button
    var settingsToggle = document.getElementById('settings-toggle');
    if (settingsToggle) {
        addClickLikeHandler(settingsToggle, function(e) {
            playSoundSafe(sounds.tap);
            showSettingsPopup();
        });
    }
    
    // 7. Setup Settings Popup Events
    setupSettingsPopupEvents();
    
    // 6. Setup Win Continue Button
    var winContinueBtn = document.getElementById('win-continue-btn');
    if (winContinueBtn) {
        addClickLikeHandler(winContinueBtn, function(e) {
            playSoundSafe(sounds.tap);
            showRating();
        });
    }
    
    // 8. Setup Lose Continue Button
    var loseContinueBtn = document.getElementById('lose-continue-btn');
    if (loseContinueBtn) {
        addClickLikeHandler(loseContinueBtn, function(e) {
            playSoundSafe(sounds.tap);
            showRating();
        });
    }
    
    // 9. Setup Restart Button
    var restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        addClickLikeHandler(restartBtn, function(e) {
            playSoundSafe(sounds.tap);
            restartGame();
        });
    }
    
    // 10. Setup Modal Close Button
    var modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        addClickLikeHandler(modalCloseBtn, closeRulesModal);
    }
    
    // 11. Setup Modal Overlay
    var modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        addClickLikeHandler(modalOverlay, closeRulesModal);
    }
    
    // 12. Setup Modal OK Button
    var modalOkBtn = document.getElementById('modal-ok-btn');
    if (modalOkBtn) {
        addClickLikeHandler(modalOkBtn, function(e) {
            playSoundSafe(sounds.tap);
            closeRulesModal();
        });
    }
    
    // NOTE: Đã xóa setup cho map carousel (không dùng nữa - thay bằng gacha)
    // Gacha animation tự động chạy khi gọi showGachaAnimation()
    
    // Setup pause popup buttons
    setupPausePopupButtons();
    
    // Setup rating stars
    var stars = document.querySelectorAll('.star');
    
    // Chrome 44: Dùng for loop thay vì forEach
    if (stars.length > 0) {
        for (var i = 0; i < stars.length; i++) {
            (function(star, index) {
                var value = parseInt(star.getAttribute('data-value'));
                addClickLikeHandler(star, function(e) {
                    playSoundSafe(sounds.tap);
                    rateStar(value);
                });
            })(stars[i], i);
        }
    }
    
    // Setup specific buttons với ID
    var buttonHandlers = {
        'help-button': showRulesModal,
        // 'start-game-btn': đã setup riêng ở trên - không dùng gacha nữa
        'win-continue-btn': showRating,
        'lose-continue-btn': showRating,
        'restart-btn': restartGame,
        'modal-close-btn': closeRulesModal,
        'modal-ok-btn': closeRulesModal,
        'send-feedback-btn': handleSendFeedback,
        'rating-close-btn': function() {
            playSoundSafe(sounds.tap);
            showWelcome();
        },
        'btn-pause': function() {
            playSoundSafe(sounds.tap);
            showPausePopup();
        },
        'pause-close': function() {
            playSoundSafe(sounds.tap);
            hidePausePopup();
        },
        'pause-resume-btn': function() {
            playSoundSafe(sounds.tap);
            hidePausePopup();
        },
        'pause-home-btn': function() {
            playSoundSafe(sounds.tap);
            hidePausePopup();
            showWelcome();
        },
        'pause-restart-btn': function() {
            playSoundSafe(sounds.tap);
            hidePausePopup();
            restartGame();
        },
        'lose-close-btn': function() {
            playSoundSafe(sounds.tap);
            showWelcome();
        },
        'lose-restart-btn': function() {
            playSoundSafe(sounds.tap);
            restartGame();
        },
        'lose-continue-btn': function() {
            playSoundSafe(sounds.tap);
            showWelcome();
        }
    };
    
    Object.keys(buttonHandlers).forEach(function(btnId) {
        var btn = document.getElementById(btnId);
        if (btn) {
            addClickLikeHandler(btn, function(e) {
                playSoundSafe(sounds.tap);
                buttonHandlers[btnId]();
            });
        }
    });
    
    // Cập nhật UI âm thanh/nhạc lúc khởi tạo
    updateAudioButtonsUI();

    // Setup modal overlay
    var modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        addClickLikeHandler(modalOverlay, function(e) {
            closeRulesModal();
        });
    }
}

// Initialize game when page loads
window.addEventListener('load', function () {
    // Đợi một chút để đảm bảo DOM đã render hoàn toàn (quan trọng cho Android cũ)
    setTimeout(function() {
        preloadImages();
        showScreen('welcome-screen');
        setupAllEventHandlers();
    }, 100);
});
