class SushiGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.money = 100;
        this.inventory = {};
        this.gameObjects = [];
        this.draggedObject = null;
        this.mousePos = { x: 0, y: 0 };
        this.orders = [];
        this.nextOrderId = 1;
        this.inventoryArea = { x: 0, y: 0, width: 800, height: 40 };
        this.canvasTooltip = null;
        
        // Day/Time system
        this.currentDay = 1;
        this.timeLeft = 360000; // 6 minutes in milliseconds
        this.dayDuration = 360000; // 6 minutes
        this.isPaused = false;
        this.gameOver = false;

        this.sounds = {
        wash: new Audio('/Sounds/wash.mp3'),
        peel: new Audio('/Sounds/peel.mp3'),
        chop: new Audio('/Sounds/chop.mp3'),
        cook: new Audio('/Sounds/cook.mp3'),
        };

        this.sounds.wash.loop = true;
        this.sounds.peel.loop = true;
        this.sounds.chop.loop = true;
        this.sounds.cook.loop = true;

        
        // Debug logging
        console.log('Game initialized with:');
        console.log('isPaused:', this.isPaused);
        console.log('gameOver:', this.gameOver);
        console.log('currentDay:', this.currentDay);

        function showExpensesBreakdown() {
         if (game) {
        game.showExpensesBreakdown();
     }
        }
        
        // Daily expenses
        this.dailyExpenses = {
            rent: 50,
            electricity: 15,
            gas: 10,
            water: 8,
            insurance: 12,
            supplies: 20
        };

        this.textures = {};
        this.texturesLoaded = false;

        this.createCanvasTooltip();

        this.ctx.imageSmoothingEnabled = false;
        
        this.shopItems = [
            // Fish & Seafood
            { id: 'salmon', name: '🐟 Salmon', price: 10, emoji: '🐟' },
            { id: 'tuna', name: '🐟 Tuna', price: 12, emoji: '🐟' },
            { id: 'eel', name: '🦎 Eel', price: 15, emoji: '🦎' },
            { id: 'shrimp', name: '🦐 Shrimp', price: 8, emoji: '🦐' },
            { id: 'crab', name: '🦀 Crab', price: 18, emoji: '🦀' },
            { id: 'yellowtail', name: '🐠 Yellowtail', price: 14, emoji: '🐠' },
            { id: 'mackerel', name: '🐟 Mackerel', price: 9, emoji: '🐟' },
            { id: 'sea_bass', name: '🐟 Sea Bass', price: 11, emoji: '🐟' },
            
            // Base ingredients
            { id: 'rice', name: '🍚 Rice', price: 5, emoji: '🍚' },
            { id: 'nori', name: '🟫 Nori', price: 3, emoji: '🟫' },
            { id: 'wasabi', name: '🟢 Wasabi', price: 6, emoji: '🟢' },
            { id: 'soy_sauce', name: '🟤 Soy Sauce', price: 4, emoji: '🟤' },
            { id: 'ginger', name: '🫚 Ginger', price: 5, emoji: '🫚' },
            
            // Vegetables
            { id: 'cucumber', name: '🥒 Cucumber', price: 2, emoji: '🥒' },
            { id: 'avocado', name: '🥑 Avocado', price: 4, emoji: '🥑' },
            { id: 'carrot', name: '🥕 Carrot', price: 2, emoji: '🥕' },
            { id: 'radish', name: '🔴 Radish', price: 3, emoji: '🔴' },
            { id: 'asparagus', name: '🥬 Asparagus', price: 5, emoji: '🥬' },
            { id: 'scallion', name: '🧅 Scallion', price: 2, emoji: '🧅' },
            
            // Special ingredients
            { id: 'sesame_seeds', name: '⚪ Sesame Seeds', price: 3, emoji: '⚪' },
            { id: 'tempura_batter', name: '🥄 Tempura Batter', price: 7, emoji: '🥄' },
            { id: 'cream_cheese', name: '🧀 Cream Cheese', price: 6, emoji: '🧀' },
            { id: 'spicy_mayo', name: '🌶️ Spicy Mayo', price: 5, emoji: '🌶️' },

              // Italian
            { id: 'mozzarella', name: '🧀 Mozzarella', price: 7, emoji: '🧀' },
            { id: 'tomato_sauce', name: '🍅 Tomato Sauce', price: 5, emoji: '🍅' },
            { id: 'basil', name: '🌿 Basil', price: 3, emoji: '🌿' },
            { id: 'pasta', name: '🍝 Pasta', price: 6, emoji: '🍝' },

            // Mexican
            { id: 'tortilla', name: '🌮 Tortilla', price: 4, emoji: '🌮' },
            { id: 'beef', name: '🥩 Beef', price: 12, emoji: '🥩' },
            { id: 'cheddar', name: '🧀 Cheddar', price: 7, emoji: '🧀' },
            { id: 'salsa', name: '🌶️ Salsa', price: 5, emoji: '🌶️' },

            // Indian
            { id: 'curry_sauce', name: '🍛 Curry Sauce', price: 8, emoji: '🍛' },
            { id: 'lentils', name: '🫘 Lentils', price: 5, emoji: '🫘' },
            { id: 'paneer', name: '🧀 Paneer', price: 10, emoji: '🧀' },
            { id: 'naan', name: '🥙 Naan Bread', price: 6, emoji: '🥙' },

            // French
            { id: 'butter', name: '🧈 Butter', price: 4, emoji: '🧈' },
            { id: 'egg', name: '🥚 Egg', price: 2, emoji: '🥚' },
            { id: 'milk', name: '🥛 Milk', price: 3, emoji: '🥛' },
            { id: 'flour', name: '🌾 Flour', price: 2, emoji: '🌾' }
        ];

        this.upgrades = [
            {
                id: "faster_chop",
                name: "🔪 Faster Chopping",
                description: "Reduce chop cooldown by 30%.",
                price: 200,
                maxLevel: 3,
                level: 0,
            },
            {
                id: "faster_cook",
                name: "🔥 Faster Cooking",
                description: "Reduce cooking cooldown by 30%.",
                price: 250,
                maxLevel: 3,
                level: 0,
            },
            {
                id: "better_orders",
                name: "💰 Wealthy Customers",
                description: "Orders pay 20% more.",
                price: 300,
                maxLevel: 2,
                level: 0,
            },
            {
                id: "rush_orders",
                name: "⚡ Faster Customers",
                description: "Orders appear 25% quicker.",
                price: 150,
                maxLevel: 2,
                level: 0,
            },
            ];
        
        this.recipes = {
            // Basic Nigiri
            'salmon_nigiri': {
                ingredients: ['cooked_salmon', 'cooked_rice'],
                combineTime: 2000,
                sellPrice: 25,
                name: 'Salmon Nigiri'
            },
            'tuna_nigiri': {
                ingredients: ['cooked_tuna', 'cooked_rice'],
                combineTime: 2000,
                sellPrice: 28,
                name: 'Tuna Nigiri'
            },
            'shrimp_nigiri': {
                ingredients: ['cooked_shrimp', 'cooked_rice'],
                combineTime: 2000,
                sellPrice: 22,
                name: 'Shrimp Nigiri'
            },
            'yellowtail_nigiri': {
                ingredients: ['cooked_yellowtail', 'cooked_rice'],
                combineTime: 2000,
                sellPrice: 30,
                name: 'Yellowtail Nigiri'
            },
            
            // Basic Rolls
            'tuna_roll': {
                ingredients: ['cooked_tuna', 'cooked_rice', 'nori'],
                combineTime: 3000,
                sellPrice: 30,
                name: 'Tuna Roll'
            },
            'salmon_roll': {
                ingredients: ['cooked_salmon', 'cooked_rice', 'nori'],
                combineTime: 3000,
                sellPrice: 28,
                name: 'Salmon Roll'
            },
            'california_roll': {
                ingredients: ['chopped_cucumber', 'chopped_avocado', 'cooked_rice', 'nori'],
                combineTime: 4000,
                sellPrice: 35,
                name: 'California Roll'
            },
            'dragon_roll': {
                ingredients: ['cooked_eel', 'chopped_avocado', 'cooked_rice', 'nori'],
                combineTime: 5000,
                sellPrice: 45,
                name: 'Dragon Roll'
            },
            
            // Special Rolls
            'rainbow_roll': {
                ingredients: ['cooked_salmon', 'cooked_tuna', 'chopped_avocado', 'cooked_rice', 'nori'],
                combineTime: 6000,
                sellPrice: 55,
                name: 'Rainbow Roll'
            },
            'spider_roll': {
                ingredients: ['cooked_crab', 'chopped_cucumber', 'chopped_avocado', 'cooked_rice', 'nori'],
                combineTime: 5500,
                sellPrice: 50,
                name: 'Spider Roll'
            },
            'philadelphia_roll': {
                ingredients: ['cooked_salmon', 'cream_cheese', 'chopped_cucumber', 'cooked_rice', 'nori'],
                combineTime: 4500,
                sellPrice: 42,
                name: 'Philadelphia Roll'
            },
            'boston_roll': {
                ingredients: ['cooked_shrimp', 'chopped_cucumber', 'chopped_avocado', 'cooked_rice', 'nori'],
                combineTime: 4000,
                sellPrice: 38,
                name: 'Boston Roll'
            },
            
            // Tempura Rolls
            'shrimp_tempura_roll': {
                ingredients: ['cooked_shrimp', 'tempura_batter', 'chopped_avocado', 'cooked_rice', 'nori'],
                combineTime: 5000,
                sellPrice: 48,
                name: 'Shrimp Tempura Roll'
            },
            'vegetable_tempura_roll': {
                ingredients: ['chopped_asparagus', 'chopped_carrot', 'tempura_batter', 'cooked_rice', 'nori'],
                combineTime: 4500,
                sellPrice: 35,
                name: 'Vegetable Tempura Roll'
            },
            
            // Spicy Rolls
            'spicy_tuna_roll': {
                ingredients: ['cooked_tuna', 'spicy_mayo', 'chopped_scallion', 'cooked_rice', 'nori'],
                combineTime: 4000,
                sellPrice: 40,
                name: 'Spicy Tuna Roll'
            },
            'spicy_salmon_roll': {
                ingredients: ['cooked_salmon', 'spicy_mayo', 'chopped_cucumber', 'cooked_rice', 'nori'],
                combineTime: 4000,
                sellPrice: 38,
                name: 'Spicy Salmon Roll'
            },
            
            // Chirashi & Bowls
            'chirashi_bowl': {
                ingredients: ['cooked_salmon', 'cooked_tuna', 'cooked_yellowtail', 'cooked_rice', 'chopped_radish'],
                combineTime: 4500,
                sellPrice: 65,
                name: 'Chirashi Bowl'
            },
            'poke_bowl': {
                ingredients: ['cooked_tuna', 'chopped_avocado', 'chopped_cucumber', 'cooked_rice', 'sesame_seeds'],
                combineTime: 4000,
                sellPrice: 45,
                name: 'Poke Bowl'
            },
            
            // Premium Dishes
            'omakase_platter': {
                ingredients: ['cooked_salmon', 'cooked_tuna', 'cooked_yellowtail', 'cooked_eel', 'cooked_shrimp', 'cooked_rice'],
                combineTime: 8000,
                sellPrice: 85,
                name: 'Omakase Platter'
            },
            'deluxe_sashimi': {
                ingredients: ['cooked_salmon', 'cooked_tuna', 'cooked_sea_bass', 'chopped_radish', 'wasabi', 'ginger'],
                combineTime: 6000,
                sellPrice: 75,
                name: 'Deluxe Sashimi'
            },
            'margherita_pizza': {
                ingredients: ['flour', 'tomato_sauce', 'mozzarella', 'basil'],
                combineTime: 8000,
                sellPrice: 55,
                name: 'Margherita Pizza',
                unlockDay: 5,
                process: '1. Make Dough: FLOUR → PREP\n2. Add TOMATO SAUCE + MOZZARELLA + BASIL\n3. BAKE until crispy'
            },
            'spaghetti_bolognese': {
                ingredients: ['pasta', 'tomato_sauce', 'beef'],
                combineTime: 6000,
                sellPrice: 50,
                name: 'Spaghetti Bolognese',
                unlockDay: 5,
                process: '1. COOK Pasta\n2. COOK Beef\n3. Combine with Tomato Sauce in PREP'
            },

            // --- Mexican ---
            'beef_taco': {
                ingredients: ['tortilla', 'beef', 'cheddar', 'salsa'],
                combineTime: 5000,
                sellPrice: 40,
                name: 'Beef Taco',
                unlockDay: 7,
                process: '1. COOK Beef\n2. Add Tortilla + Salsa + Cheddar in PREP'
            },
            'quesadilla': {
                ingredients: ['tortilla', 'cheddar'],
                combineTime: 4000,
                sellPrice: 30,
                name: 'Quesadilla',
                unlockDay: 7,
                process: '1. Place Tortilla + Cheddar in PREP\n2. COOK until melted'
            },

            // --- Indian ---
            'chicken_curry': {
                ingredients: ['curry_sauce', 'rice'],
                combineTime: 7000,
                sellPrice: 60,
                name: 'Chicken Curry',
                unlockDay: 9,
                process: '1. COOK Rice\n2. Prepare Curry Sauce\n3. Combine in PREP'
            },
            'dal_tadka': {
                ingredients: ['lentils', 'curry_sauce'],
                combineTime: 6000,
                sellPrice: 45,
                name: 'Dal Tadka',
                unlockDay: 9,
                process: '1. COOK Lentils\n2. Add Curry Sauce in PREP'
            },
            'paneer_naan': {
                ingredients: ['paneer', 'naan', 'curry_sauce'],
                combineTime: 6500,
                sellPrice: 55,
                name: 'Paneer with Naan',
                unlockDay: 9,
                process: '1. PREP Naan Bread\n2. Add Paneer + Curry Sauce\n3. BAKE together'
            },

            // --- French ---
            'crepes': {
                ingredients: ['flour', 'egg', 'milk', 'butter'],
                combineTime: 5000,
                sellPrice: 35,
                name: 'French Crepes',
                unlockDay: 12,
                process: '1. Make batter: MIX Flour + Egg + Milk + Butter\n2. COOK on hot plate'
            },
            'omelette': {
                ingredients: ['egg', 'butter', 'milk'],
                combineTime: 3000,
                sellPrice: 25,
                name: 'Omelette',
                unlockDay: 12,
                process: '1. MIX eggs + milk\n2. COOK with butter until set'
            }
        };

        this.loadTextures().then(() => {
            this.setupEventListeners();
            this.createWorkstations();
            this.populateShop();
            this.startOrderGeneration();
            this.loadGame();
            this.gameLoop();
        });
    }

async loadTextures() {
    const textureFiles = ['wash', 'peel', 'chop', 'cook', 'prep', 'serve'];

    const loadPromises = textureFiles.map(fileName => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.textures[fileName] = img;
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load texture: ${fileName}.png`);
                const canvas = document.createElement('canvas');
                canvas.width = 60;
                canvas.height = 60;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = this.getWorkstationColor(fileName);
                ctx.fillRect(0, 0, 100, 60);
                this.textures[fileName] = canvas;
                resolve();
            };
            img.src = `/textures/${fileName}.png`;
        });
    });

    await Promise.all(loadPromises);
    this.texturesLoaded = true;
}
    createCanvasTooltip() {
        let tooltip = document.getElementById('canvasTooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'canvasTooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px;
                border-radius: 4px;
                font-size: 12px;
                display: none;
                z-index: 1000;
                pointer-events: none;
                max-width: 300px;
            `;
            document.body.appendChild(tooltip);
        }
        this.canvasTooltip = tooltip;
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        document.addEventListener('click', (e) => {
            const inventoryDiv = document.getElementById('inventoryItems');
            const ordersDiv = document.getElementById('ordersList');
            
            if (inventoryDiv && !inventoryDiv.contains(e.target)) {
                this.removeInventoryTooltips();
            }
            
            if (ordersDiv && !ordersDiv.contains(e.target)) {
                this.removeOrderTooltip();
            }
        });
    }

    hardResetGame() {
        localStorage.removeItem('sushiGameSave');
        localStorage.removeItem('musicEnabled');
        localStorage.removeItem('sfxEnabled');
        localStorage.removeItem('dayLength');

        this.money = 100;
        this.currentDay = 1;
        this.timeLeft = this.dayDuration;
        this.gameOver = false;
        this.isPaused = false;
        this.inventory = {};
        this.orders = [];
        this.nextOrderId = 1;
        this.gameObjects = this.gameObjects.filter(obj => obj.type === 'workstation');

        this.updateUI();
        this.updateOrdersUI();

    console.clear();
    console.log("🧹 FULL HARD RESET DONE");
    }
    

    applyUpgradeEffects() {
    // Default stats
    this.ordersPayMultiplier = 1;
    this.orderInterval = 6000; // ms default

    const chopStation = this.getWorkstation("chop");
    const cookStation = this.getWorkstation("cook");

    if (chopStation) chopStation.maxCooldown = 3000;
    if (cookStation) cookStation.maxCooldown = 4000;

    // Apply upgrades
    this.upgrades.forEach((up) => {
        if (up.id === "faster_chop" && up.level > 0 && chopStation) {
        chopStation.maxCooldown = 3000 * (1 - 0.3 * up.level);
        }
        if (up.id === "faster_cook" && up.level > 0 && cookStation) {
        cookStation.maxCooldown = 4000 * (1 - 0.3 * up.level);
        }
        if (up.id === "better_orders" && up.level > 0) {
        this.ordersPayMultiplier = 1 + 0.2 * up.level;
        }
        if (up.id === "rush_orders" && up.level > 0) {
        this.orderInterval = 6000 - 1500 * up.level;
        }
    });
    }

    getWorkstation(name) {
    return this.gameObjects.find(
        (w) => w.type === "workstation" && w.name === name
    );
    }

    buyUpgrade(upgradeId) {
    const upgrade = this.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return;

    if (this.money >= upgrade.price && upgrade.level < upgrade.maxLevel) {
        this.money -= upgrade.price;
        upgrade.level++;
        upgrade.price = Math.floor(upgrade.price * 1.5);
        this.applyUpgradeEffects();
        this.updateUI();
        this.populateShop();
        this.saveGame();
    } else {
        alert("❌ Not enough money or already max level!");
    }
    }
    createWorkstations() {
        const stations = [
            { name: 'wash', x: 50, y: 80, color: '#4fc3f7', maxCooldown: 2000 },
            { name: 'peel', x: 200, y: 80, color: '#81c784', maxCooldown: 2500 },
            { name: 'chop', x: 350, y: 80, color: '#ffb74d', maxCooldown: 3000 },
            { name: 'cook', x: 500, y: 80, color: '#e57373', maxCooldown: 4000 },
            { name: 'prep', x: 650, y: 80, color: '#9575cd', maxCooldown: 2000 },
            { name: 'serve', x: 350, y: 200, color: '#4db6ac', maxCooldown: 1000 }
        ];
        
        stations.forEach(station => {
            this.gameObjects.push({
                type: 'workstation',
                name: station.name,
                x: station.x,
                y: station.y,
                width: 85,
                height: 70,
                color: station.color,
                ingredients: [],
                cooldown: 0,
                maxCooldown: station.maxCooldown
            });
        });
    }
    
        populateShop() {
        const shopGrid = document.getElementById("shopGrid");
        if (!shopGrid) return;

        shopGrid.innerHTML = "";

        // --- Ingredient Section ---
        const ingSection = document.createElement("div");
        ingSection.style.textAlign = "center";
        ingSection.style.marginBottom = "20px";

        const ingTitle = document.createElement("h3");
        ingTitle.textContent = "🛒 INGREDIENTS";
        ingTitle.style.color = "#ffd700";
        ingTitle.style.marginBottom = "10px";
        ingSection.appendChild(ingTitle);

        const ingGrid = document.createElement("div");
        ingGrid.className = "shop-grid-inner";
        ingSection.appendChild(ingGrid);

        this.shopItems.forEach((item) => {
            const shopItem = document.createElement("div");
            shopItem.className = "shop-item";
            shopItem.innerHTML = `
            <div style="font-size: 20px;">${item.emoji}</div>
            <div style="font-size: 9px; margin: 3px 0;">${item.name}</div>
            <div class="price">$${item.price}</div>
            `;
            shopItem.onclick = () => this.buyItem(item.id, item.price);
            ingGrid.appendChild(shopItem);
        });

        shopGrid.appendChild(ingSection);

        // --- Upgrade Section ---
        const upSection = document.createElement("div");
        upSection.style.textAlign = "center";
        upSection.style.marginTop = "30px";

        const upTitle = document.createElement("h3");
        upTitle.textContent = "⚙️ UPGRADES";
        upTitle.style.color = "#4fc3f7";
        upTitle.style.marginBottom = "10px";
        upSection.appendChild(upTitle);

        const upGrid = document.createElement("div");
        upGrid.className = "shop-grid-inner";
        upSection.appendChild(upGrid);

        this.upgrades.forEach((up) => {
        const upItem = document.createElement("div");
        upItem.className = "upgrade-item";
        upItem.innerHTML = `
            <div class="upgrade-name">${up.name}</div>
            <div class="upgrade-desc">${up.description}</div>
            <div class="upgrade-level">Lvl: ${"⭐".repeat(up.level)} (${up.level}/${up.maxLevel})</div>
            <div class="price">$${up.price}</div>
        `;
        upItem.onclick = () => this.buyUpgrade(up.id);
        upGrid.appendChild(upItem);
        });

        shopGrid.appendChild(upSection);
        }

    getTotalDailyExpenses() {
        return Object.values(this.dailyExpenses).reduce((sum, expense) => sum + expense, 0);
    }
    
    updateTimeUI() {
        const timeElement = document.getElementById("timeLeft");
        if (timeElement) {
            const totalSeconds = Math.max(0, Math.floor(this.timeLeft / 1000));
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }   

        const dayElement = document.getElementById("dayCounter");
        if (dayElement) {
            dayElement.textContent = this.currentDay;
        }

        const expenseElement = document.getElementById("dailyExpenses");
        if (expenseElement) {
            expenseElement.textContent = `$${this.getTotalDailyExpenses()}`;
        }
    }

    updateTime() {
    
        
        if (!this.isPaused && !this.gameOver) {
            this.timeLeft -= 16;
            
            if (this.timeLeft <= 0) {
                console.log('Day ended!');
                this.endDay();
            }
        }
    }
    
    endDay() {
        this.isPaused = true;
        const totalExpenses = this.getTotalDailyExpenses();
        
        if (this.money >= totalExpenses) {
            this.money -= totalExpenses;
            this.currentDay++;
            this.timeLeft = this.dayDuration;
            this.showDayEndModal(totalExpenses, false);
        } else {
            this.gameOver = true;
            this.showDayEndModal(totalExpenses, true);
        }
        
        this.saveGame();
    }
    
    showStats() {
    const statsModal = document.getElementById("statsModal");
    const statsContent = document.getElementById("statsContent");

    statsContent.innerHTML = `
        <p>📅 You survived until <strong>Day ${this.currentDay}</strong></p>
        <p>💰 Final Money: <strong>$${this.money}</strong></p>
        <p>📦 Inventory Items Left: <strong>${Object.entries(this.inventory)
            .map(([item, count]) => `${item} (${count})`)
            .join(", ") || "None"}</strong></p>
        <p>📋 Orders Remaining: <strong>${this.orders.length}</strong></p>
    `;

        closeModal('dayEndModal');
        statsModal.style.display = "block";
    }
    
    showDayEndModal(expenses, isGameOver) {
        const modal = document.getElementById('dayEndModal') || this.createDayEndModal();
        const modalContent = modal.querySelector('.day-end-content');
        
        if (isGameOver) {
            modalContent.innerHTML = `
                <h2>🚨 GAME OVER 🚨</h2>
                <div class="expenses-breakdown">
                    <p><strong>Day ${this.currentDay} Expenses: $${expenses}</strong></p>
                    <p style="color: #ff4444;">💰 Your Money: $${this.money}</p>
                    <p style="color: #ff4444;">You couldn't afford the daily expenses!</p>
                </div>
                <div class="modal-buttons">
                    <button onclick="game.restartGame()" class="restart-btn">🔄 Restart Game</button>
                    <button onclick="game.showStats()" class="continue-btn">📊 View Stats</button>
                </div>
            `;
        } else {
            modalContent.innerHTML = `
                <h2>📅 End of Day ${this.currentDay - 1}</h2>
                <div class="expenses-breakdown">
                    <h3>Daily Expenses Paid:</h3>
                    <div class="expense-item">🏠 Rent: $${this.dailyExpenses.rent}</div>
                    <div class="expense-item">⚡ Electricity: $${this.dailyExpenses.electricity}</div>
                    <div class="expense-item">🔥 Gas: $${this.dailyExpenses.gas}</div>
                    <div class="expense-item">💧 Water: $${this.dailyExpenses.water}</div>
                    <div class="expense-item">🛡️ Insurance: $${this.dailyExpenses.insurance}</div>
                    <div class="expense-item">📦 Supplies: $${this.dailyExpenses.supplies}</div>
                    <hr>
                    <div class="total-expense"><strong>Total: $${expenses}</strong></div>
                </div>
                <div class="day-summary">
                    <p>💰 Money Remaining: $${this.money}</p>
                    <p>🌅 Starting Day ${this.currentDay}</p>
                    <p>💡 Tip: You need at least $${this.getTotalDailyExpenses()} each day to stay in business! So get your money up, not your funny up!!</p>
                </div>
                <div class="modal-buttons">
                    <button onclick="game.continueToNextDay()" class="continue-btn">▶️ Continue to Day ${this.currentDay}</button>
                </div>
            `;
        }
        
        modal.style.display = 'block';
    }
    
    createDayEndModal() {
        const modal = document.createElement('div');
        modal.id = 'dayEndModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content day-end-modal">
                <div class="day-end-content">
                    <!-- Content will be dynamically generated -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }
    
    continueToNextDay() {
        closeModal('dayEndModal');
        this.isPaused = false;
    }
    
    restartGame() {
        this.money = 100;
        this.currentDay = 1;
        this.timeLeft = this.dayDuration;
        this.gameOver = false;
        this.isPaused = false;
        this.inventory = {};
        this.orders = [];
        this.nextOrderId = 1;
        this.gameObjects = this.gameObjects.filter(obj => obj.type === 'workstation');
        this.updateUI();
        this.updateOrdersUI();
        closeModal('dayEndModal');
        this.saveGame();
    }

    showExpensesBreakdown() {
        const breakdown = Object.entries(this.dailyExpenses)
            .map(([key, value]) => {
                const icons = {
                    rent: '🏠',
                    electricity: '⚡',
                    gas: '🔥',
                    water: '💧',
                    insurance: '🛡️',
                    supplies: '📦'
                };
                return `${icons[key]} ${key.charAt(0).toUpperCase() + key.slice(1)}: $${value}`;
            })
            .join('\n');
        
        alert(`Daily Expenses Breakdown:\n\n${breakdown}\n\nTotal: $${this.getTotalDailyExpenses()}\n\nMake sure you earn enough each day to cover these costs!`);
    }
    
    getItemDescription(itemName) {
        const descriptions = {
            'salmon': 'Raw salmon fish - needs washing and chopping, then cooking',
            'tuna': 'Raw tuna fish - needs washing and chopping, then cooking',
            'eel': 'Raw eel - needs washing, then cooking',
            'shrimp': 'Raw shrimp - needs washing, then cooking',
            'crab': 'Raw crab - needs washing, then cooking',
            'yellowtail': 'Raw yellowtail fish - needs washing and chopping, then cooking',
            'mackerel': 'Raw mackerel fish - needs washing and chopping, then cooking',
            'sea_bass': 'Raw sea bass fish - needs washing and chopping, then cooking',

            'rice': 'Uncooked rice - needs cooking',
            'nori': 'Seaweed sheets - ready to use',
            'wasabi': 'Japanese horseradish - ready to use',
            'soy_sauce': 'Fermented soy sauce - ready to use',
            'ginger': 'Fresh ginger root - needs washing, peeling, and chopping',

            'cucumber': 'Fresh cucumber - needs washing, peeling, and chopping',
            'avocado': 'Fresh avocado - needs washing, peeling, and chopping',
            'carrot': 'Fresh carrot - needs washing, peeling, and chopping',
            'radish': 'Fresh radish - needs washing, peeling, and chopping',
            'asparagus': 'Fresh asparagus - needs washing and chopping',
            'scallion': 'Green onions - needs washing and chopping',

            'sesame_seeds': 'Toasted sesame seeds - ready to use',
            'tempura_batter': 'Light crispy batter - ready to use',
            'cream_cheese': 'Philadelphia-style cream cheese - ready to use',
            'spicy_mayo': 'Spicy mayonnaise sauce - ready to use',

            'washed_salmon': 'Clean salmon - ready for chopping',
            'washed_tuna': 'Clean tuna - ready for chopping',
            'washed_eel': 'Clean eel - ready for cooking',
            'washed_shrimp': 'Clean shrimp - ready for cooking',
            'washed_crab': 'Clean crab - ready for cooking',
            'washed_yellowtail': 'Clean yellowtail - ready for chopping',
            'washed_mackerel': 'Clean mackerel - ready for chopping',
            'washed_sea_bass': 'Clean sea bass - ready for chopping',
            'washed_cucumber': 'Clean cucumber - needs peeling',
            'washed_avocado': 'Clean avocado - needs peeling',
            'washed_carrot': 'Clean carrot - needs peeling',
            'washed_radish': 'Clean radish - needs peeling',
            'washed_ginger': 'Clean ginger - needs peeling',
            'washed_asparagus': 'Clean asparagus - ready for chopping',
            'washed_scallion': 'Clean scallions - ready for chopping',

            'peeled_cucumber': 'Peeled cucumber - ready for chopping',
            'peeled_avocado': 'Peeled avocado - ready for chopping',
            'peeled_carrot': 'Peeled carrot - ready for chopping',
            'peeled_radish': 'Peeled radish - ready for chopping',
            'peeled_ginger': 'Peeled ginger - ready for chopping',

            'chopped_salmon': 'Chopped salmon - ready for cooking',
            'chopped_tuna': 'Chopped tuna - ready for cooking',
            'chopped_yellowtail': 'Chopped yellowtail - ready for cooking',
            'chopped_mackerel': 'Chopped mackerel - ready for cooking',
            'chopped_sea_bass': 'Chopped sea bass - ready for cooking',
            'chopped_cucumber': 'Diced cucumber - ready for combining',
            'chopped_avocado': 'Diced avocado - ready for combining',
            'chopped_carrot': 'Diced carrot - ready for combining',
            'chopped_radish': 'Diced radish - ready for combining',
            'chopped_ginger': 'Minced ginger - ready for combining',
            'chopped_asparagus': 'Cut asparagus - ready for combining',
            'chopped_scallion': 'Sliced scallions - ready for combining',

            'cooked_salmon': 'Perfectly cooked salmon - ready for sushi',
            'cooked_tuna': 'Perfectly seared tuna - ready for sushi',
            'cooked_eel': 'Glazed grilled eel - ready for sushi',
            'cooked_shrimp': 'Boiled shrimp - ready for sushi',
            'cooked_crab': 'Steamed crab meat - ready for sushi',
            'cooked_yellowtail': 'Grilled yellowtail - ready for sushi',
            'cooked_mackerel': 'Grilled mackerel - ready for sushi',
            'cooked_sea_bass': 'Pan-seared sea bass - ready for sushi',
            'cooked_rice': 'Seasoned sushi rice - ready for combining'
        };
        
        return descriptions[itemName] || 'Unknown ingredient';
    }
    
getProcessingSteps(itemName) {
    const base = this.normalizeName(itemName);
    const stage = this.getIngredientStage(itemName);

    const chains = {
        salmon: ["raw","washed","chopped","cooked"],
        tuna: ["raw","washed","chopped","cooked"],
        eel: ["raw","washed","cooked"],
        shrimp: ["raw","washed","cooked"],
        crab: ["raw","washed","cooked"],
        yellowtail: ["raw","washed","chopped","cooked"],
        mackerel: ["raw","washed","chopped","cooked"],
        sea_bass: ["raw","washed","chopped","cooked"],
        rice: ["raw","cooked"],
        ginger: ["raw","washed","peeled","chopped"],
        cucumber: ["raw","washed","peeled","chopped"],
        avocado: ["raw","washed","peeled","chopped"],
        carrot: ["raw","washed","peeled","chopped"],
        radish: ["raw","washed","peeled","chopped"],
        asparagus: ["raw","washed","chopped"],
        scallion: ["raw","washed","chopped"],
        nori: ["ready"],
        wasabi: ["ready"],
        soy_sauce: ["ready"],
        sesame_seeds: ["ready"],
        tempura_batter: ["ready"],
        cream_cheese: ["ready"],
        spicy_mayo: ["ready"]
    };

    const chain = chains[base];
    if (!chain) return "Processing steps unknown";

    return chain
      .map(st => {
         if (st === stage) return `✔ ${st.toUpperCase()}`;
         return st.toUpperCase();
      })
      .join(" → ");
    }
    
    getRecipeProcess(recipeKey) {
        const processes = {
            'salmon_nigiri': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Rice: RAW → COOK\n3. PREP: Combine both ingredients',
                ingredients: 'Cooked Salmon + Cooked Rice'
            },
            'tuna_nigiri': {
                process: '1. Tuna: RAW → WASH → CHOP → COOK\n2. Rice: RAW → COOK\n3. PREP: Combine both ingredients',
                ingredients: 'Cooked Tuna + Cooked Rice'
            },
            'shrimp_nigiri': {
                process: '1. Shrimp: RAW → WASH → COOK\n2. Rice: RAW → COOK\n3. PREP: Combine both ingredients',
                ingredients: 'Cooked Shrimp + Cooked Rice'
            },
            'yellowtail_nigiri': {
                process: '1. Yellowtail: RAW → WASH → CHOP → COOK\n2. Rice: RAW → COOK\n3. PREP: Combine both ingredients',
                ingredients: 'Cooked Yellowtail + Cooked Rice'
            },

            'tuna_roll': {
                process: '1. Tuna: RAW → WASH → CHOP → COOK\n2. Rice: RAW → COOK\n3. Get Nori from shop\n4. PREP: Combine all ingredients',
                ingredients: 'Cooked Tuna + Cooked Rice + Nori'
            },
            'salmon_roll': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Rice: RAW → COOK\n3. Get Nori from shop\n4. PREP: Combine all ingredients',
                ingredients: 'Cooked Salmon + Cooked Rice + Nori'
            },
            'california_roll': {
                process: '1. Cucumber: RAW → WASH → PEEL → CHOP\n2. Avocado: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Chopped Cucumber + Chopped Avocado + Cooked Rice + Nori'
            },
            'dragon_roll': {
                process: '1. Eel: RAW → WASH → COOK\n2. Avocado: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Cooked Eel + Chopped Avocado + Cooked Rice + Nori'
            },

            'rainbow_roll': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Tuna: RAW → WASH → CHOP → COOK\n3. Avocado: RAW → WASH → PEEL → CHOP\n4. Rice: RAW → COOK\n5. Get Nori from shop\n6. PREP: Combine all ingredients',
                ingredients: 'Cooked Salmon + Cooked Tuna + Chopped Avocado + Cooked Rice + Nori'
            },
            'spider_roll': {
                process: '1. Crab: RAW → WASH → COOK\n2. Cucumber: RAW → WASH → PEEL → CHOP\n3. Avocado: RAW → WASH → PEEL → CHOP\n4. Rice: RAW → COOK\n5. Get Nori from shop\n6. PREP: Combine all ingredients',
                ingredients: 'Cooked Crab + Chopped Cucumber + Chopped Avocado + Cooked Rice + Nori'
            },
            'philadelphia_roll': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Cucumber: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Cream Cheese and Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Cooked Salmon + Cream Cheese + Chopped Cucumber + Cooked Rice + Nori'
            },
            'boston_roll': {
                process: '1. Shrimp: RAW → WASH → COOK\n2. Cucumber: RAW → WASH → PEEL → CHOP\n3. Avocado: RAW → WASH → PEEL → CHOP\n4. Rice: RAW → COOK\n5. Get Nori from shop\n6. PREP: Combine all ingredients',
                ingredients: 'Cooked Shrimp + Chopped Cucumber + Chopped Avocado + Cooked Rice + Nori'
            },

            'shrimp_tempura_roll': {
                process: '1. Shrimp: RAW → WASH → COOK\n2. Avocado: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Tempura Batter and Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Cooked Shrimp + Tempura Batter + Chopped Avocado + Cooked Rice + Nori'
            },
            'vegetable_tempura_roll': {
                process: '1. Asparagus: RAW → WASH → CHOP\n2. Carrot: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Tempura Batter and Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Chopped Asparagus + Chopped Carrot + Tempura Batter + Cooked Rice + Nori'
            },

            'spicy_tuna_roll': {
                process: '1. Tuna: RAW → WASH → CHOP → COOK\n2. Scallion: RAW → WASH → CHOP\n3. Rice: RAW → COOK\n4. Get Spicy Mayo and Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Cooked Tuna + Spicy Mayo + Chopped Scallion + Cooked Rice + Nori'
            },
            'spicy_salmon_roll': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Cucumber: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Spicy Mayo and Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Cooked Salmon + Spicy Mayo + Chopped Cucumber + Cooked Rice + Nori'
            },

            'chirashi_bowl': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Tuna: RAW → WASH → CHOP → COOK\n3. Yellowtail: RAW → WASH → CHOP → COOK\n4. Radish: RAW → WASH → PEEL → CHOP\n5. Rice: RAW → COOK\n6. PREP: Combine all ingredients',
                ingredients: 'Cooked Salmon + Cooked Tuna + Cooked Yellowtail + Cooked Rice + Chopped Radish'
            },
            'poke_bowl': {
                process: '1. Tuna: RAW → WASH → CHOP → COOK\n2. Avocado: RAW → WASH → PEEL → CHOP\n3. Cucumber: RAW → WASH → PEEL → CHOP\n4. Rice: RAW → COOK\n5. Get Sesame Seeds from shop\n6. PREP: Combine all ingredients',
                ingredients: 'Cooked Tuna + Chopped Avocado + Chopped Cucumber + Cooked Rice + Sesame Seeds'
            },

            'omakase_platter': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Tuna: RAW → WASH → CHOP → COOK\n3. Yellowtail: RAW → WASH → CHOP → COOK\n4. Eel: RAW → WASH → COOK\n5. Shrimp: RAW → WASH → COOK\n6. Rice: RAW → COOK\n7. PREP: Combine all ingredients',
                ingredients: 'Cooked Salmon + Cooked Tuna + Cooked Yellowtail + Cooked Eel + Cooked Shrimp + Cooked Rice'
            },
            'deluxe_sashimi': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Tuna: RAW → WASH → CHOP → COOK\n3. Sea Bass: RAW → WASH → CHOP → COOK\n4. Radish: RAW → WASH → PEEL → CHOP\n5. Get Wasabi and Ginger from shop\n6. PREP: Combine all ingredients',
                ingredients: 'Cooked Salmon + Cooked Tuna + Cooked Sea Bass + Chopped Radish + Wasabi + Ginger'
            },
            'margherita_pizza': {
                process: '1. Dough: FLOUR → PREP\n2. Add TOMATO SAUCE + MOZZARELLA + BASIL\n3. BAKE until crispy',
                ingredients: 'Flour + Tomato Sauce + Mozzarella + Basil'
            },
            'spaghetti_bolognese': {
                process: '1. Pasta: RAW → COOK\n2. Beef: RAW → COOK\n3. PREP: Combine with Tomato Sauce',
                ingredients: 'Pasta + Cooked Beef + Tomato Sauce'
            },
            'beef_taco': {
                process: '1. Beef: RAW → COOK\n2. PREP: Add Tortilla + Salsa + Cheddar',
                ingredients: 'Tortilla + Cooked Beef + Salsa + Cheddar'
            },
            'quesadilla': {
                process: '1. PREP: Place Tortilla + Cheddar\n2. COOK until melted',
                ingredients: 'Tortilla + Cheddar'
            },
            'chicken_curry': {
                process: '1. Rice: RAW → COOK\n2. Curry Sauce from shop\n3. PREP: Combine',
                ingredients: 'Cooked Rice + Curry Sauce'
            },
            'dal_tadka': {
                process: '1. Lentils: RAW → COOK\n2. PREP: Add Curry Sauce',
                ingredients: 'Cooked Lentils + Curry Sauce'
            },
            'paneer_naan': {
                process: '1. PREP: Naan + Paneer + Curry Sauce\n2. BAKE until done',
                ingredients: 'Naan + Paneer + Curry Sauce'
            },
            'crepes': {
                process: '1. PREP: Mix Flour + Egg + Milk + Butter\n2. COOK on hot surface',
                ingredients: 'Flour + Egg + Milk + Butter'
            },
            'omelette': {
                process: '1. PREP: Mix Egg + Milk\n2. COOK with Butter until set',
                ingredients: 'Egg + Milk + Butter'
            }
        };
        
        return processes[recipeKey] || { process: 'Unknown recipe', ingredients: 'Unknown' };
    }
    
    showCanvasTooltip(x, y, content) {
        if (this.canvasTooltip) {
            this.canvasTooltip.innerHTML = content;
            this.canvasTooltip.style.left = (x + 10) + 'px';
            this.canvasTooltip.style.top = (y - 10) + 'px';
            this.canvasTooltip.style.display = 'block';
        }
    }
    
    hideCanvasTooltip() {
        if (this.canvasTooltip) {
            this.canvasTooltip.style.display = 'none';
        }
    }
    
    drawPixelRect(x, y, width, height, color, border = true) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        
        if (border) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, width, height);
        }
    }
    
    drawPixelText(text, x, y, color = '#fff', size = 10) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px "Press Start 2P", monospace`;
        this.ctx.fillText(text, x, y);
    }
    
    drawGameObject(obj) {
        this.drawPixelRect(obj.x, obj.y, obj.width, obj.height, obj.color);
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        const emoji = this.getItemEmoji(obj.name);
        const textX = obj.x + obj.width/2 - 10;
        const textY = obj.y + obj.height/2 + 7;
        this.ctx.strokeText(emoji, textX, textY);
        this.ctx.fillText(emoji, textX, textY);
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handlePrepStationClick(workstation, mousePos) {
        if (workstation.name === 'prep' && workstation.ingredients.length > 0 && workstation.cooldown === 0) {
            const lastIngredient = workstation.ingredients.pop();

            const ingredient = {
                type: 'ingredient',
                name: lastIngredient,
                x: mousePos.x - 17,
                y: mousePos.y - 17,
                width: 35,
                height: 35,
                color: this.getIngredientColor(lastIngredient)
            };
            
            this.gameObjects.push(ingredient);
        }
    }
    
    handleMouseDown(e) {
        this.mousePos = this.getMousePos(e);

        const clickedWorkstation = this.getWorkstationAt(this.mousePos);
        if (clickedWorkstation && clickedWorkstation.name === 'prep' && clickedWorkstation.ingredients.length > 0) {
            this.handlePrepStationClick(clickedWorkstation, this.mousePos);
            return;
        }
        
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            if ((obj.type === 'ingredient' || obj.type === 'dish') && 
                this.isPointInRect(this.mousePos, obj)) {
                this.draggedObject = obj;
                obj.isDragging = true;
                this.hideCanvasTooltip();
                break;
            }
        }
    }
    
    normalizeName(itemName) {
    return itemName.replace(/^(washed_|peeled_|chopped_|cooked_)/, '');
}

getIngredientStage(itemName) {
    if (itemName.startsWith("washed_")) return "washed";
    if (itemName.startsWith("peeled_")) return "peeled";
    if (itemName.startsWith("chopped_")) return "chopped";
    if (itemName.startsWith("cooked_")) return "cooked";
    return "raw";
}

    handleMouseMove(e) {
        this.mousePos = this.getMousePos(e);
        
        if (this.draggedObject) {
            this.draggedObject.x = this.mousePos.x - this.draggedObject.width / 2;
            this.draggedObject.y = this.mousePos.y - this.draggedObject.height / 2;
            this.hideCanvasTooltip();
        } else {
            let hoveredItem = null;
            let hoveredWorkstation = null;

            for (let obj of this.gameObjects) {
                if (obj.type === 'workstation' && this.isPointInRect(this.mousePos, obj)) {
                    hoveredWorkstation = obj;
                    break;
                }
            }

            if (!hoveredWorkstation) {
                for (let i = this.gameObjects.length - 1; i >= 0; i--) {
                    const obj = this.gameObjects[i];
                    if ((obj.type === 'ingredient' || obj.type === 'dish') && 
                        this.isPointInRect(this.mousePos, obj)) {
                        hoveredItem = obj;
                        break;
                    }
                }
            }
            
            if (hoveredWorkstation && hoveredWorkstation.name === 'prep' && hoveredWorkstation.ingredients.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const screenX = e.clientX;
                const screenY = e.clientY;
                
                const ingredientsList = hoveredWorkstation.ingredients.map(ing => 
                    `• ${ing.replace(/_/g, ' ').toUpperCase()}`
                ).join('<br>');
                
                let tooltipContent = `
                    <strong>PREP STATION</strong><br>
                    <strong>Ingredients (${hoveredWorkstation.ingredients.length}):</strong><br>
                    ${ingredientsList}<br><br>
                    <strong style="color: #4fc3f7;">Click to remove last ingredient</strong><br>
                    <em style="color: #ffb74d;">Drop ingredients here to combine into recipes</em>
                `;
                
                this.showCanvasTooltip(screenX, screenY, tooltipContent);
            } else if (hoveredItem) {
                const rect = this.canvas.getBoundingClientRect();
                const screenX = e.clientX;
                const screenY = e.clientY;
                
                let tooltipContent = '';    
            if (hoveredItem.type === 'ingredient') {
            const baseItem = hoveredItem.name.replace(/^(washed_|peeled_|chopped_|cooked_)/, '');
                tooltipContent = `
                    <strong>${hoveredItem.name.replace(/_/g, ' ').toUpperCase()}</strong><br>
                ${this.getItemDescription(hoveredItem.name)}<br><br>
                    <strong>Processing:</strong><br>
                ${this.getProcessingSteps(baseItem)}
            `;
            } else if (hoveredItem.type === 'dish') {
            const recipeInfo = this.getRecipeProcess(hoveredItem.recipeKey);
                tooltipContent = `
                    <strong>${hoveredItem.name.replace(/_/g, ' ').toUpperCase()}</strong><br>
                ${this.getItemDescription(hoveredItem.name)}<br><br>
                    <strong>Processing:</strong><br>
                ${this.getProcessingSteps(hoveredItem.name)}
            `;
                }
                
                this.showCanvasTooltip(screenX, screenY, tooltipContent);
            } else {
                this.hideCanvasTooltip();
            }
        }
    }
    
    handleMouseUp(e) {
        if (this.draggedObject) {
            this.draggedObject.isDragging = false;
            
            if (this.isPointInRect(this.mousePos, this.inventoryArea)) {
                this.returnToInventory(this.draggedObject);
            } else {
                const workstation = this.getWorkstationAt(this.mousePos);
                if (workstation) {
                    this.processAtWorkstation(this.draggedObject, workstation);
                }
            }
            
            this.draggedObject = null;
        }
    }
    
    isPointInRect(point, rect) {
        return point.x >= rect.x && 
               point.x <= rect.x + rect.width && 
               point.y >= rect.y && 
               point.y <= rect.y + rect.height;
    }
    
    getWorkstationAt(pos) {
        return this.gameObjects.find(obj => 
            obj.type === 'workstation' && this.isPointInRect(pos, obj)
        );
    }
    
    processAtWorkstation(item, workstation) {
        if (workstation.cooldown > 0) return;
        
        if (item.type === 'ingredient') {
            const canProcess = this.canProcessAt(item.name, workstation.name);
            if (canProcess) {
                this.processIngredient(item, workstation);
            } else if (workstation.name === 'prep') {
                workstation.ingredients.push(item.name);
                this.removeGameObject(item);
                this.checkForRecipe(workstation);
            }
        } else if (item.type === 'dish' && workstation.name === 'serve') {
            if (workstation.cooldown === 0) {
                this.serveDish(item, workstation);
                this.removeGameObject(item);
            }
        }
    }
    
    canProcessAt(itemName, stationName) {
        const processMap = {
            'wash': ['salmon', 'tuna', 'eel', 'shrimp', 'crab', 'yellowtail', 'mackerel', 'sea_bass', 
                    'cucumber', 'avocado', 'carrot', 'radish', 'asparagus', 'scallion'],
            'peel': ['washed_cucumber', 'washed_avocado', 'washed_carrot', 'washed_radish', 'washed_ginger'],
            'chop': ['peeled_cucumber', 'peeled_avocado', 'peeled_carrot', 'peeled_radish', 'peeled_ginger',
                    'washed_salmon', 'washed_tuna', 'washed_yellowtail', 'washed_mackerel', 'washed_sea_bass',
                    'washed_asparagus', 'washed_scallion'],
            'cook': ['rice', 'chopped_salmon', 'chopped_tuna', 'chopped_yellowtail', 'chopped_mackerel', 'chopped_sea_bass',
                    'washed_eel', 'washed_shrimp', 'washed_crab']
        };
        
        return processMap[stationName]?.includes(itemName) || false;
    }
    
    processIngredient(item, workstation) {
        this.removeGameObject(item);
        workstation.cooldown = workstation.maxCooldown;

        if (localStorage.getItem("sfxEnabled") !== "false" && this.sounds[workstation.name]) {
            const sfx = this.sounds[workstation.name];
            sfx.currentTime = 0;
            sfx.play();
            }

        if (this.sounds[workstation.name]) {
            const sfx = this.sounds[workstation.name];
            try {
                sfx.currentTime = 0;
                sfx.play();
            } catch (err) {
                console.warn("Autoplay blocked:", err);
            }
        }
    

    setTimeout(() => {
        const processedName = this.getProcessedName(item.name, workstation.name);
        const processedItem = {
            type: 'ingredient',
            name: processedName,
            x: workstation.x + 20,
            y: workstation.y + 80,
            width: 35,
            height: 35,
            color: this.getIngredientColor(processedName)
        };
        this.gameObjects.push(processedItem);

        // 🔊 Stop sound after finished
        if (this.sounds[workstation.name]) {
            this.sounds[workstation.name].pause();
            this.sounds[workstation.name].currentTime = 0;
        }
    }, workstation.maxCooldown);
    }   
    
    getProcessedName(itemName, stationName) {
        const processMap = {
            'wash': (name) => `washed_${name}`,
            'peel': (name) => name.replace('washed_', 'peeled_'),
            'chop': (name) => name.replace('washed_', 'chopped_').replace('peeled_', 'chopped_'),
            'cook': (name) => {
                if (name === 'rice') return 'cooked_rice';
                if (name === 'washed_eel') return 'cooked_eel';
                if (name === 'washed_shrimp') return 'cooked_shrimp';
                if (name === 'washed_crab') return 'cooked_crab';
                return name.replace('chopped_', 'cooked_');
            }
        };
        
        return processMap[stationName]?.(itemName) || itemName;
    }
    
    returnToInventory(item) {
        if (item.type === 'ingredient') {
            let baseItem = item.name;
            baseItem = baseItem.replace(/^(washed_|peeled_|chopped_|cooked_)/, '');
            
            this.inventory[baseItem] = (this.inventory[baseItem] || 0) + 1;
            this.removeGameObject(item);
            this.updateInventoryUI();
        }
    }
    
    checkForRecipe(workstation) {
        const ingredients = workstation.ingredients.sort();
        
        for (const [recipeKey, recipe] of Object.entries(this.recipes)) {
            const requiredIngredients = [...recipe.ingredients].sort();
            
            if (this.arraysEqual(ingredients, requiredIngredients)) {
                workstation.ingredients = [];
                workstation.cooldown = recipe.combineTime;
                this.startCombining(recipe, recipeKey, workstation);
                break;
            }
        }
    }
    
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }
    
    startCombining(recipe, recipeKey, workstation) {
        if (this.sounds.prep) {
            const sfx = this.sounds.prep;
            sfx.currentTime = 0;
            sfx.play();
        }

    setTimeout(() => {
        const dish = {
            type: 'dish',
            name: recipe.name,
            recipeKey: recipeKey,
            x: workstation.x + 20,
            y: workstation.y + 80,
            width: 40,
            height: 40,
            color: '#ffd700',
            sellPrice: recipe.sellPrice
        };
        this.gameObjects.push(dish);

        // 🔊 Stop prep sound
        if (this.sounds.prep) {
            this.sounds.prep.pause();
            this.sounds.prep.currentTime = 0;
        }
    }, recipe.combineTime);
}
    
    serveDish(dish, workstation) {
        workstation.cooldown = workstation.maxCooldown;
        
        const orderIndex = this.orders.findIndex(order => order.dish === dish.recipeKey);
        
        if (orderIndex !== -1) {
            const order = this.orders[orderIndex];
            this.money += order.payment;
            this.orders.splice(orderIndex, 1);
            this.updateOrdersUI();
            this.updateUI();
        } else {
            this.money += dish.sellPrice;
            this.updateUI();
        }
        
        this.saveGame();
    }
    
    removeGameObject(obj) {
        const index = this.gameObjects.indexOf(obj);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }
    
    spawnIngredient(type) {
        this.removeInventoryTooltips();
        
        if (this.inventory[type] > 0) {
            this.inventory[type]--;
            
            const ingredient = {
                type: 'ingredient',
                name: type,
                x: 100 + Math.random() * 300,
                y: 350 + Math.random() * 200,
                width: 35,
                height: 35,
                color: this.getIngredientColor(type)
            };
            
            this.gameObjects.push(ingredient);
            this.updateInventoryUI();
        }
    }
    
    getIngredientColor(type) {
        const colors = {
            'salmon': '#ff6b6b', 'washed_salmon': '#ff5252', 'chopped_salmon': '#ff4444', 'cooked_salmon': '#d32f2f',
            'tuna': '#8b0000', 'washed_tuna': '#660000', 'chopped_tuna': '#550000', 'cooked_tuna': '#330000',
            'eel': '#4b0082', 'washed_eel': '#5e35b1', 'cooked_eel': '#7e57c2',
            'shrimp': '#ff9800', 'washed_shrimp': '#f57c00', 'cooked_shrimp': '#ef6c00',
            'crab': '#f44336', 'washed_crab': '#d32f2f', 'cooked_crab': '#c62828',
            'yellowtail': '#ffeb3b', 'washed_yellowtail': '#fdd835', 'chopped_yellowtail': '#fbc02d', 'cooked_yellowtail': '#f9a825',
            'mackerel': '#607d8b', 'washed_mackerel': '#546e7a', 'chopped_mackerel': '#455a64', 'cooked_mackerel': '#37474f',
            'sea_bass': '#00bcd4', 'washed_sea_bass': '#00acc1', 'chopped_sea_bass': '#0097a7', 'cooked_sea_bass': '#00838f',

            'rice': '#f4f4f4', 'cooked_rice': '#fff9c4',
            'nori': '#2d5016',
            'wasabi': '#4caf50',
            'soy_sauce': '#3e2723',
            'ginger': '#ff8a65', 'washed_ginger': '#ff7043', 'peeled_ginger': '#ff5722', 'chopped_ginger': '#d84315',

            'cucumber': '#4caf50', 'washed_cucumber': '#43a047', 'peeled_cucumber': '#388e3c', 'chopped_cucumber': '#2e7d32',
            'avocado': '#8bc34a', 'washed_avocado': '#7cb342', 'peeled_avocado': '#689f38', 'chopped_avocado': '#558b2f',
            'carrot': '#ff9800', 'washed_carrot': '#f57c00', 'peeled_carrot': '#ef6c00', 'chopped_carrot': '#e65100',
            'radish': '#e91e63', 'washed_radish': '#d81b60', 'peeled_radish': '#c2185b', 'chopped_radish': '#ad1457',
            'asparagus': '#689f38', 'washed_asparagus': '#558b2f', 'chopped_asparagus': '#33691e',
            'scallion': '#4caf50', 'washed_scallion': '#43a047', 'chopped_scallion': '#388e3c',

            'sesame_seeds': '#f5f5f5',
            'tempura_batter': '#fff3e0',
            'cream_cheese': '#fffde7',
            'spicy_mayo': '#ffccbc'
        };
        return colors[type] || '#888';
    }
    
    getWorkstationColor(type) {
        const colors = {
            'wash': '#4fc3f7',
            'peel': '#81c784',
            'chop': '#ffb74d',
            'cook': '#e57373',
            'prep': '#9575cd',
            'serve': '#4db6ac'
        };
        return colors[type] || '#888';
    }
    
    getItemEmoji(type) {
        const emojis = {
        // Fish
        'salmon': '🐟', 'washed_salmon': '🐟', 'chopped_salmon': '🔪', 'cooked_salmon': '🍣',
        'tuna': '🐟', 'washed_tuna': '🐟', 'chopped_tuna': '🔪', 'cooked_tuna': '🍣',
        'eel': '🦎', 'washed_eel': '🦎', 'cooked_eel': '🍣',
        'shrimp': '🦐', 'washed_shrimp': '🦐', 'cooked_shrimp': '🍤',
        'crab': '🦀', 'washed_crab': '🦀', 'cooked_crab': '🦀',
        'yellowtail': '🐠', 'washed_yellowtail': '🐠', 'chopped_yellowtail': '🔪', 'cooked_yellowtail': '🍣',
        'mackerel': '🐟', 'washed_mackerel': '🐟', 'chopped_mackerel': '🔪', 'cooked_mackerel': '🍣',
        'sea_bass': '🐟', 'washed_sea_bass': '🐟', 'chopped_sea_bass': '🔪', 'cooked_sea_bass': '🍣',
        
        // Base ingredients
        'rice': '🍚', 'cooked_rice': '🍚',
        'nori': '🟫',
        'wasabi': '🟢',
        'soy_sauce': '🟤',
        'ginger': '🫚', 'washed_ginger': '🫚', 'peeled_ginger': '🫚', 'chopped_ginger': '🔪',
        
        // Vegetables
        'cucumber': '🥒', 'washed_cucumber': '🥒', 'peeled_cucumber': '🥒', 'chopped_cucumber': '🔪',
        'avocado': '🥑', 'washed_avocado': '🥑', 'peeled_avocado': '🥑', 'chopped_avocado': '🔪',
        'carrot': '🥕', 'washed_carrot': '🥕', 'peeled_carrot': '🥕', 'chopped_carrot': '🔪',
        'radish': '🔴', 'washed_radish': '🔴', 'peeled_radish': '🔴', 'chopped_radish': '🔪',
        'asparagus': '🥬', 'washed_asparagus': '🥬', 'chopped_asparagus': '🔪',
        'scallion': '🧅', 'washed_scallion': '🧅', 'chopped_scallion': '🔪',
        
        // Special ingredients
        'sesame_seeds': '⚪',
        'tempura_batter': '🥄',
        'cream_cheese': '🧀',
        'spicy_mayo': '🌶️',
        
        // Dishes
        'Salmon Nigiri': '🍣', 'Tuna Nigiri': '🍣', 'Shrimp Nigiri': '🍣', 'Yellowtail Nigiri': '🍣',
        'Tuna Roll': '🍙', 'Salmon Roll': '🍙', 'California Roll': '🍱', 'Dragon Roll': '🐉',
        'Rainbow Roll': '🌈', 'Spider Roll': '🕷️', 'Philadelphia Roll': '🧀', 'Boston Roll': '🦐',
        'Shrimp Tempura Roll': '🍤', 'Vegetable Tempura Roll': '🥬', 'Spicy Tuna Roll': '🌶️', 'Spicy Salmon Roll': '🌶️',
        'Chirashi Bowl': '🍱', 'Poke Bowl': '🥗', 'Omakase Platter': '🍽️', 'Deluxe Sashimi': '🍣',

        'mozzarella': '🧀', 'tomato_sauce': '🍅', 'basil': '🌿', 'pasta': '🍝', 'tortilla': '🌮', 'beef': '🥩',
        'cheddar': '🧀', 'salsa': '🌶️', 'curry_sauce': '🍛', 'lentils': '🫘', 'paneer': '🧀', 'naan': '🥙', 'butter': '🧈', 
        'egg': '🥚', 'milk': '🥛', 'flour': '🌾',

        // dishes
        'margherita_pizza': '🍕', 'spaghetti_bolognese': '🍝', 'beef_taco': '🌮', 'quesadilla': '🫓',
        'chicken_curry': '🍛', 'dal_tadka': '🫘', 'paneer_naan': '🥘', 'crepes': '🥞', 'omelette': '🍳'
    };
    return emojis[type] || '📦';
    }
    
    startOrderGeneration() {
    if (this.orderTimer) clearInterval(this.orderTimer);

    this.orderTimer = setInterval(() => {
        if (this.orders.length < 3) {
        this.generateOrder();
        }
    }, this.orderInterval);

    setTimeout(() => this.generateOrder(), 5000);
    }
        
    generateOrder() {
        const recipeKeys = Object.keys(this.recipes)
            .filter(key => {
                const recipe = this.recipes[key];
                return !recipe.unlockDay || recipe.unlockDay <= this.currentDay;
            });

        if (recipeKeys.length === 0) return;

        const randomRecipe = recipeKeys[Math.floor(Math.random() * recipeKeys.length)];
        const recipe = this.recipes[randomRecipe];
        
        const order = {
            id: this.nextOrderId++,
            dish: randomRecipe,
            dishName: recipe.name,
            payment: recipe.sellPrice + Math.floor(Math.random() * 20),
            timeLeft: 240000,
            maxTime: 240000
        };
        
        this.orders.push(order);
        this.updateOrdersUI();
    }
    
    buyItem(item, cost) {
        if (this.money >= cost) {
            this.money -= cost;
            this.inventory[item] = (this.inventory[item] || 0) + 1;
            this.updateUI();
            this.saveGame();
        }
    }
    
    updateUI() {
        const moneyElement = document.getElementById('money');
        if (moneyElement) {
            moneyElement.textContent = `💰 MONEY: $${this.money}`;
        }
        this.updateInventoryUI();
    }
    
    updateInventoryUI() {
        // Remove any existing tooltips before updating
        this.removeInventoryTooltips();
        
        const inventoryDiv = document.getElementById('inventoryItems');
        if (!inventoryDiv) return;
        
        inventoryDiv.innerHTML = '';
        
        Object.entries(this.inventory).forEach(([item, count]) => {
            if (count > 0) {
                const inventoryItem = document.createElement('div');
                inventoryItem.className = 'inventory-item';
                inventoryItem.innerHTML = `
                    <div style="font-size: 16px;">${this.getItemEmoji(item)}</div>
                    <div>${item}</div>
                    <div>(${count})</div>
                `;
                
                let inventoryTooltip = null;
                let tooltipTimeout = null;
                let isMouseOver = false;
                
                const clickHandler = () => {
                    // Remove tooltips immediately when clicked
                    this.removeInventoryTooltips();
                    this.spawnIngredient(item);
                };
                
                const showInventoryTooltip = (e) => {
                    if (tooltipTimeout) {
                        clearTimeout(tooltipTimeout);
                    }
                    
                    isMouseOver = true;
                    this.removeInventoryTooltips();
                    
                    tooltipTimeout = setTimeout(() => {
                        if (!isMouseOver) return; // Don't show if mouse already left
                        
                        const tooltip = document.createElement('div');
                        tooltip.className = 'inventory-tooltip';
                        tooltip.innerHTML = `
                            <div style="color: #ffd700; font-weight: bold; margin-bottom: 6px; font-size: 10px;">
                                ${item.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div style="margin-bottom: 6px; font-size: 8px; line-height: 1.3;">
                                ${this.getItemDescription(item)}
                            </div>
                            <div style="color: #4fc3f7; font-weight: bold; margin-bottom: 4px; font-size: 8px;">
                                Process:
                            </div>
                            <div style="margin-bottom: 6px; font-size: 7px; line-height: 1.3; color: #81c784;">
                                ${this.getProcessingSteps(item)}
                            </div>
                            <div style="color: #ffb74d; font-size: 7px; font-style: italic;">
                                Click to spawn on canvas
                            </div>
                        `;
                        
                        // Position tooltip relative to the inventory item
                        const rect = inventoryItem.getBoundingClientRect();
                        tooltip.style.position = 'fixed';
                        tooltip.style.left = (rect.right + 10) + 'px';
                        tooltip.style.top = rect.top + 'px';
                        tooltip.style.zIndex = '10000';
                        
                        // Check if tooltip would go off screen and adjust
                        document.body.appendChild(tooltip);
                        const tooltipRect = tooltip.getBoundingClientRect();
                        
                        if (tooltipRect.right > window.innerWidth - 10) {
                            tooltip.style.left = (rect.left - tooltipRect.width - 10) + 'px';
                        }
                        
                        if (tooltipRect.bottom > window.innerHeight - 10) {
                            tooltip.style.top = (window.innerHeight - tooltipRect.height - 10) + 'px';
                        }
                        
                        inventoryTooltip = tooltip;
                    }, 200);
                };
                
                const hideInventoryTooltip = () => {
                    isMouseOver = false;
                    
                    if (tooltipTimeout) {
                        clearTimeout(tooltipTimeout);
                        tooltipTimeout = null;
                    }
                    
                    setTimeout(() => {
                        this.removeInventoryTooltips();
                        inventoryTooltip = null;
                    }, 50);
                };
                
                inventoryItem.addEventListener('mouseenter', showInventoryTooltip);
                inventoryItem.addEventListener('mouseleave', hideInventoryTooltip);
                inventoryItem.addEventListener('click', clickHandler);
                
                // Also hide tooltip on mouse down to be extra sure
                inventoryItem.addEventListener('mousedown', () => {
                    this.removeInventoryTooltips();
                });
                
                inventoryDiv.appendChild(inventoryItem);
            }
        });
    }
    
    removeInventoryTooltips() {
        const existingTooltips = document.querySelectorAll('.inventory-tooltip');
        existingTooltips.forEach(tooltip => {
            tooltip.remove();
        });
    }
    
    removeOrderTooltip() {
        const existingTooltips = document.querySelectorAll('.order-tooltip');
        existingTooltips.forEach(tooltip => {
            tooltip.remove();
        });
    }
    
    updateOrdersUI() {
        const ordersDiv = document.getElementById('ordersList');
        if (!ordersDiv) return;
        
        ordersDiv.innerHTML = '';
        
        this.orders.forEach(order => {
            const orderDiv = document.createElement('div');
            const timeLeft = Math.max(0, order.timeLeft);
            const isUrgent = timeLeft < 30000;
            
            orderDiv.className = isUrgent ? 'order-item order-urgent' : 'order-item';
            orderDiv.innerHTML = `
                <strong>🍱 ${order.dishName}</strong><br>
                💰 Pay: $${order.payment}<br>
                ⏰ Time: ${Math.ceil(timeLeft/1000)}s
                <div class="timer-bar">
                    <div class="timer-progress" style="width: ${(timeLeft/order.maxTime)*100}%"></div>
                </div>
            `;
            
            let tooltipTimeout;
            let currentTooltip = null;
            let isMouseOver = false;
            
            const updateTooltipPosition = (e) => {
                if (currentTooltip) {
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;
                    
                    // Offset from cursor so it doesn't block the cursor
                    let left = mouseX + 15;
                    let top = mouseY - 10;
                    
                    // Get tooltip dimensions
                    const tooltipRect = currentTooltip.getBoundingClientRect();
                    
                    // Adjust if tooltip would go off right edge
                    if (left + tooltipRect.width > window.innerWidth - 10) {
                        left = mouseX - tooltipRect.width - 15;
                    }
                    
                    // Adjust if tooltip would go off bottom edge
                    if (top + tooltipRect.height > window.innerHeight - 10) {
                        top = mouseY - tooltipRect.height - 15;
                    }
                    
                    // Make sure tooltip stays on screen
                    left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
                    top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
                    
                    currentTooltip.style.left = left + 'px';
                    currentTooltip.style.top = top + 'px';
                }
            };
            
            const showTooltip = (e) => {
                if (tooltipTimeout) {
                    clearTimeout(tooltipTimeout);
                }
                
                isMouseOver = true;
                this.removeOrderTooltip();
                
                tooltipTimeout = setTimeout(() => {
                    if (!isMouseOver) return;
                    
                    const recipeInfo = this.getRecipeProcess(order.dish);
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip order-tooltip';
                    
                    // Format ingredients to fit better
                    const ingredientsFormatted = recipeInfo.ingredients
                        .split(' + ')
                        .join('<br>• ')
                        .replace(/^/, '• ');
                    
                    tooltip.innerHTML = `
                        <div style="color: #ffd700; font-weight: bold; margin-bottom: 8px; text-align: center; font-size: 11px;">
                            ${order.dishName.toUpperCase()}
                        </div>
                        
                        <div style="margin-bottom: 4px; font-size: 9px;">💰 Payment: $${order.payment}</div>
                        <div style="margin-bottom: 8px; font-size: 9px;">⏰ Time: ${Math.ceil(timeLeft/1000)}s</div>
                        
                        <div style="color: #4fc3f7; font-weight: bold; margin-bottom: 4px; font-size: 9px;">
                            Required Ingredients:
                        </div>
                        <div style="margin-bottom: 10px; color: #81c784; font-size: 8px; line-height: 1.3;">
                            ${ingredientsFormatted}
                        </div>
                        
                        <div style="color: #ffb74d; font-weight: bold; margin-bottom: 4px; font-size: 9px;">
                            How to Make:
                        </div>
                        <div style="color: #e0e0e0; font-size: 7px; line-height: 1.4;">
                            ${recipeInfo.process.replace(/\n/g, '<br>')}
                        </div>
                    `;
                    
                    // Position tooltip at mouse cursor initially (off-screen to measure)
                    tooltip.style.position = 'fixed';
                    tooltip.style.left = '-9999px';
                    tooltip.style.top = '-9999px';
                    tooltip.style.visibility = 'hidden';
                    document.body.appendChild(tooltip);
                    
                    // Now position it properly at mouse location
                    currentTooltip = tooltip;
                    updateTooltipPosition(e);
                    tooltip.style.visibility = 'visible';
                }, 150);
            };
            
            const hideTooltip = () => {
                isMouseOver = false;
                
                if (tooltipTimeout) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                
                setTimeout(() => {
                    this.removeOrderTooltip();
                    currentTooltip = null;
                }, 50);
            };
            
            orderDiv.addEventListener('mouseenter', showTooltip);
            orderDiv.addEventListener('mousemove', updateTooltipPosition);
            orderDiv.addEventListener('mouseleave', hideTooltip);
            
            ordersDiv.appendChild(orderDiv);
        });
    }
    
    updateCooldowns() {
        this.gameObjects.forEach(obj => {
            if (obj.type === 'workstation' && obj.cooldown > 0) {
                obj.cooldown = Math.max(0, obj.cooldown - 16);
            }
        });
    }
    
    updateOrders() {
        const deltaTime = 16;
        const oldOrdersLength = this.orders.length;
        
        this.orders = this.orders.filter(order => {
            order.timeLeft -= deltaTime;
            return order.timeLeft > 0;
        });
        
        // If orders were removed, update UI and clean up all tooltips
        if (this.orders.length !== oldOrdersLength) {
            this.removeOrderTooltip();
            this.removeInventoryTooltips();
            this.updateOrdersUI();
        }
        
        if (Math.random() < 0.005) {
            this.updateOrdersUI();
        }
    }
    
    saveGame() {
        const gameState = {
            money: this.money,
            inventory: this.inventory,
            orders: this.orders,
            nextOrderId: this.nextOrderId,
            timeLeft: this.timeLeft,
            upgrades: this.upgrades,  
        };
        localStorage.setItem('sushiGameSave', JSON.stringify(gameState));
    }
    
loadGame() {
    const saved = localStorage.getItem('sushiGameSave');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            this.money = gameState.money ?? 100;
            this.inventory = gameState.inventory ?? {};
            this.orders = gameState.orders ?? [];
            this.nextOrderId = gameState.nextOrderId ?? 1;
            this.currentDay = gameState.currentDay ?? 1;

            if (typeof gameState.timeLeft === "number") {
                this.timeLeft = gameState.timeLeft;
            } else {
                this.timeLeft = this.dayDuration;
            }

            if (typeof gameState.dayDuration === "number") {
                this.dayDuration = gameState.dayDuration;
            }
            if (gameState.upgrades) {
            this.upgrades = gameState.upgrades;
            this.applyUpgradeEffects();
            }

            this.updateUI();
            this.updateOrdersUI();
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}
    
    render() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#667db6');
        gradient.addColorStop(0.5, '#0082c8');
        gradient.addColorStop(1, '#667db6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw inventory return area
        this.drawPixelRect(0, 0, this.canvas.width, 40, '#40407a');
        this.drawPixelText('📦 INVENTORY RETURN AREA - Drop items here', 10, 25, '#ffd700', 10);
        
        // Draw workstations
        this.gameObjects.forEach(obj => {
            if (obj.type === 'workstation') {
                // Use station texture if available, otherwise use colored rectangle
                if (this.texturesLoaded && this.textures[obj.name]) {
                    this.ctx.drawImage(
                        this.textures[obj.name], 
                        obj.x, 
                        obj.y, 
                        obj.width, 
                        obj.height
                    );
                } else {
                    this.drawPixelRect(obj.x, obj.y, obj.width, obj.height, obj.color);
                }
                
                // Draw cooldown bar
                if (obj.cooldown > 0) {
                    const progress = obj.cooldown / obj.maxCooldown;
                    this.drawPixelRect(obj.x, obj.y - 15, obj.width, 10, '#ff4444', false);
                    this.drawPixelRect(obj.x, obj.y - 15, obj.width * (1 - progress), 10, '#4caf50', false);
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(obj.x, obj.y - 15, obj.width, 10);
                }
                
                // Draw station name above the workstation
                this.ctx.font = 'bold 12px Arial';
                this.ctx.fillStyle = '#fff';
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;
                
                // Center the text above the workstation
                const textWidth = this.ctx.measureText(obj.name.toUpperCase()).width;
                const textX = obj.x + (obj.width - textWidth) / 2;
                const textY = obj.y - 20;
                
                this.ctx.strokeText(obj.name.toUpperCase(), textX, textY);
                this.ctx.fillText(obj.name.toUpperCase(), textX, textY);
                
                // Draw ingredients count
                if (obj.ingredients && obj.ingredients.length > 0) {
                    this.ctx.font = 'bold 10px Arial';
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 1;
                    const countText = `(${obj.ingredients.length})`;
                    const countWidth = this.ctx.measureText(countText).width;
                    const countX = obj.x + (obj.width - countWidth) / 2;
                    const countY = obj.y + obj.height + 15;
                    
                    this.ctx.strokeText(countText, countX, countY);
                    this.ctx.fillText(countText, countX, countY);
                }
            } else {
                // Draw ingredients and dishes using emojis
                this.drawGameObject(obj);
            }
        });
    }
    
gameLoop() {
    if (!this.gameOver) {
        this.updateTime();        // Updates timer logic
        this.updateCooldowns();   // Updates station cooldowns
        this.updateOrders();      // Order timers
    }

    this.updateTimeUI();          // <-- Add this line to refresh UI each frame
    this.render();                // Draw game
    requestAnimationFrame(() => this.gameLoop());
}
}

// Global functions
let game;

const savedMusic = localStorage.getItem("musicEnabled");
const savedSfx = localStorage.getItem("sfxEnabled");
const savedDayLength = localStorage.getItem("dayLength");

if (savedMusic !== null) document.getElementById("musicToggle").checked = savedMusic === "true";
if (savedSfx !== null) document.getElementById("sfxToggle").checked = savedSfx === "true";
if (savedDayLength !== null) {
    this.dayDuration = parseInt(savedDayLength, 10) * 60000;
    this.timeLeft = this.dayDuration;
    document.getElementById("dayLengthInput").value = savedDayLength;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

let musicPlayer = {
  currentAudio: null,
  playlist: [],

  init() {
    const upload = document.getElementById("songUpload");

    // ✅ Volume slider event
    const volumeSlider = document.getElementById("volumeControl");
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        this.setVolume(parseFloat(e.target.value));
      });
    }

    upload.addEventListener("change", (e) => {
      for (let file of e.target.files) {
        if (file.type === "audio/mp3" || file.type === "audio/mpeg") {
          const url = URL.createObjectURL(file);
          this.playlist.push({ name: file.name, url });
        }
      }
      this.renderList();
    });
  },

  renderList() {
    const list = document.getElementById("songList");
    list.innerHTML = "";

    this.playlist.forEach((song, i) => {
      const songDiv = document.createElement("div");
      songDiv.className = "song-entry";
      songDiv.innerHTML = `
          <span>🎶 ${song.name}</span>
          <div>
            <button onclick="musicPlayer.play(${i})">▶️ Play</button>
            <button onclick="musicPlayer.stop()">⏹ Stop</button>
          </div>
        `;
      list.appendChild(songDiv);
    });
  },

  play(index) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.currentAudio = new Audio(this.playlist[index].url);

    // ✅ Apply current slider volume on playback start
    const volumeSlider = document.getElementById("volumeControl");
    if (volumeSlider) {
      this.currentAudio.volume = parseFloat(volumeSlider.value);
    }

    this.currentAudio.play();
  },

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  },

  setVolume(level) {
    if (this.currentAudio) {
      this.currentAudio.volume = level;
    }
  },
};

// Open jukebox modal on click
document.getElementById("jukeboxBtn")?.addEventListener("click", () => {
  openModal("jukeboxModal");
});

// Init player when game loads
window.addEventListener("load", () => {
  if (musicPlayer) musicPlayer.init();
});

function applySettings() {
    if (!game) return;

    // Music toggle
    const musicEnabled = document.getElementById("musicToggle").checked;
    localStorage.setItem("musicEnabled", musicEnabled);

    // Sound effects toggle
    const sfxEnabled = document.getElementById("sfxToggle").checked;
    localStorage.setItem("sfxEnabled", sfxEnabled);

    alert("✅ Settings Applied!");
    closeModal("settingsModal");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeDisclaimer(persist = false) {
    document.getElementById("disclaimerModal").style.display = "none";
    if (persist) {
        localStorage.setItem("disclaimerShown", "true");
    }
}

// Show disclaimer only on very first load
window.addEventListener("load", () => {
    if (!localStorage.getItem("disclaimerShown")) {
        const modal = document.getElementById("disclaimerModal");
        if (modal) modal.style.display = "block";
    }
});

function saveGame() {
    if (game) {
        game.saveGame();
        alert('Game saved!');
    }
}

function loadGame() {
    if (game) {
        game.loadGame();
        alert('Game loaded!');
    }
}

// Developer console command
window.resetSushiGame = function() {
    if (game) {
        game.hardResetGame();
        alert("Game has been fully reset! 🧹🍣");
    } else {
        console.warn("No game instance is running.");
    }
};

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize game
window.addEventListener('load', () => {
    game = new SushiGame();
});