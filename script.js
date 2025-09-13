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
        
        // Add texture loading
        this.textures = {};
        this.texturesLoaded = false;
        
        // Create canvas tooltip element if it doesn't exist
        this.createCanvasTooltip();
        
        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
        
        this.shopItems = [
            { id: 'salmon', name: '🐟 Salmon', price: 10, emoji: '🐟' },
            { id: 'tuna', name: '🐟 Tuna', price: 12, emoji: '🐟' },
            { id: 'eel', name: '🦎 Eel', price: 15, emoji: '🦎' },
            { id: 'rice', name: '🍚 Rice', price: 5, emoji: '🍚' },
            { id: 'nori', name: '🟫 Nori', price: 3, emoji: '🟫' },
            { id: 'cucumber', name: '🥒 Cucumber', price: 2, emoji: '🥒' },
            { id: 'avocado', name: '🥑 Avocado', price: 4, emoji: '🥑' }
        ];
        
        this.recipes = {
            'salmon_nigiri': {
                ingredients: ['cooked_salmon', 'cooked_rice'],
                combineTime: 2000,
                sellPrice: 25,
                name: 'Salmon Nigiri'
            },
            'tuna_roll': {
                ingredients: ['cooked_tuna', 'cooked_rice', 'nori'],
                combineTime: 3000,
                sellPrice: 30,
                name: 'Tuna Roll'
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
            }
        };
        
        // Load textures first, then initialize game
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
        // Only load workstation textures if you have them
        const textureFiles = [
            'wash', 'peel', 'chop', 'cook', 'prep', 'serve'
        ];

        const loadPromises = textureFiles.map(fileName => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.textures[fileName] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load texture: ${fileName}.png`);
                    // Create a fallback colored rectangle for workstations
                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 70;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = this.getWorkstationColor(fileName);
                    ctx.fillRect(0, 0, 100, 70);
                    this.textures[fileName] = canvas;
                    resolve();
                };
                img.src = `./Textures/${fileName}.png`;
            });
        });

        await Promise.all(loadPromises);
        this.texturesLoaded = true;
        console.log('All textures loaded!');
    }

    createCanvasTooltip() {
        // Create canvas tooltip element if it doesn't exist
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
        
        // Add global click handler to remove tooltips
        document.addEventListener('click', (e) => {
            // Check if click is outside inventory area
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
        const shopGrid = document.getElementById('shopGrid');
        if (!shopGrid) return;
        
        shopGrid.innerHTML = '';
        
        this.shopItems.forEach(item => {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            shopItem.innerHTML = `
                <div style="font-size: 24px;">${item.emoji}</div>
                <div style="font-size: 10px; margin: 5px 0;">${item.name}</div>
                <div class="price">$${item.price}</div>
            `;
            shopItem.onclick = () => this.buyItem(item.id, item.price);
            shopGrid.appendChild(shopItem);
        });
    }
    
    getItemDescription(itemName) {
        const descriptions = {
            // Raw ingredients
            'salmon': 'Raw salmon fish - needs washing and cooking',
            'tuna': 'Raw tuna fish - needs washing and cooking',
            'eel': 'Raw eel - needs washing and cooking',
            'rice': 'Uncooked rice - needs cooking',
            'nori': 'Seaweed sheets - ready to use',
            'cucumber': 'Fresh cucumber - needs washing, peeling, and chopping',
            'avocado': 'Fresh avocado - needs washing, peeling, and chopping',
            
            // Washed ingredients
            'washed_salmon': 'Clean salmon - ready for chopping',
            'washed_tuna': 'Clean tuna - ready for chopping',
            'washed_eel': 'Clean eel - ready for cooking',
            'washed_cucumber': 'Clean cucumber - needs peeling',
            'washed_avocado': 'Clean avocado - needs peeling',
            
            // Peeled ingredients
            'peeled_cucumber': 'Peeled cucumber - ready for chopping',
            'peeled_avocado': 'Peeled avocado - ready for chopping',
            
            // Chopped ingredients
            'chopped_salmon': 'Chopped salmon - ready for cooking',
            'chopped_tuna': 'Chopped tuna - ready for cooking',
            'chopped_cucumber': 'Diced cucumber - ready for combining',
            'chopped_avocado': 'Diced avocado - ready for combining',
            
            // Cooked ingredients
            'cooked_salmon': 'Perfectly cooked salmon - ready for sushi',
            'cooked_tuna': 'Perfectly cooked tuna - ready for sushi',
            'cooked_eel': 'Grilled eel - ready for sushi',
            'cooked_rice': 'Seasoned sushi rice - ready for combining'
        };
        
        return descriptions[itemName] || 'Unknown ingredient';
    }
    
    getProcessingSteps(itemName) {
        const processSteps = {
            'salmon': 'Raw Salmon → WASH → CHOP → COOK',
            'tuna': 'Raw Tuna → WASH → CHOP → COOK',
            'eel': 'Raw Eel → WASH → COOK',
            'cucumber': 'Raw Cucumber → WASH → PEEL → CHOP',
            'avocado': 'Raw Avocado → WASH → PEEL → CHOP',
            'rice': 'Raw Rice → COOK',
            'nori': 'Nori → Ready to use'
        };
        
        return processSteps[itemName] || 'Processing steps unknown';
    }
    
    getRecipeProcess(recipeKey) {
        const processes = {
            'salmon_nigiri': {
                process: '1. Salmon: RAW → WASH → CHOP → COOK\n2. Rice: RAW → COOK\n3. PREP: Combine both ingredients',
                ingredients: 'Cooked Salmon + Cooked Rice'
            },
            'tuna_roll': {
                process: '1. Tuna: RAW → WASH → CHOP → COOK\n2. Rice: RAW → COOK\n3. Get Nori from shop\n4. PREP: Combine all ingredients',
                ingredients: 'Cooked Tuna + Cooked Rice + Nori'
            },
            'california_roll': {
                process: '1. Cucumber: RAW → WASH → PEEL → CHOP\n2. Avocado: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Chopped Cucumber + Chopped Avocado + Cooked Rice + Nori'
            },
            'dragon_roll': {
                process: '1. Eel: RAW → WASH → COOK\n2. Avocado: RAW → WASH → PEEL → CHOP\n3. Rice: RAW → COOK\n4. Get Nori from shop\n5. PREP: Combine all ingredients',
                ingredients: 'Cooked Eel + Chopped Avocado + Cooked Rice + Nori'
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
        // Draw background color
        this.drawPixelRect(obj.x, obj.y, obj.width, obj.height, obj.color);
        
        // Draw emoji for ingredients and dishes
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        const emoji = this.getItemEmoji(obj.name);
        
        // Center the emoji
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
    
    handleMouseDown(e) {
        this.mousePos = this.getMousePos(e);
        
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
    
    handleMouseMove(e) {
        this.mousePos = this.getMousePos(e);
        
        if (this.draggedObject) {
            this.draggedObject.x = this.mousePos.x - this.draggedObject.width / 2;
            this.draggedObject.y = this.mousePos.y - this.draggedObject.height / 2;
            this.hideCanvasTooltip();
        } else {
            // Check for hover over items
            let hoveredItem = null;
            for (let i = this.gameObjects.length - 1; i >= 0; i--) {
                const obj = this.gameObjects[i];
                if ((obj.type === 'ingredient' || obj.type === 'dish') && 
                    this.isPointInRect(this.mousePos, obj)) {
                    hoveredItem = obj;
                    break;
                }
            }
            
            if (hoveredItem) {
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
                        <strong>${hoveredItem.name.toUpperCase()}</strong><br>
                        Sells for: $${hoveredItem.sellPrice}<br><br>
                        <strong>Ingredients:</strong><br>
                        ${recipeInfo.ingredients}
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
            'wash': ['salmon', 'tuna', 'eel', 'cucumber', 'avocado'],
            'peel': ['washed_cucumber', 'washed_avocado'],
            'chop': ['peeled_cucumber', 'peeled_avocado', 'washed_salmon', 'washed_tuna'],
            'cook': ['rice', 'chopped_salmon', 'chopped_tuna', 'washed_eel']
        };
        
        return processMap[stationName]?.includes(itemName) || false;
    }
    
    processIngredient(item, workstation) {
        this.removeGameObject(item);
        workstation.cooldown = workstation.maxCooldown;
        
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
        // Remove all tooltips first
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
            'salmon': '#ff6b6b',
            'washed_salmon': '#ff5252',
            'chopped_salmon': '#ff4444',
            'cooked_salmon': '#d32f2f',
            'tuna': '#8b0000',
            'washed_tuna': '#660000',
            'chopped_tuna': '#550000',
            'cooked_tuna': '#330000',
            'eel': '#4b0082',
            'washed_eel': '#5e35b1',
            'cooked_eel': '#7e57c2',
            'rice': '#f4f4f4',
            'cooked_rice': '#fff9c4',
            'nori': '#2d5016',
            'cucumber': '#4caf50',
            'washed_cucumber': '#43a047',
            'peeled_cucumber': '#388e3c',
            'chopped_cucumber': '#2e7d32',
            'avocado': '#8bc34a',
            'washed_avocado': '#7cb342',
            'peeled_avocado': '#689f38',
            'chopped_avocado': '#558b2f'
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
            // Base ingredients
            'salmon': '🐟',
            'tuna': '🐟', 
            'eel': '🦎',
            'rice': '🍚',
            'nori': '🟫',
            'cucumber': '🥒',
            'avocado': '🥑',
            
            // Washed ingredients
            'washed_salmon': '🐟',
            'washed_tuna': '🐟',
            'washed_eel': '🦎',
            'washed_cucumber': '🥒',
            'washed_avocado': '🥑',
            
            // Peeled ingredients
            'peeled_cucumber': '🥒',
            'peeled_avocado': '🥑',
            
            // Chopped ingredients
            'chopped_salmon': '🔪',
            'chopped_tuna': '🔪',
            'chopped_cucumber': '🔪',
            'chopped_avocado': '🔪',
            
            // Cooked ingredients
            'cooked_salmon': '🍣',
            'cooked_tuna': '🍣',
            'cooked_eel': '🍣',
            'cooked_rice': '🍚',
            
            // Dishes
            'Salmon Nigiri': '🍣',
            'Tuna Roll': '🍙',
            'California Roll': '🍱',
            'Dragon Roll': '🐉'
        };
        return emojis[type] || '📦';
    }
    
    startOrderGeneration() {
        setInterval(() => {
            if (this.orders.length < 3) {
                this.generateOrder();
            }
         }, 6000 + Math.random() * 3000);
        
        setTimeout(() => this.generateOrder(), 10000);
    }
    
    generateOrder() {
        const recipeKeys = Object.keys(this.recipes);
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
            nextOrderId: this.nextOrderId
        };
        localStorage.setItem('sushiGameSave', JSON.stringify(gameState));
    }
    
    loadGame() {
        const saved = localStorage.getItem('sushiGameSave');
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                this.money = gameState.money || 100;
                this.inventory = gameState.inventory || {};
                this.orders = gameState.orders || [];
                this.nextOrderId = gameState.nextOrderId || 1;
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
        this.updateCooldowns();
        this.updateOrders();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global functions
let game;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

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