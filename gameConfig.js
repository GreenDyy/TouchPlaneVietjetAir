// Game configuration extracted for ES5 global usage
// DEV CONFIG (Technical)
var GAME_CONFIG = {
	VIRTUAL_WIDTH: 1280,
	VIRTUAL_HEIGHT: 720,
	SHOW_HITBOX: false,
	PLANE_SIZE: 50,
	PLANE_SIZE_MULTIPLIER: 2,
	SPEED_DEFAULT: 1,
	SPEED_RANGE: 2,
	FAST_PLANE_CHANCE: 0.2,
	SPEED_FAST: 4,
	SPEED_FAST_RANGE: 2,
	HITBOX_MULTIPLIER: 1.8,
	SPAWN_DELAY_MIN: 400,
	SPAWN_DELAY_RANGE: 400,
	SPAWN_RATE: { PLAYER: 0.5, HORIZONTAL: 0.25, VERTICAL: 0.25 }
};

// CAMPAIGN CONFIG (Business)
var CAMPAIGN_SETTINGS = {
	gameTime: 20,
	timeBonus: 2,
	speedMultiplier: 1.5,
	maxLives: 3,
	requiredPlanes: 6,
	totalVietjetPlanes: 10,
	qrCode: 'assets/qr_code_level_2.png',
	voucherLink: 'https://evoucher.vietjetair.com/Vouchers/Details?AwardCampaign=454',
	campaignId: 'vietjet-holiday-2024',
	campaignName: 'VietJet Holiday Campaign'
};

// Gacha timing config
var GACHA_CONFIG = {
	SPIN_DURATION: 5000,
	STOP_TRANSITION_DURATION: 1000,
	SOUND_DELAY: 800,
	RESULT_DISPLAY_DELAY: 1000,
	GO_TO_GAME_DELAY: 2000
};

// Maps config
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
