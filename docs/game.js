// Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Three.js değişkenleri
let scene, camera, renderer;
let player, enemies = [];
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// Oyun durumu
const gameState = {
    selectedClass: null,
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    exp: 0,
    expToNextLevel: 100,
    inventory: []
};

// Karakter sınıfları ve özellikleri
const characterClasses = {
    warrior: {
        hp: 120,
        mp: 30,
        strength: 15,
        defense: 10,
        speed: 8
    },
    archer: {
        hp: 90,
        mp: 40,
        strength: 12,
        defense: 6,
        speed: 12
    },
    mage: {
        hp: 80,
        mp: 100,
        strength: 8,
        defense: 4,
        speed: 9
    },
    priest: {
        hp: 90,
        mp: 80,
        strength: 6,
        defense: 7,
        speed: 8
    },
    assassin: {
        hp: 85,
        mp: 40,
        strength: 14,
        defense: 5,
        speed: 14
    },
    beastmaster: {
        hp: 100,
        mp: 60,
        strength: 10,
        defense: 8,
        speed: 10
    }
};

// Karakter seçimi
document.querySelectorAll('.character-option').forEach(option => {
    option.addEventListener('click', () => {
        const characterClass = option.dataset.class;
        selectCharacter(characterClass);
    });
});

function selectCharacter(characterClass) {
    gameState.selectedClass = characterClass;
    const stats = characterClasses[characterClass];
    gameState.maxHp = stats.hp;
    gameState.hp = stats.hp;
    gameState.maxMp = stats.mp;
    gameState.mp = stats.mp;
    
    document.getElementById('character-select').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    initGame();
}

// Oyun başlatma
function initGame() {
    initThreeJS();
    createWorld();
    initControls();
    animate();
    updateHUD();
}

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    
    // Işıklandırma
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 20, 10);
    scene.add(directionalLight);
}

function createWorld() {
    // Zemin
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x404040 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Oyuncu
    const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 1;
    scene.add(player);
    
    // Kamera pozisyonu
    camera.position.set(0, 2, 5);
    camera.lookAt(player.position);
}

function initControls() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);
}

function onKeyDown(event) {
    switch(event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
    }
}

function onKeyUp(event) {
    switch(event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}

function onMouseMove(event) {
    if (document.pointerLockElement === document.body) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        player.rotation.y -= movementX * 0.002;
        camera.position.x = player.position.x + Math.sin(player.rotation.y) * 5;
        camera.position.z = player.position.z + Math.cos(player.rotation.y) * 5;
        camera.lookAt(player.position);
    }
}

function onMouseClick() {
    if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    
    velocity.x = 0;
    velocity.z = 0;
    
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    
    const speed = 5;
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
    
    player.position.x += velocity.x;
    player.position.z += velocity.z;
    
    camera.position.x = player.position.x + Math.sin(player.rotation.y) * 5;
    camera.position.z = player.position.z + Math.cos(player.rotation.y) * 5;
    camera.lookAt(player.position);
    
    renderer.render(scene, camera);
    prevTime = time;
}

function updateHUD() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('hp').textContent = `${gameState.hp}/${gameState.maxHp}`;
    document.getElementById('mp').textContent = `${gameState.mp}/${gameState.maxMp}`;
    document.getElementById('exp').textContent = `${gameState.exp}/${gameState.expToNextLevel}`;
    
    document.getElementById('hp-bar').style.width = `${(gameState.hp / gameState.maxHp) * 100}%`;
    document.getElementById('mp-bar').style.width = `${(gameState.mp / gameState.maxMp) * 100}%`;
    document.getElementById('exp-bar').style.width = `${(gameState.exp / gameState.expToNextLevel) * 100}%`;
}

// Pencere boyutu değiştiğinde
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
