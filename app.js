// Game Data & Logic
const BRAINROT_DATA = {
    'Common': { value: 1, items: ['Noobini Pizzanini', 'Lirili Larila', 'Tim Cheese', 'Flurifura', 'Talpa Di Fero', 'Svinia Bombardino', 'Pipi Kiwi', 'Racooni Jandelini', 'Pipi Corni', 'Noobini Santanini'] },
    'Rare': { value: 3, items: ['Trippi Troppi', 'Gangster Footera', 'Bandito Bobritto', 'Boneca Ambalabu', 'Cacto Hipopotamo', 'Ta Ta Ta Ta Sahur'] },
    'Brainrot God': { value: 10, items: ['Cocofanto Elefanto', 'Girafa Celestre', 'Gattatino Nyanino', 'Chihuahini Taconini', 'Los Crocodilitos', 'Money Money Man', 'Tipi Topi Taco'] },
    'Secret/OG': { value: 25, items: ['Headless Horseman', 'Love Love Bear', 'Skibidi Toilet', 'Dragon Cannelloni', 'Celestial Pegasus', 'Cooki and Milki', 'Burguro and Fryuro', 'Money Money Puggy'] }
};

let myInventory = JSON.parse(localStorage.getItem('myInventory')) || [
    'Noobini Pizzanini', 'Noobini Pizzanini', 'Pipi Kiwi', 
    'Trippi Troppi', 'Bandito Bobritto', 'Money Money Man'
];

function saveInventory() {
    localStorage.setItem('myInventory', JSON.stringify(myInventory));
}

function getRarity(itemName) {
    for (let rarity in BRAINROT_DATA) {
        if (BRAINROT_DATA[rarity].items.includes(itemName)) return rarity;
    }
    return 'Common';
}

function getRarityValue(rarity) {
    return BRAINROT_DATA[rarity].value;
}

// Mock Users
const users = [];

let activeChatUserId = null;
let chatHistory = {};

// Cross-Tab Sync via localStorage
window.addEventListener('storage', (event) => {
    if (event.key === 'market_sync_event' && event.newValue) {
        const data = JSON.parse(event.newValue);
        
        if (data.type === 'ADD_PLAYER') {
            if (data.targetUsername.toLowerCase() === myUsername.toLowerCase() && myUsername !== "Guest") {
                const existingUser = users.find(u => u.name.toLowerCase() === data.sender.name.toLowerCase());
                if (!existingUser) {
                    const newId = 'u' + (users.length + 1) + '_' + Date.now();
                    const newUser = {
                        id: newId,
                        name: data.sender.name,
                        avatar: data.sender.avatar,
                        isOnline: true,
                        status: data.sender.status
                    };
                    users.push(newUser);
                    chatHistory[newId] = [];
                    renderUserList();
                    showToast(`${data.sender.name} added you to their market! 🌐`);
                }
            }
        } else if (data.type === 'CHAT_MESSAGE') {
            if (data.targetUsername.toLowerCase() === myUsername.toLowerCase() && myUsername !== "Guest") {
                let sender = users.find(u => u.name.toLowerCase() === data.senderName.toLowerCase());
                if (!sender) {
                    const newId = 'u' + (users.length + 1) + '_' + Date.now();
                    sender = { id: newId, name: data.senderName, avatar: '🗿', isOnline: true, status: "Sigma Grindset Active" };
                    users.push(sender);
                    chatHistory[newId] = [];
                    renderUserList();
                }
                chatHistory[sender.id].push({ sender: 'them', text: data.text });
                if (activeChatUserId === sender.id) {
                    renderMessages();
                } else {
                    showToast(`New message from ${sender.name}! 💬`);
                }
            }
        } else if (data.type === 'TRADE_PROPOSAL') {
            if (data.targetUsername.toLowerCase() === myUsername.toLowerCase() && myUsername !== "Guest") {
                let sender = users.find(u => u.name.toLowerCase() === data.senderName.toLowerCase());
                if (!sender) {
                    const newId = 'u' + (users.length + 1) + '_' + Date.now();
                    sender = { id: newId, name: data.senderName, avatar: '🗿', isOnline: true, status: "Sigma Grindset Active" };
                    users.push(sender);
                    chatHistory[newId] = [];
                    renderUserList();
                }
                chatHistory[sender.id].push({
                    type: 'trade',
                    sender: 'them',
                    offer: data.offer,
                    request: data.request,
                    status: 'pending'
                });
                if (activeChatUserId === sender.id) {
                    renderMessages();
                } else {
                    showToast(`New trade proposal from ${sender.name}! 🤝`);
                }
            }
        }
    }
});

function sendSyncEvent(data) {
    if (myUsername === "Guest") return;
    data._t = Date.now();
    localStorage.setItem('market_sync_event', JSON.stringify(data));
}

function broadcastAddPlayer(targetName) {
    sendSyncEvent({
        type: 'ADD_PLAYER',
        targetUsername: targetName,
        sender: { name: myUsername, avatar: '🗿', status: "Sigma Grindset Active" }
    });
}

function broadcastMessage(targetName, text) {
    sendSyncEvent({
        type: 'CHAT_MESSAGE',
        targetUsername: targetName,
        senderName: myUsername,
        text: text
    });
}

function broadcastTrade(targetName, offer, request) {
    sendSyncEvent({
        type: 'TRADE_PROPOSAL',
        targetUsername: targetName,
        senderName: myUsername,
        offer: offer,
        request: request
    });
}

// DOM Elements
const userListEl = document.getElementById('userList');
const chatTitle = document.getElementById('chatTitle');
const chatMessagesEl = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const requestTradeBtn = document.getElementById('requestTradeBtn');
const tradeModal = document.getElementById('tradeModal');
const cancelTradeBtn = document.getElementById('cancelTradeBtn');
const confirmTradeBtn = document.getElementById('confirmTradeBtn');
const tradeTargetName = document.getElementById('tradeTargetName');
const offerBrainrot = document.getElementById('offerBrainrot');
const requestBrainrot = document.getElementById('requestBrainrot');

const inventoryBtn = document.getElementById('inventoryBtn');
const inventoryModal = document.getElementById('inventoryModal');
const closeInventoryBtn = document.getElementById('closeInventoryBtn');
const inventoryGrid = document.getElementById('inventoryGrid');
const toastContainer = document.getElementById('toastContainer');
const spawnBrainrotSelect = document.getElementById('spawnBrainrotSelect');
const spawnBrainrotBtn = document.getElementById('spawnBrainrotBtn');
const openHubBtn = document.getElementById('openHubBtn');
const playerHubModal = document.getElementById('playerHubModal');
const closeHubBtn = document.getElementById('closeHubBtn');
const searchPlayerName = document.getElementById('searchPlayerName');
const searchPlayerBtn = document.getElementById('searchPlayerBtn');
const searchResultArea = document.getElementById('searchResultArea');

const loginOverlay = document.getElementById('loginOverlay');
const robloxUsernameInput = document.getElementById('robloxUsernameInput');
const loginBtn = document.getElementById('loginBtn');
const myUsernameDisplay = document.getElementById('myUsernameDisplay');

const myProfileBtn = document.getElementById('myProfileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const profileUsername = document.getElementById('profileUsername');
const profileTotalItems = document.getElementById('profileTotalItems');
const profileSecretItems = document.getElementById('profileSecretItems');
const profileAccountValue = document.getElementById('profileAccountValue');

let myUsername = "Guest";

// Initialize
function init() {
    renderUserList();
    populateSpawnDropdown();
    setupEventListeners();
    
    // Check session storage for username (allows multi-tab testing)
    const savedUsername = sessionStorage.getItem('robloxUsername');
    if (savedUsername) {
        myUsername = savedUsername;
        myUsernameDisplay.textContent = "@" + myUsername;
        loginOverlay.classList.add('hidden');
    } else {
        robloxUsernameInput.focus();
    }
}

function handleLogin() {
    const username = robloxUsernameInput.value.trim();
    if (!username) {
        showToast("Bruh type your username 💀");
        return;
    }
    myUsername = username;
    sessionStorage.setItem('robloxUsername', myUsername);
    myUsernameDisplay.textContent = "@" + myUsername;
    loginOverlay.classList.add('hidden');
    showToast(`Welcome to the Market, ${myUsername}! 🚀`);
}

function populateSpawnDropdown() {
    spawnBrainrotSelect.innerHTML = '';
    
    for (let rarity in BRAINROT_DATA) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = rarity;
        
        BRAINROT_DATA[rarity].items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = `${item} (${rarity})`;
            optgroup.appendChild(opt);
        });
        
        spawnBrainrotSelect.appendChild(optgroup);
    }
}

function renderUserList() {
    userListEl.innerHTML = '';
    users.forEach(user => {
        const card = document.createElement('div');
        card.className = `user-card ${user.id === activeChatUserId ? 'active' : ''}`;
        card.onclick = () => openChat(user.id);
        
        card.innerHTML = `
            <div class="avatar">${user.avatar}</div>
            <div class="details">
                <h4>${user.name} ${user.isOnline ? '🟢' : '⚪'}</h4>
                <p>${user.status}</p>
            </div>
        `;
        userListEl.appendChild(card);
    });
}

function openChat(userId) {
    activeChatUserId = userId;
    const user = users.find(u => u.id === userId);
    
    renderUserList();
    chatTitle.textContent = `Chat with ${user.name}`;
    requestTradeBtn.classList.remove('hidden');
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
    
    if (!chatHistory[userId]) chatHistory[userId] = [];
    renderMessages();
}

function renderMessages() {
    chatMessagesEl.innerHTML = '';
    const messages = chatHistory[activeChatUserId] || [];
    
    if (messages.length === 0) {
        chatMessagesEl.innerHTML = `<div class="empty-state">No messages history. Send a message to start trading!</div>`;
        return;
    }
    
    messages.forEach(msg => {
        if(msg.type === 'trade') {
            appendTradeCard(msg);
        } else {
            const el = document.createElement('div');
            el.className = `message ${msg.sender}`;
            el.textContent = msg.text;
            chatMessagesEl.appendChild(el);
        }
    });
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || !activeChatUserId) return;
    
    chatHistory[activeChatUserId].push({ sender: 'me', text });
    
    const targetUser = users.find(u => u.id === activeChatUserId);
    if (targetUser) {
        broadcastMessage(targetUser.name, text);
    }
    
    chatInput.value = '';
    renderMessages();
}

// Inventory Logic
function openInventory() {
    renderInventory();
    inventoryModal.classList.remove('hidden');
}

function closeInventory() {
    inventoryModal.classList.add('hidden');
}

function renderInventory() {
    inventoryGrid.innerHTML = '';
    const uniqueItems = [...new Set(myInventory)];
    
    if (uniqueItems.length === 0) {
        inventoryGrid.innerHTML = "<p>Your inventory is empty! 💀</p>";
        return;
    }

    uniqueItems.forEach(item => {
        const count = myInventory.filter(i => i === item).length;
        const rarity = getRarity(item);
        const rarityClass = `rarity-${rarity.toLowerCase().replace('/', '-').replace(' ', '-')}`;
        
        const card = document.createElement('div');
        card.className = 'inventory-item';
        card.innerHTML = `
            <div class="item-name ${rarityClass}">${item}</div>
            <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 5px;">${rarity}</div>
            <div class="item-count">Owned: ${count}</div>
        `;
        inventoryGrid.appendChild(card);
    });
}

// Profile Logic
function openProfileModal() {
    profileUsername.textContent = "@" + myUsername;
    
    // Calculate stats
    profileTotalItems.textContent = myInventory.length;
    
    let secretCount = 0;
    let totalValue = 0;
    
    myInventory.forEach(item => {
        const rarity = getRarity(item);
        if (rarity === 'Secret/OG') secretCount++;
        totalValue += getRarityValue(rarity);
    });
    
    profileSecretItems.textContent = secretCount;
    profileAccountValue.textContent = (totalValue * 100) + " Aura";
    
    profileModal.classList.remove('hidden');
}

function closeProfileModal() {
    profileModal.classList.add('hidden');
}

// Player Hub Logic
function openHubModal() {
    searchPlayerName.value = '';
    searchResultArea.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Search for a player to add them.</p>';
    playerHubModal.classList.remove('hidden');
    searchPlayerName.focus();
}

function closeHubModal() {
    playerHubModal.classList.add('hidden');
}

function searchPlayer() {
    const name = searchPlayerName.value.trim();
    if (!name) return;
    
    searchResultArea.innerHTML = `<p style="color: var(--primary-neon);" class="pulse-animation">Searching database...</p>`;
    
    setTimeout(() => {
        // Create mock user result
        const avatars = ['🤖', '👽', '👻', '🤡', '👺', '🤠', '😎', '🤓', '🤑', '🥺', '😈'];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        const statuses = ["Trading OG Brainrots", "Looking for W supply", "Away", "Only taking Ws"];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (existingUser) {
            searchResultArea.innerHTML = `<p style="color: #ff3366;">Player is already in your active market.</p>`;
            return;
        }

        searchResultArea.innerHTML = `
            <div class="user-card" style="width: 100%; justify-content: space-between; cursor: default; background: rgba(0,0,0,0.3); border: 1px solid var(--primary-neon);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="avatar" style="font-size: 2.5rem;">${randomAvatar}</div>
                    <div class="details" style="text-align: left;">
                        <h4 style="margin:0; font-size: 1.2rem;">${name} 🟢</h4>
                        <p style="margin:0; font-size: 0.9rem; color: var(--text-muted);">${randomStatus}</p>
                    </div>
                </div>
                <button id="addAndMessageBtn" class="btn primary-btn magic-hover" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Message</button>
            </div>
        `;
        
        document.getElementById('addAndMessageBtn').addEventListener('click', () => {
            const newId = 'u' + (users.length + 1) + '_' + Date.now();
            const newUser = {
                id: newId,
                name: name,
                avatar: randomAvatar,
                isOnline: true,
                status: randomStatus
            };
            
            users.push(newUser);
            chatHistory[newId] = [];
            
            renderUserList();
            closeHubModal();
            openChat(newId); // Redirect directly to the messaging UI
            showToast(`Connected with ${name}! 🌐`);
            
            // Broadcast that we added them!
            broadcastAddPlayer(name);
        });
    }, 600);
}

// Trade Logic
function openTradeModal() {
    if (myInventory.length === 0) {
        showToast("You don't have any Brainrots to trade! 💀");
        return;
    }
    
    const user = users.find(u => u.id === activeChatUserId);
    tradeTargetName.textContent = user.name;
    
    // Populate Offer Dropdown with OWNED items only
    offerBrainrot.innerHTML = '';
    const uniqueItems = [...new Set(myInventory)];
    uniqueItems.forEach(item => {
        const count = myInventory.filter(i => i === item).length;
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = `${item} (x${count})`;
        offerBrainrot.appendChild(opt);
    });
    
    tradeModal.classList.remove('hidden');
}

function closeTradeModal() {
    tradeModal.classList.add('hidden');
}

function proposeTrade() {
    const offerVal = offerBrainrot.value;
    const reqVal = requestBrainrot.value;
    
    if (!offerVal || !reqVal) return;
    if (!myInventory.includes(offerVal)) {
        showToast("You don't own that item! 💀");
        closeTradeModal();
        return;
    }
    
    const tradeData = {
        type: 'trade',
        sender: 'me',
        offer: offerVal,
        request: reqVal,
        status: 'pending'
    };
    
    chatHistory[activeChatUserId].push(tradeData);
    
    const targetUser = users.find(u => u.id === activeChatUserId);
    if (targetUser) {
        broadcastTrade(targetUser.name, offerVal, reqVal);
    }
    
    renderMessages();
    closeTradeModal();
    showToast(`Trade proposal sent! 🚀`);
}

function updateTradeStatus(userId, tradeData, status) {
    const tradeIndex = chatHistory[userId].lastIndexOf(tradeData);
    if(tradeIndex !== -1) {
        chatHistory[userId][tradeIndex].status = status;
    }
}

function appendTradeCard(msg) {
    const card = document.createElement('div');
    card.className = `message ${msg.sender} trade-proposal-card`;
    
    let statusBadge = "⏳ Request Sent";
    let statusColor = "var(--text-main)";
    
    if(msg.status === 'accepted') {
        statusBadge = "✅ Accepted";
        statusColor = "var(--primary-neon)";
    }
    if(msg.status === 'declined') {
        statusBadge = "❌ Declined";
        statusColor = "#ff3366";
    }
    
    card.innerHTML = `
        <h4>🤝 Trade Proposal</h4>
        <div class="trade-details">
            <p><strong>Offer:</strong> ${msg.offer}</p>
            <p><strong>Request:</strong> ${msg.request}</p>
        </div>
        <div style="font-size: 0.8rem; font-weight: bold; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.1); color: ${statusColor}">
            Status: ${statusBadge}
        </div>
    `;
    
    chatMessagesEl.appendChild(card);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if(toast.parentElement) toast.remove();
    }, 4500);
}

function spawnBrainrot() {
    const item = spawnBrainrotSelect.value;
    if (item) {
        myInventory.push(item);
        saveInventory();
        renderInventory();
        showToast(`Added ${item} to your inventory! 🪄`);
    }
}

function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    inventoryBtn.addEventListener('click', openInventory);
    closeInventoryBtn.addEventListener('click', closeInventory);
    inventoryModal.addEventListener('click', (e) => {
        if (e.target === inventoryModal) closeInventory();
    });

    requestTradeBtn.addEventListener('click', openTradeModal);
    cancelTradeBtn.addEventListener('click', closeTradeModal);
    confirmTradeBtn.addEventListener('click', proposeTrade);
    tradeModal.addEventListener('click', (e) => {
        if (e.target === tradeModal) closeTradeModal();
    });
    
    spawnBrainrotBtn.addEventListener('click', spawnBrainrot);
    
    openHubBtn.addEventListener('click', openHubModal);
    closeHubBtn.addEventListener('click', closeHubModal);
    searchPlayerBtn.addEventListener('click', searchPlayer);
    searchPlayerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPlayer();
    });
    playerHubModal.addEventListener('click', (e) => {
        if (e.target === playerHubModal) closeHubModal();
    });
    
    myProfileBtn.addEventListener('click', openProfileModal);
    closeProfileBtn.addEventListener('click', closeProfileModal);
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) closeProfileModal();
    });
    
    loginBtn.addEventListener('click', handleLogin);
    robloxUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

// Start app
init();
