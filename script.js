const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const SPLASH_DURATION = 3800;
const splashDone = new Promise(resolve => setTimeout(resolve, SPLASH_DURATION));
const WORKER_URL = 'https://games-verse.scarneb.workers.dev';
const HADRON_CHANNEL = 'https://t.me/+GNfQDYSAYc4wNDBi';
let vibrationEnabled = true;

// Промты с реальными текстами
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
    navigator.vibrate?.call(navigator, 30);
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

// ... (все остальные функции: telegram, subscribe, user, share, settings остаются без изменений, только добавляем новые)

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
                // Вместо оплаты показываем модальное окно с текстом промта
                showPromptModal(prompt);
                // Эмулируем покупку
                addPurchasedPrompt(id);
                refreshShopButtons();
                renderPurchases();
            }
        });
    });
}

// Модальное окно с промтом
function setupPromptModal() {
    const modal = document.getElementById('prompt-modal');
    document.getElementById('close-prompt-modal').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    document.getElementById('copy-prompt-btn').addEventListener('click', () => {
        const text = document.getElementById('modal-prompt-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Промт скопирован!');
        }).catch(() => showNotification('Не удалось скопировать'));
    });
}

function showPromptModal(prompt) {
    document.getElementById('modal-prompt-name').textContent = prompt.name;
    document.getElementById('modal-prompt-desc').textContent = prompt.description;
    document.getElementById('modal-prompt-text').textContent = prompt.promptText;
    document.getElementById('prompt-modal').classList.add('active');
}

function addPurchasedPrompt(id) {
    purchasedPrompts.add(id);
    const stored = JSON.parse(localStorage.getItem('purchasedPrompts') || '[]');
    if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem('purchasedPrompts', JSON.stringify(stored));
    }
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

function loadPurchases() {
    if (currentUserId) {
        fetch(WORKER_URL + '/purchases?userId=' + currentUserId)
            .then(res => res.json())
            .then(data => {
                if (data?.purchases) {
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
        try { JSON.parse(stored).forEach(id => purchasedPrompts.add(id)); } catch(e) {}
    }
}

// Остальные функции (setupNavigation, settings, userProfile, share) остаются без изменений.
