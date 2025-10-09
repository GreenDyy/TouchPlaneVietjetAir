// ⚙️ GAME_CONFIG - Dev Configuration (Technical Settings)
// KHÔNG ĐƯỢC SỬA BỪA - Ảnh hưởng đến game mechanics
var GAME_CONFIG = {
	// Virtual Resolution - Độ phân giải ảo cố định
	VIRTUAL_WIDTH: 1280,     // Chiều rộng ảo chuẩn
	VIRTUAL_HEIGHT: 720,     // Chiều cao ảo chuẩn (16:9 ratio)

	// Performance - Hiệu suất
	TARGET_FPS: 60,          // FPS mục tiêu (24 = mượt + tiết kiệm pin)
	// Giới hạn số object trên màn hình (cho thiết bị yếu)
	MAX_OBJECTS_ON_SCREEN: 4,

	// Debug
	SHOW_HITBOX: false,       // Bật/tắt hiển thị vòng tròn hitbox (true = hiện, false = ẩn)

	// Kích thước máy bay
	PLANE_SIZE: 50,          // Kích thước cơ bản của máy bay (px)
	PLANE_SIZE_MULTIPLIER: 2, // Hệ số nhân khi vẽ ảnh (1.5 = gấp 1.5 lần)

	// Tốc độ bay của máy bay
	SPEED_DEFAULT: 1,        // Tốc độ mặc định
	SPEED_RANGE: 1,          // Khoản sacle tốc độ ra

	// Máy bay siêu nhanh (Fast Planes)
	FAST_PLANE_CHANCE: 0.2,  // 20% cơ hội xuất hiện máy bay siêu nhanh
	SPEED_FAST: 1,          // Tốc độ của máy bay siêu nhanh
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
	},


};

// 🎮 CAMPAIGN_SETTINGS - Campaign Configuration (Business Settings)
// ADMIN CÓ THỂ THAY ĐỔI - Theo từng campaign/event
var CAMPAIGN_SETTINGS = {
	// Gameplay Settings
	gameTime: 300,               // Thời gian chơi (giây)
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
	winner: new Audio('assets/sounds/win_2.wav'),
	cutIn: new Audio('assets/sounds/cut_in.mp3'),
	timerBeep: new Audio('assets/sounds/timer_beep.mp3'),
	rating: new Audio('assets/sounds/rating.mp3'),
	tap: new Audio('assets/sounds/tap_2.mp3'),
	preparePlay: new Audio('assets/sounds/prepare_play.wav'),
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
sounds.preparePlay.volume = 0.7;

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
sounds.preparePlay.preload = 'auto';