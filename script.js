const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const SPLASH_DURATION = 3800;
const splashDone = new Promise(resolve => setTimeout(resolve, SPLASH_DURATION));
const WORKER_URL = 'https://games-verse.scarneb.workers.dev';
const HADRON_CHANNEL = 'https://t.me/+GNfQDYSAYc4wNDBi';
let vibrationEnabled = true;

const PROMPTS_DATA = [
    {
        id: 1,
        name: "Логотип за минуту",
        description: "Генерация логотипа через DALL·E 3",
        price: 50,
        image: "images/prompt-logo.jpg",
        fallback: "🎨",
        badge: "Хит",
        highlight: true,
        promptText: `Создай минималистичный логотип для IT-стартапа в стиле плоского дизайна. Цвета: синий и белый. Иконка должна символизировать скорость и технологии.`
    },
    {
        id: 2,
        name: "Вирусный Reels",
        description: "Сценарий для TikTok/Instagram",
        price: 35,
        image: "images/prompt-reels.jpg",
        fallback: "🎬",
        promptText: `Напиши сценарий 15-секундного ролика для TikTok на тему «утренняя рутина продуктивного человека». Должен быть динамичный монтаж, трендовая музыка.`
    },
    {
        id: 3,
        name: "SEO статья",
        description: "Текст для блога с ключами",
        price: 75,
        image: "images/prompt-seo.jpg",
        fallback: "📝",
        promptText: `Напиши SEO-оптимизированную статью на 1000 слов о пользе медитации. Ключевые слова: медитация для начинающих, польза медитации, как медитировать.`
    },
    {
        id: 4,
        name: "Midjourney Арт",
        description: "Промт для фотореализма",
        price: 120,
        image: "images/prompt-art.jpg",
        fallback: "🖼️",
        badge: "Премиум",
        promptText: `A cyberpunk samurai standing on a rooftop at night, neon lights reflecting on wet asphalt, cinematic lighting, 8k, hyperdetailed, --ar 16:9 --stylize 750`
    },
    {
        id: 5,
        name: "Код на Python",
        description: "Генерация чистого кода",
        price: 90,
        image: "images/prompt-code.jpg",
        fallback: "💻",
        promptText: `Напиши Python скрипт для парсинга цен с сайта объявлений. Используй requests и BeautifulSoup. Добавь обработку ошибок и сохранение в CSV.`
    },
    {
        id: 6,
        name: "Резюме LinkedIn",
        description: "Профессиональное резюме",
        price: 45,
        image: "images/prompt-resume.jpg",
        fallback: "📄",
        promptText: `Составь профессиональное резюме для frontend-разработчика с 5-летним опытом. Включи навыки React, TypeScript, опыт работы в стартапе.`
    }
];

const purchasedPrompts = new Set();

document.addEventListener('DOMContentLoaded', () => initializeApp());

function vibrate() {
    if (!vibrationEnabled) return;
    if (navigator.vibrate) navigator.vibrate(30);
}

function initializeApp() {
    // Splash
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('splash-fade-out');
            splash.addEventListener('transitionend', () => { splash.style.display = 'none'; }, { once: true });
        }, 3200);
    }
    document.body.style.opacity = '1';

    initializeTelegramWebApp();
    setupNavigation();
    initializeShop();
    setupSettingsPanel();
    loadThemePreference();
    loadVibrationPreference();
    loadUserData();
    setupShareButton();
    setupSubscribeModal();
    setupPromptModal();
    loadPurchases();
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
        if (!res.ok) { showSubscribeModal(); return; }
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

// ===== Навигация =====
const headerElement = document.querySelector('.header');
const mainContentEl = document.querySelector('.main-content');

function toggleHeaderForSection(sectionId) {
    if (!headerElement) return;
    if (sectionId === 'profile-section') {
        headerElement.style.display = 'none';
        if (mainContentEl) mainContentEl.style.paddingTop = '8px';
    } else {
        headerElement.style.display = 'block';
        if (mainContentEl) mainContentEl.style.paddingTop = '';
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const target = this.dataset.section;
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => {
                if (s.id === target) s.classList.add('active');
                else s.classList.remove('active');
            });
            toggleHeaderForSection(target);
            hideSubscribeModal();
            if (target === 'purchases-section') renderPurchases();
            if (target === 'shop-section') refreshShopButtons();
        });
    });
    const active = document.querySelector('.content-section.active');
    if (active) toggleHeaderForSection(active.id);
}

// ===== Магазин =====
function initializeShop() {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = PROMPTS_DATA.map(p => {
        const bought = purchasedPrompts.has(p.id);
        return `
        <div class="shop-card ${p.highlight ? 'highlight' : ''}">
            <div class="prompt-image">
                <img src="${p.image}" class="prompt-img" onerror="this.style.display='none'">
                <span class="image-fallback">${p.fallback}</span>
            </div>
            <div class="prompt-info">
                <div class="prompt-name">${p.name}</div>
                ${p.badge ? `<div class="prompt-badge">${p.badge}</div>` : ''}
                <div class="prompt-desc">${p.description}</div>
                <div class="prompt-footer">
                    <span class="price-tag">⭐ ${p.price}</span>
                    <button class="buy-button" data-id="${p.id}" ${bought ? 'disabled' : ''}>${bought ? 'Куплено' : 'Купить'}</button>
                </div>
            </div>
        </div>`;
    }).join('');
    setupBuyButtons();
}

function setupBuyButtons() {
    document.querySelectorAll('.buy-button:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            vibrate();
            const id = parseInt(btn.dataset.id);
            const prompt = PROMPTS_DATA.find(p => p.id === id);
            if (prompt && !purchasedPrompts.has(id)) {
                // Показываем модальное окно с промтом (без реальной оплаты)
                showPromptModal(prompt);
                addPurchasedPrompt(id);
                refreshShopButtons();
                renderPurchases();
            }
        });
    });
}

function refreshShopButtons() {
    document.querySelectorAll('.buy-button').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        if (purchasedPrompts.has(id)) {
            btn.disabled = true;
            btn.textContent = 'Куплено';
        }
    });
}

// ===== Модальное окно с текстом промта =====
function setupPromptModal() {
    const modal = document.getElementById('prompt-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-prompt-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    const copyBtn = document.getElementById('copy-prompt-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textEl = document.getElementById('modal-prompt-text');
            if (textEl) {
                navigator.clipboard.writeText(textEl.textContent).then(() => {
                    showNotification('Промт скопирован!');
                }).catch(() => {
                    showNotification('Не удалось скопировать');
                });
            }
        });
    }
}

function showPromptModal(prompt) {
    const modal = document.getElementById('prompt-modal');
    if (!modal) return;
    document.getElementById('modal-prompt-name').textContent = prompt.name;
    document.getElementById('modal-prompt-desc').textContent = prompt.description;
    document.getElementById('modal-prompt-text').textContent = prompt.promptText;
    modal.classList.add('active');
}

// ===== Покупки =====
function addPurchasedPrompt(id) {
    purchasedPrompts.add(id);
    const stored = JSON.parse(localStorage.getItem('purchasedPrompts') || '[]');
    if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem('purchasedPrompts', JSON.stringify(stored));
    }
}

function loadPurchases() {
    if (currentUserId) {
        fetch(WORKER_URL + '/purchases?userId=' + currentUserId)
            .then(res => res.json())
            .then(data => {
                if (data && data.purchases) {
                    data.purchases.forEach(id => purchasedPrompts.add(id));
                    localStorage.setItem('purchasedPrompts', JSON.stringify(data.purchases));
                }
            })
            .catch(() => loadPurchasesFromLocalStorage())
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
            JSON.parse(stored).forEach(id => purchasedPrompts.add(id));
        } catch(e) {}
    }
}

function renderPurchases() {
    const container = document.getElementById('purchases-list');
    if (!container) return;
    const bought = PROMPTS_DATA.filter(p => purchasedPrompts.has(p.id));
    if (bought.length === 0) {
        container.innerHTML = `<div class="empty-state">Вы ещё ничего не купили</div>`;
        return;
    }
    container.innerHTML = bought.map(p => `
        <div class="purchase-card">
            <div class="prompt-image">
                <img src="${p.image}" class="prompt-img" onerror="this.style.display='none'">
                <span class="image-fallback">${p.fallback}</span>
            </div>
            <div class="prompt-info">
                <div class="prompt-name">${p.name}</div>
                <div class="prompt-desc">${p.description}</div>
                <div class="prompt-footer" style="justify-content:center; color:var(--text-secondary-light);">Куплено</div>
            </div>
        </div>
    `).join('');
}

// ===== Профиль пользователя =====
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
            ref = window.Telegram.WebApp.initDataUnsafe?.start_param;
        }
    } catch(e) {}
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
    } catch(e) {
        console.error('Ошибка отправки статистики:', e);
    }
}

function updateProfileDisplay(user) {
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
    const userUsernameEl = document.getElementById('user-username');
    if (userUsernameEl) {
        userUsernameEl.textContent = user.username ? '@' + user.username : 'Telegram User';
    }
    updateUserAvatar(user);
    if (user.is_premium && !document.querySelector('.premium-badge')) {
        const badge = document.createElement('div');
        badge.className = 'premium-badge';
        badge.innerHTML = '⭐ Premium';
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo) profileInfo.appendChild(badge);
    }
}

function updateUserAvatar(user) {
    const img = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (!img || !fallback) return;
    if (user.photo_url) {
        img.src = user.photo_url;
        img.style.display = 'block';
        img.onerror = () => {
            img.style.display = 'none';
            fallback.textContent = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'T';
            fallback.style.display = 'flex';
        };
        fallback.style.display = 'none';
    } else {
        img.style.display = 'none';
        fallback.textContent = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'T';
        fallback.style.display = 'flex';
    }
}

function showFallbackProfile() {
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = 'Telegram User';
    const userUsernameEl = document.getElementById('user-username');
    if (userUsernameEl) userUsernameEl.textContent = 'Открой в Telegram';
    const fallback = document.getElementById('avatar-fallback');
    if (fallback) {
        fallback.textContent = 'T';
        fallback.style.display = 'flex';
    }
}

// ===== Шеринг =====
function setupShareButton() {
    const shareBtn = document.getElementById('share-friends-button');
    if (!shareBtn) return;
    shareBtn.addEventListener('click', () => {
        vibrate();
        const botUrl = currentUserId
            ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`
            : `https://t.me/${BOT_USERNAME}`;
        const shareText = 'Лучшие промты для нейросетей в одном месте! 🚀';
        if (window.Telegram && window.Telegram.WebApp) {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(shareText)}`;
            try {
                window.Telegram.WebApp.openTelegramLink(shareUrl);
            } catch (error) {
                fallbackCopyToClipboard(botUrl);
            }
        } else if (navigator.share) {
            navigator.share({ title: 'PromptVerse', text: shareText, url: botUrl })
                .catch(() => fallbackCopyToClipboard(botUrl));
        } else {
            fallbackCopyToClipboard(botUrl);
        }
    });
}

function fallbackCopyToClipboard(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showNotification();
}

// ===== Настройки =====
function setupSettingsPanel() {
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');

    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            vibrate();
            if (settingsPanel) settingsPanel.classList.add('active');
        });
    }
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            vibrate();
            if (settingsPanel) settingsPanel.classList.remove('active');
        });
    }
    if (settingsPanel) {
        settingsPanel.addEventListener('click', (e) => {
            if (e.target === settingsPanel) settingsPanel.classList.remove('active');
        });
    }

    document.querySelectorAll('.theme-option[data-theme]').forEach(opt => {
        opt.addEventListener('click', function() {
            vibrate();
            const theme = this.dataset.theme;
            document.querySelectorAll('.theme-option[data-theme]').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            localStorage.setItem('theme', theme);
        });
    });

    document.querySelectorAll('.theme-option[data-vibration]').forEach(opt => {
        opt.addEventListener('click', function() {
            vibrate();
            const state = this.dataset.vibration;
            vibrationEnabled = (state === 'on');
            localStorage.setItem('vibration', state);
            updateVibrationSwitcherUI();
        });
    });
    updateVibrationSwitcherUI();
}

function updateVibrationSwitcherUI() {
    document.querySelectorAll('.theme-option[data-vibration]').forEach(opt => {
        const isActive = (opt.dataset.vibration === 'on' && vibrationEnabled) ||
                         (opt.dataset.vibration === 'off' && !vibrationEnabled);
        if (isActive) opt.classList.add('active');
        else opt.classList.remove('active');
    });
}

function loadVibrationPreference() {
    const saved = localStorage.getItem('vibration');
    vibrationEnabled = (saved !== 'off');
    updateVibrationSwitcherUI();
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    document.querySelectorAll('.theme-option[data-theme]').forEach(opt => {
        if (opt.dataset.theme === savedTheme) opt.classList.add('active');
        else opt.classList.remove('active');
    });
}

// ===== Уведомления =====
function showNotification(msg) {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = msg || 'Ссылка скопирована в буфер обмена!';
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
}
