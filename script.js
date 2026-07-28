const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;

const SPLASH_DURATION = 3800;
const splashDone = new Promise(resolve => setTimeout(resolve, SPLASH_DURATION));

const WORKER_URL = 'https://games-verse.scarneb.workers.dev';
const HADRON_CHANNEL = 'https://t.me/+GNfQDYSAYc4wNDBi';

let vibrationEnabled = true;

// Тестовые данные промтов (замени на свои изображения и описания)
const PROMPTS_DATA = [
    {
        id: 1,
        name: "Генератор логотипов",
        description: "Создай профессиональный логотип за минуту",
        price: 50,
        image: "images/prompt-logo.jpg",
        fallback: "🎨",
        badge: "Хит",
        highlight: true
    },
    {
        id: 2,
        name: "Сценарий для Reels",
        description: "Вирусные идеи для TikTok и Instagram",
        price: 35,
        image: "images/prompt-reels.jpg",
        fallback: "🎬"
    },
    {
        id: 3,
        name: "SEO-тексты",
        description: "Статьи и описания с высокой конверсией",
        price: 75,
        image: "images/prompt-seo.jpg",
        fallback: "📝"
    },
    {
        id: 4,
        name: "Арт в стиле Midjourney",
        description: "Детальные промты для генерации артов",
        price: 120,
        image: "images/prompt-art.jpg",
        fallback: "🖼️",
        badge: "Премиум"
    },
    {
        id: 5,
        name: "Промт для кода",
        description: "Генерация чистого кода на любом языке",
        price: 90,
        image: "images/prompt-code.jpg",
        fallback: "💻"
    }
];

// Купленные промты (id)
const purchasedPrompts = new Set();

const translations = {
    appTitle: "PromptVerse",
    settings: "Настройки",
    theme: "Тема",
    lightTheme: "Светлая",
    darkTheme: "Темная",
    done: "Готово",
    shop: "Магазин",
    purchases: "Покупки",
    buy: "Купить",
    bought: "Куплено",
    price: "⭐",
    shareWithFriends: "Поделиться с друзьями",
    profile: "Профиль",
    linkCopied: "Ссылка скопирована в буфер обмена!",
    emptyPurchases: "Вы ещё ничего не купили",
    invoiceError: "Не удалось создать счёт. Попробуйте позже."
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function vibrate() {
    if (!vibrationEnabled) return;
    if (navigator.vibrate) navigator.vibrate(30);
}

function initializeApp() {
    // Splash screen
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('splash-fade-out');
            splash.addEventListener('transitionend', () => {
                splash.style.display = 'none';
            }, { once: true });
        }, 3200);
    }

    document.body.style.opacity = '1';

    initializeTelegramWebApp();
    setupNavigation();
    initializeShop();
    setupSettingsPanel();
    loadThemePreference();
    loadVibrationPreference();
    setLanguage();
    loadUserData();
    setupShareButton();
    setupSubscribeModal();
    loadPurchases(); // загружаем покупки (с сервера или из localStorage)
}

// ===== Подписка на канал =====
function showSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    if (modal) modal.classList.add('active');
}
function hideSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    if (modal) modal.classList.remove('active');
}

async function checkSubscriptionAndShowModal() {
    if (!currentUserId) return;
    try {
        const res = await fetch(WORKER_URL + '/check-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId.toString() })
        });
        if (!res.ok) {
            showSubscribeModal();
            return;
        }
        const data = await res.json();
        if (data.subscribed) {
            hideSubscribeModal();
        } else {
            showSubscribeModal();
        }
    } catch (err) {
        console.error('Ошибка проверки подписки:', err);
        showSubscribeModal();
    }
}

function setupSubscribeModal() {
    const okBtn = document.getElementById('subscribe-ok');
    const laterBtn = document.getElementById('subscribe-later');
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            vibrate();
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.openTelegramLink(HADRON_CHANNEL);
            } else {
                window.open(HADRON_CHANNEL, '_blank');
            }
            hideSubscribeModal();
        });
    }
    if (laterBtn) {
        laterBtn.addEventListener('click', () => {
            vibrate();
            hideSubscribeModal();
        });
    }
}

// ===== Telegram WebApp =====
function initializeTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        const themeParams = tg.themeParams;
        if (themeParams) {
            if (themeParams.bg_color) document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
            if (themeParams.text_color) document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
            if (themeParams.button_color) document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color);
            if (themeParams.button_text_color) document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
        }
    }
}

// ===== Магазин =====
function initializeShop() {
    const shopGrid = document.getElementById('shop-grid');
    if (!shopGrid) return;
    shopGrid.innerHTML = PROMPTS_DATA.map(prompt => {
        const isBought = purchasedPrompts.has(prompt.id);
        return `
        <div class="shop-card ${prompt.highlight ? 'highlight' : ''}" data-prompt-id="${prompt.id}">
            <div class="prompt-image">
                <img src="${prompt.image}" alt="${prompt.name}" class="prompt-img" onerror="this.style.display='none'">
                <div class="image-fallback">${prompt.fallback}</div>
            </div>
            <div class="prompt-info">
                <div class="prompt-header">
                    <h3>${prompt.name}</h3>
                    ${prompt.badge ? `<span class="prompt-badge">${prompt.badge}</span>` : ''}
                </div>
                <p class="prompt-description">${prompt.description}</p>
                <div class="prompt-price-row">
                    <span class="price-tag">⭐ ${prompt.price}</span>
                    <button class="buy-button" data-id="${prompt.id}" data-price="${prompt.price}" ${isBought ? 'disabled' : ''}>
                        ${isBought ? 'Куплено' : 'Купить'}
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    setupBuyButtons();
}

function setupBuyButtons() {
    document.querySelectorAll('.buy-button:not([disabled])').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const promptId = parseInt(this.getAttribute('data-id'));
            const price = parseInt(this.getAttribute('data-price'));
            if (purchasedPrompts.has(promptId)) return;
            initiatePurchase(promptId, price, this);
        });
    });
}

async function initiatePurchase(promptId, price, buttonElement) {
    if (!currentUserId) {
        showNotification('Авторизуйтесь в Telegram');
        return;
    }
    buttonElement.disabled = true;
    buttonElement.textContent = '...';
    try {
        const response = await fetch(WORKER_URL + '/create-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId.toString(),
                promptId: promptId,
                price: price
            })
        });
        if (!response.ok) throw new Error('Invoice creation failed');
        const data = await response.json();
        if (data.invoice_url) {
            // Открываем инвойс в Telegram
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.openTelegramLink(data.invoice_url);
            } else {
                window.open(data.invoice_url, '_blank');
            }
            // Оптимистично помечаем как купленный (сервер подтвердит при следующей загрузке)
            addPurchasedPrompt(promptId);
            refreshShopButtons();
            renderPurchases();
        } else {
            throw new Error('No invoice_url');
        }
    } catch (error) {
        console.error('Ошибка покупки:', error);
        showNotification(translations.invoiceError);
        buttonElement.disabled = false;
        buttonElement.textContent = 'Купить';
    }
}

function addPurchasedPrompt(promptId) {
    purchasedPrompts.add(promptId);
    const stored = localStorage.getItem('purchasedPrompts');
    let arr = stored ? JSON.parse(stored) : [];
    if (!arr.includes(promptId)) {
        arr.push(promptId);
        localStorage.setItem('purchasedPrompts', JSON.stringify(arr));
    }
}

function refreshShopButtons() {
    document.querySelectorAll('.buy-button').forEach(btn => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (purchasedPrompts.has(id)) {
            btn.disabled = true;
            btn.textContent = 'Куплено';
        }
    });
}

// ===== Покупки =====
function loadPurchases() {
    // Пытаемся загрузить с сервера, иначе берём из localStorage
    if (currentUserId) {
        fetch(WORKER_URL + '/purchases?userId=' + currentUserId)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.purchases)) {
                    data.purchases.forEach(id => purchasedPrompts.add(id));
                    // обновим localStorage
                    localStorage.setItem('purchasedPrompts', JSON.stringify(data.purchases));
                }
            })
            .catch(() => {
                loadPurchasesFromLocalStorage();
            })
            .finally(() => {
                renderPurchases();
                refreshShopButtons();
            });
    } else {
        loadPurchasesFromLocalStorage();
        renderPurchases();
        refreshShopButtons();
    }
}

function loadPurchasesFromLocalStorage() {
    const stored = localStorage.getItem('purchasedPrompts');
    if (stored) {
        try {
            const ids = JSON.parse(stored);
            ids.forEach(id => purchasedPrompts.add(id));
        } catch (e) {}
    }
}

function renderPurchases() {
    const container = document.getElementById('purchases-list');
    if (!container) return;
    const boughtPrompts = PROMPTS_DATA.filter(p => purchasedPrompts.has(p.id));
    if (boughtPrompts.length === 0) {
        container.innerHTML = `<div class="empty-state">${translations.emptyPurchases}</div>`;
        return;
    }
    container.innerHTML = boughtPrompts.map(prompt => `
        <div class="purchase-card">
            <div class="prompt-image">
                <img src="${prompt.image}" alt="${prompt.name}" class="prompt-img" onerror="this.style.display='none'">
                <div class="image-fallback">${prompt.fallback}</div>
            </div>
            <div class="prompt-info">
                <div class="prompt-header">
                    <h3>${prompt.name}</h3>
                    ${prompt.badge ? `<span class="prompt-badge">${prompt.badge}</span>` : ''}
                </div>
                <p class="prompt-description">${prompt.description}</p>
                <div class="prompt-price-row">
                    <span class="price-tag" style="color: var(--text-secondary-light);">Куплено</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Профиль =====
function loadUserData() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateProfileDisplay(user);
            currentUserId = user.id;
            sendMiniAppStat(user);
            splashDone.then(() => checkSubscriptionAndShowModal());
        } else {
            showFallbackProfile();
            currentUserId = null;
            splashDone.then(() => showSubscribeModal());
        }
    } else {
        showFallbackProfile();
        currentUserId = null;
        splashDone.then(() => showSubscribeModal());
    }
}

async function sendMiniAppStat(user) {
    if (!user || !user.id) return;
    let ref = null;
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            const startParam = window.Telegram.WebApp.initDataUnsafe?.start_param;
            if (startParam) ref = startParam;
        }
    } catch (e) {}
    const payload = {
        userId: user.id.toString(),
        firstName: user.first_name || '',
        username: user.username || '',
        ref: ref || null
    };
    try {
        await fetch(WORKER_URL + '/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Ошибка отправки статистики Mini App:', err);
    }
}

function updateProfileDisplay(user) {
    const userName = document.getElementById('user-name');
    if (userName) userName.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    const userUsername = document.getElementById('user-username');
    if (userUsername) userUsername.textContent = user.username ? '@' + user.username : 'Telegram User';
    updateUserAvatar(user);
    if (user.is_premium) showPremiumBadge();
}

function updateUserAvatar(user) {
    const avatarImg = document.getElementById('avatar-img');
    const avatarFallback = document.getElementById('avatar-fallback');
    if (!avatarImg) return;
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
        avatarImg.style.display = 'block';
        avatarImg.onerror = () => { avatarImg.style.display = 'none'; showAvatarFallback(user, avatarFallback); };
        avatarFallback.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        showAvatarFallback(user, avatarFallback);
    }
}

function showAvatarFallback(user, avatarFallback) {
    if (user.first_name) avatarFallback.textContent = user.first_name.charAt(0).toUpperCase();
    else avatarFallback.textContent = 'T';
    avatarFallback.style.display = 'flex';
}

function showPremiumBadge() {
    const profileInfo = document.querySelector('.profile-info');
    if (profileInfo && !document.querySelector('.premium-badge')) {
        const premiumBadge = document.createElement('div');
        premiumBadge.className = 'premium-badge';
        premiumBadge.innerHTML = '⭐ Premium';
        profileInfo.appendChild(premiumBadge);
    }
}

function showFallbackProfile() {
    const userName = document.getElementById('user-name');
    const userUsername = document.getElementById('user-username');
    const avatarFallback = document.getElementById('avatar-fallback');
    if (userName) userName.textContent = 'Telegram User';
    if (userUsername) userUsername.textContent = 'Открой в Telegram';
    if (avatarFallback) { avatarFallback.textContent = 'T'; avatarFallback.style.display = 'flex'; }
}

const headerElement = document.querySelector('.header');
const mainContent = document.querySelector('.main-content');

function toggleHeaderForSection(sectionId) {
    if (!headerElement) return;
    if (sectionId === 'profile-section') {
        headerElement.style.display = 'none';
        if (mainContent) mainContent.style.paddingTop = '8px';
    } else {
        headerElement.style.display = 'block';
        if (mainContent) mainContent.style.paddingTop = '';
    }
}

// ===== Навигация =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const targetSection = this.getAttribute('data-section');
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) section.classList.add('active');
            });
            toggleHeaderForSection(targetSection);
            hideSubscribeModal();
            if (targetSection === 'purchases-section') {
                renderPurchases(); // обновить список
            }
            if (targetSection === 'shop-section') {
                refreshShopButtons(); // актуализировать кнопки
            }
        });
    });

    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) toggleHeaderForSection(activeSection.id);
}

// ===== Настройки =====
function setupSettingsPanel() {
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    if (settingsButton) settingsButton.addEventListener('click', () => { vibrate(); settingsPanel.classList.add('active'); });
    if (closeSettings) closeSettings.addEventListener('click', () => { vibrate(); settingsPanel.classList.remove('active'); });
    if (settingsPanel) settingsPanel.addEventListener('click', (e) => { if (e.target === settingsPanel) settingsPanel.classList.remove('active'); });

    document.querySelectorAll('.theme-option[data-theme]').forEach(option => {
        option.addEventListener('click', function() {
            vibrate();
            const theme = this.getAttribute('data-theme');
            document.querySelectorAll('.theme-option[data-theme]').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            if (theme === 'dark') document.body.classList.add('dark-theme');
            else document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', theme);
        });
    });

    const vibrationOptions = document.querySelectorAll('.theme-option[data-vibration]');
    vibrationOptions.forEach(option => {
        option.addEventListener('click', function() {
            vibrate();
            const state = this.getAttribute('data-vibration');
            vibrationEnabled = (state === 'on');
            localStorage.setItem('vibration', state);
            updateVibrationSwitcherUI();
        });
    });
    updateVibrationSwitcherUI();
}

function updateVibrationSwitcherUI() {
    const vibrationOptions = document.querySelectorAll('.theme-option[data-vibration]');
    if (!vibrationOptions.length) return;
    vibrationOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-vibration') === (vibrationEnabled ? 'on' : 'off')) {
            opt.classList.add('active');
        }
    });
}

function loadVibrationPreference() {
    const saved = localStorage.getItem('vibration');
    if (saved === 'off') vibrationEnabled = false;
    else vibrationEnabled = true;
    updateVibrationSwitcherUI();
}

function setLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) element.textContent = translations[key];
    });
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');
    document.querySelectorAll('.theme-option[data-theme]').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-theme') === savedTheme) opt.classList.add('active');
    });
}

// ===== Поделиться =====
function setupShareButton() {
    const shareButton = document.getElementById('share-friends-button');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            vibrate();
            let botUrl;
            if (currentUserId) {
                botUrl = `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`;
            } else {
                botUrl = `https://t.me/${BOT_USERNAME}`;
            }
            const shareText = 'Лучшие промты для нейросетей в одном месте! 🚀';
            if (window.Telegram && window.Telegram.WebApp) {
                const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(shareText)}`;
                try {
                    window.Telegram.WebApp.openTelegramLink(shareUrl);
                } catch (error) {
                    fallbackCopyToClipboard(botUrl);
                }
            } else {
                if (navigator.share) {
                    navigator.share({
                        title: 'PromptVerse',
                        text: shareText,
                        url: botUrl,
                    }).catch(() => fallbackCopyToClipboard(botUrl));
                } else {
                    fallbackCopyToClipboard(botUrl);
                }
            }
        });
    }
}

function fallbackCopyToClipboard(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification();
    } catch (err) {
        showNotification('Не удалось скопировать ссылку');
    }
}

function showNotification(customMessage) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = customMessage || translations.linkCopied;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}
