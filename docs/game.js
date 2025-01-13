// Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Oyun değişkenleri
let app = null;
let player = null;
let world = null;
let gameState = {
    selectedClass: null,
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    exp: 0,
    expToNextLevel: 100
};

// Karakter sınıfları
const characterClasses = {
    warrior: { hp: 120, mp: 30 },
    archer: { hp: 90, mp: 40 },
    mage: { hp: 80, mp: 100 },
    priest: { hp: 90, mp: 80 },
    assassin: { hp: 85, mp: 40 },
    beastmaster: { hp: 100, mp: 60 }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sayfa yüklendi');
    
    // Karakter seçim butonlarını ayarla
    const buttons = document.querySelectorAll('.character-option');
    console.log('Bulunan karakter butonları:', buttons.length);
    
    buttons.forEach(button => {
        button.style.cursor = 'pointer';
        
        // Click event listener
        button.addEventListener('click', function(e) {
            console.log('Karakter tıklandı:', this.dataset.class);
            selectCharacter(this.dataset.class);
        });
        
        // Touch event listener (mobil için)
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
            console.log('Karaktere dokunuldu:', this.dataset.class);
            selectCharacter(this.dataset.class);
        });
    });
});

function selectCharacter(characterClass) {
    console.log('selectCharacter çağrıldı:', characterClass);
    
    // Karakter özelliklerini ayarla
    gameState = {
        ...gameState,
        selectedClass: characterClass,
        ...characterClasses[characterClass]
    };
    
    // Ekranları değiştir
    const characterSelect = document.getElementById('character-select');
    const gameScreen = document.getElementById('game-screen');
    
    if (characterSelect && gameScreen) {
        console.log('Ekranlar değiştiriliyor');
        characterSelect.style.display = 'none';
        gameScreen.style.display = 'block';
        
        // Oyunu başlat
        startGame();
    } else {
        console.error('Ekran elementleri bulunamadı!');
        console.log('characterSelect:', characterSelect);
        console.log('gameScreen:', gameScreen);
    }
}

function startGame() {
    console.log('Oyun başlatılıyor');
    
    try {
        // PIXI uygulamasını oluştur
        app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1099bb,
            antialias: true,
            resolution: window.devicePixelRatio || 1
        });
        
        console.log('PIXI uygulaması oluşturuldu');
        
        // Canvas'ı ekle
        const gameScreen = document.getElementById('game-screen');
        gameScreen.appendChild(app.view);
        console.log('Canvas eklendi');
        
        // Oyun dünyasını oluştur
        createWorld();
        setupControls();
        
        // Animasyon döngüsünü başlat
        app.ticker.add(gameLoop);
        
        console.log('Oyun başlatıldı');
    } catch (error) {
        console.error('Oyun başlatılırken hata:', error);
    }
}

function createWorld() {
    // Dünya container'ı
    world = new PIXI.Container();
    app.stage.addChild(world);
    
    // Zemin
    const ground = new PIXI.Graphics();
    ground.beginFill(0x408040);
    ground.drawRect(-2000, -2000, 4000, 4000);
    ground.endFill();
    world.addChild(ground);
    
    // Oyuncu
    player = new PIXI.Graphics();
    player.beginFill(0xFFFF00);
    player.drawRect(-32, -32, 64, 64);
    player.endFill();
    world.addChild(player);
    
    // Kamera pozisyonu
    world.position.set(app.screen.width / 2, app.screen.height / 2);
}

function setupControls() {
    // Joystick
    const joystick = nipplejs.create({
        zone: document.getElementById('joystick-area'),
        mode: 'static',
        position: { left: '50%', bottom: '100px' },
        color: 'white',
        size: 120
    });
    
    joystick.on('move', (evt, data) => {
        if (!player) return;
        
        const speed = 5;
        const angle = data.angle.radian;
        const force = Math.min(data.force, 1);
        
        player.x += Math.cos(angle) * speed * force;
        player.y += Math.sin(angle) * speed * force;
        player.rotation = angle;
    });
    
    // Skill butonları
    const buttons = ['attack', 'skill1', 'skill2', 'skill3'];
    buttons.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.onclick = () => useSkill(id);
        }
    });
}

function useSkill(skillId) {
    if (!player || !world) return;
    
    const effect = new PIXI.Graphics();
    effect.lineStyle(2, 0xFFFFFF);
    effect.beginFill(0xFFFF00, 0.5);
    effect.drawCircle(0, 0, 32);
    effect.endFill();
    effect.position.copyFrom(player.position);
    world.addChild(effect);
    
    gsap.to(effect.scale, {
        x: 3,
        y: 3,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => world.removeChild(effect)
    });
}

function gameLoop(delta) {
    if (!player || !world) return;
    
    // Kamera takibi
    const targetX = app.screen.width / 2 - player.x;
    const targetY = app.screen.height / 2 - player.y;
    
    world.position.x += (targetX - world.position.x) * 0.1;
    world.position.y += (targetY - world.position.y) * 0.1;
    
    // HUD güncelle
    updateHUD();
}

function updateHUD() {
    const elements = {
        level: document.getElementById('level'),
        hp: document.getElementById('hp'),
        mp: document.getElementById('mp'),
        exp: document.getElementById('exp'),
        hpBar: document.getElementById('hp-bar'),
        mpBar: document.getElementById('mp-bar'),
        expBar: document.getElementById('exp-bar')
    };
    
    if (elements.level) elements.level.textContent = gameState.level;
    if (elements.hp) elements.hp.textContent = `${gameState.hp}/${gameState.maxHp}`;
    if (elements.mp) elements.mp.textContent = `${gameState.mp}/${gameState.maxMp}`;
    if (elements.exp) elements.exp.textContent = `${gameState.exp}/${gameState.expToNextLevel}`;
    
    if (elements.hpBar) elements.hpBar.style.width = `${(gameState.hp / gameState.maxHp) * 100}%`;
    if (elements.mpBar) elements.mpBar.style.width = `${(gameState.mp / gameState.maxMp) * 100}%`;
    if (elements.expBar) elements.expBar.style.width = `${(gameState.exp / gameState.expToNextLevel) * 100}%`;
}

// Pencere boyutu değiştiğinde
window.addEventListener('resize', () => {
    if (app) {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    }
});
