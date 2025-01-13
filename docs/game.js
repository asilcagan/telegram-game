const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Karakter sınıfları ve özellikleri
const CHARACTER_CLASSES = {
    warrior: {
        name: 'Warrior',
        baseStats: {
            hp: 150,
            mp: 50,
            str: 12,
            dex: 8,
            int: 5,
            vit: 10
        },
        skills: ['Slash', 'Defensive Stance', 'Charge']
    },
    archer: {
        name: 'Archer',
        baseStats: {
            hp: 100,
            mp: 70,
            str: 8,
            dex: 12,
            int: 7,
            vit: 8
        },
        skills: ['Quick Shot', 'Multi Arrow', 'Dodge']
    },
    mage: {
        name: 'Mage',
        baseStats: {
            hp: 80,
            mp: 150,
            str: 4,
            dex: 6,
            int: 15,
            vit: 6
        },
        skills: ['Fireball', 'Ice Bolt', 'Teleport']
    },
    priest: {
        name: 'Priest',
        baseStats: {
            hp: 90,
            mp: 120,
            str: 6,
            dex: 7,
            int: 12,
            vit: 8
        },
        skills: ['Heal', 'Holy Light', 'Blessing']
    },
    assassin: {
        name: 'Assassin',
        baseStats: {
            hp: 95,
            mp: 80,
            str: 9,
            dex: 14,
            int: 6,
            vit: 7
        },
        skills: ['Backstab', 'Stealth', 'Poison']
    },
    beastmaster: {
        name: 'Beastmaster',
        baseStats: {
            hp: 110,
            mp: 90,
            str: 10,
            dex: 9,
            int: 8,
            vit: 9
        },
        skills: ['Summon Beast', 'Beast Fury', 'Nature\'s Call']
    }
};

// Item sınıfları
const ITEM_CLASSES = {
    A: { name: 'Normal', color: '#ffffff', dropRate: 0.50 },
    B: { name: 'Magic', color: '#00ff00', dropRate: 0.30 },
    C: { name: 'Rare', color: '#0000ff', dropRate: 0.15 },
    D: { name: 'Unique', color: '#ff00ff', dropRate: 0.04 },
    E: { name: 'God', color: '#ff0000', dropRate: 0.01 }
};

// Harita bilgileri
const MAPS = {
    training: {
        name: 'Training Ground',
        levelRange: [1, 30],
        monsters: ['Wolf', 'Boar', 'Spider'],
        itemClasses: ['A'],
        dropRate: 1.0
    },
    armia: {
        name: 'Armia',
        levelRange: [30, 80],
        monsters: ['Orc', 'Goblin', 'Troll'],
        itemClasses: ['A', 'B'],
        dropRate: 0.8
    },
    nippleheim: {
        name: 'Nippleheim',
        levelRange: [80, 130],
        monsters: ['Ice Wolf', 'Frost Giant', 'Snow Beast'],
        itemClasses: ['C'],
        dropRate: 0.6
    },
    desert: {
        name: 'Desert',
        levelRange: [130, 180],
        monsters: ['Sand Worm', 'Desert Drake', 'Mummy'],
        itemClasses: ['D'],
        dropRate: 0.4
    },
    kefra: {
        name: 'Kefra Dungeon',
        levelRange: [180, 300],
        monsters: ['Ancient Guardian', 'Dark Lord', 'Kefra'],
        itemClasses: ['E'],
        dropRate: 0.2
    }
};

class Character {
    constructor(classType) {
        this.class = CHARACTER_CLASSES[classType];
        this.level = 1;
        this.exp = 0;
        this.stats = { ...this.class.baseStats };
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            accessory1: null,
            accessory2: null
        };
        this.inventory = [];
        this.isGodClass = false;
    }

    gainExp(amount) {
        this.exp += amount;
        const expNeeded = this.getExpForNextLevel();
        
        if (this.exp >= expNeeded) {
            this.levelUp();
        }
        
        this.updateUI();
    }

    getExpForNextLevel() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    levelUp() {
        this.level++;
        this.exp = 0;
        
        // Stat artışları
        this.stats.hp += 10;
        this.stats.mp += 5;
        this.stats.str += 2;
        this.stats.dex += 2;
        this.stats.int += 2;
        this.stats.vit += 2;

        tg.showAlert(`🎉 Level Up!\nNew Level: ${this.level}\nHP: ${this.stats.hp}\nMP: ${this.stats.mp}`);
        
        // 300 levelde God Class dönüşümü kontrolü
        if (this.level === 300) {
            this.checkGodClassEligibility();
        }
    }

    checkGodClassEligibility() {
        // God Class için gerekli materyaller kontrolü
        const hasRequiredItems = this.inventory.some(item => item.name === 'God Stone');
        
        if (hasRequiredItems) {
            tg.showConfirm('You can become a God Class! Would you like to transform?', (confirmed) => {
                if (confirmed) {
                    this.transformToGodClass();
                }
            });
        }
    }

    transformToGodClass() {
        this.isGodClass = true;
        this.level = 1;
        this.exp = 0;
        
        // God Class stat bonusları
        Object.keys(this.stats).forEach(stat => {
            this.stats[stat] = Math.floor(this.stats[stat] * 1.5);
        });
        
        tg.showAlert('🌟 Transformed to God Class!\nAll stats increased by 50%');
        this.updateUI();
    }

    updateUI() {
        // Karakter bilgilerini güncelle
        document.getElementById('character-level').textContent = `Lvl ${this.level}`;
        document.getElementById('character-name').textContent = this.class.name;
        
        // Stat barlarını güncelle
        const hpPercent = (this.stats.hp / (this.class.baseStats.hp * this.level)) * 100;
        const mpPercent = (this.stats.mp / (this.class.baseStats.mp * this.level)) * 100;
        const expPercent = (this.exp / this.getExpForNextLevel()) * 100;
        
        document.querySelector('.hp .stat-fill').style.width = `${hpPercent}%`;
        document.querySelector('.mp .stat-fill').style.width = `${mpPercent}%`;
        document.querySelector('.exp .stat-fill').style.width = `${expPercent}%`;
        
        document.querySelector('.hp .stat-text').textContent = `HP: ${this.stats.hp}/${this.class.baseStats.hp * this.level}`;
        document.querySelector('.mp .stat-text').textContent = `MP: ${this.stats.mp}/${this.class.baseStats.mp * this.level}`;
        document.querySelector('.exp .stat-text').textContent = `EXP: ${this.exp}/${this.getExpForNextLevel()}`;
    }
}

class Item {
    constructor(name, type, itemClass, stats) {
        this.name = name;
        this.type = type;
        this.itemClass = itemClass;
        this.stats = stats;
        this.enhancement = 0;
        this.isAncient = false;
    }

    enhance(stone) {
        if (this.enhancement >= 11) {
            tg.showAlert('This item is already at maximum enhancement!');
            return false;
        }

        let successRate;
        if (this.enhancement < 6) {
            // Sky Stone kullanımı
            if (stone !== 'Sky Stone') {
                tg.showAlert('You need a Sky Stone for +0 to +6 enhancement!');
                return false;
            }
            successRate = 100 - (this.enhancement * 10);
        } else if (this.enhancement < 9) {
            // Fate Stone kullanımı
            if (stone !== 'Fate Stone') {
                tg.showAlert('You need a Fate Stone for +6 to +9 enhancement!');
                return false;
            }
            successRate = 40 - ((this.enhancement - 6) * 10);
        } else {
            // +10 için Ancient gerekli
            if (!this.isAncient) {
                tg.showAlert('Item needs to be Ancient for +10 enhancement!');
                return false;
            }
            successRate = 10;
        }

        const roll = Math.random() * 100;
        if (roll <= successRate) {
            this.enhancement++;
            tg.showAlert(`Enhancement Success! ${this.name} is now +${this.enhancement}`);
            return true;
        } else {
            tg.showAlert('Enhancement Failed!');
            return false;
        }
    }

    makeAncient(ancientStone) {
        if (this.isAncient) {
            tg.showAlert('This item is already Ancient!');
            return false;
        }

        if (ancientStone) {
            this.isAncient = true;
            this.name = `Ancient ${this.name}`;
            tg.showAlert(`${this.name} has become Ancient!`);
            return true;
        }

        tg.showAlert('You need an Ancient Stone!');
        return false;
    }
}

// Oyun başlangıcı
document.addEventListener('DOMContentLoaded', () => {
    let currentCharacter = null;

    // Karakter seçimi
    const characterOptions = document.querySelectorAll('.character-option');
    characterOptions.forEach(option => {
        option.addEventListener('click', () => {
            const classType = option.dataset.class;
            currentCharacter = new Character(classType);
            
            document.getElementById('character-select').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
            
            currentCharacter.updateUI();
        });
    });

    // Kontrol butonları
    document.getElementById('attack-btn').addEventListener('click', () => {
        // Saldırı mantığı
    });

    document.getElementById('skill-btn').addEventListener('click', () => {
        // Yetenek menüsü
    });

    document.getElementById('inventory-btn').addEventListener('click', () => {
        // Envanter menüsü
    });

    document.getElementById('map-btn').addEventListener('click', () => {
        // Harita menüsü
    });
});
