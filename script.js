const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;

const WORKER_URL = 'https://hadron-hub.твой-воркер.workers.dev'; // <-- твой воркер

// Игры – замени ID в ссылках на свой
const GAMES_DATA = [
    {
        id: 0,
        name: "Pixel World",
        fullLink: "https://t.me/pixelworld/play?startapp=rТВОЙ_ID",
        description: "Первый 3D-шутер в Telegram",
        rating: 4.9,
        players: "34K",
        image: "images/photo_2026-02-17_13-44-55.jpg",
        fallback: "🌍",
        badge: "Beta",
        highlight: true
    },
    {
        id: 1,
        name: "Hamster GameDev",
        fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentIdТВОЙ_ID",
        description: "Создай свою студию",
        rating: 4.7,
        players: "368K",
        image: "images/hamster-gamedev.jpg",
        fallback: "🎮"
    },
    // добавь свои игры...
];

// Биржи – замени реферальные ссылки на свои
const EXCHANGES_DATA = [
    {
        id: 1,
        name: "Bybit",
        url: "https://www.bybit.com/invite?ref=ТВОЙ_REF",
        description: "Продвинутая торговая платформа",
        image: "images/bybit.jpg",
        fallback: "💱"
    },
    // ...
];

// Хаб (NFT, подарки, нейросети)
const HUB_DATA = [
    {
        name: "Telegram Подарки",
        description: "Получай эксклюзивные подарки",
        icon: "🎁",
        link: "" // позже добавишь deep-link
    },
    {
        name: "NFT Коллекция",
        description: "Уникальные цифровые предметы",
        icon: "🖼️",
        link: ""
    },
    {
        name: "Нейросети",
        description: "Генерация изображений и текста",
        icon: "🤖",
        link: ""
    }
];

const translations = {
    appTitle: "Hadron Hub",
    settings: "Настройки",
    theme: "Тема",
    lightTheme: "Светлая",
    darkTheme: "Темная",
    done: "Готово",
    games: "Игры",
    bestGames: "Лучшие игры Telegram",
    play: "Играть",
    exchanges: "Биржи",
    exchangesDesc: "Торгуйте криптовалютами безопасно",
    user: "Пользователь",
    shareWithFriends: "Поделиться с друзьями",
    profile: "Профиль",
    linkCopied: "Ссылка скопирована в буфер обмена!",
    go: "Перейти",
    game2048: "2048",
    score: "Счёт",
    best: "Лучший",
    newGame: "Новая игра",
    swipeHint: "👆 Свайпайте пальцем или используйте стрелки",
    gameWin: "Вы победили! 🎉",
    gameLose: "Игра окончена! 😔"
};

// --- после загрузки DOM ---
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function vibrate() {
    if (navigator.vibrate) navigator.vibrate(50);
}

function initializeApp() {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    document.body.style.opacity = '1';

    initializeTelegramWebApp();
    setupNavigation();
    initializeGames();
    initializeExchanges();
    initializeHub();            // <-- новый раздел
    setupSettingsPanel();
    loadThemePreference();
    setLanguage();
    loadUserData();
    setupShareButton();
    initGame2048();
    setupLeaderboardRefresh();
    setupLeaderboardShare();
    setupGameTabs();
    initSubscriptionCheck();   // проверка подписки
}

// ========== НОВЫЕ ФУНКЦИИ ==========

// Инициализация хаба
function initializeHub() {
    const hubGrid = document.getElementById('hub-grid');
    if (!hubGrid) return;
    hubGrid.innerHTML = HUB_DATA.map(item => `
        <div class="hub-card">
            <div class="hub-icon">${item.icon}</div>
            <div class="hub-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>
            ${item.link ? `<button class="play-button" data-link="${item.link}">Открыть</button>` : ''}
        </div>
    `).join('');
    // кнопки открытия (можно позже добавить проверку подписки)
}

// Проверка подписки на канал @hadron_channel
let isSubscribed = false;
async function checkSubscription() {
    if (isSubscribed) return true;
    if (!currentUserId) return false; // без юзера не проверяем

    try {
        const res = await fetch(WORKER_URL + '/check-sub', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId.toString() })
        });
        const data = await res.json();
        if (data.subscribed) {
            isSubscribed = true;
            return true;
        } else {
            showSubscribeModal();
            return false;
        }
    } catch (e) {
        console.error('Ошибка проверки подписки:', e);
        return false;
    }
}

function showSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('subscribe-link-btn').onclick = () => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink('https://t.me/hadron_channel');
        } else {
            window.open('https://t.me/hadron_channel', '_blank');
        }
        // закрываем после попытки
        modal.style.display = 'none';
    };
    document.getElementById('close-modal-btn').onclick = () => {
        modal.style.display = 'none';
    };
}

// Вызывается один раз при старте, чтобы предзагрузить статус
async function initSubscriptionCheck() {
    await checkSubscription();
}

// Модифицируем открытие ссылок с проверкой подписки
function openWithSubscriptionCheck(link) {
    vibrate();
    checkSubscription().then(subscribed => {
        if (subscribed) {
            if (window.Telegram?.WebApp) {
                if (link.startsWith('https://t.me/')) {
                    window.Telegram.WebApp.openTelegramLink(link);
                } else {
                    window.Telegram.WebApp.openLink(link);
                }
            } else {
                window.open(link, '_blank');
            }
        }
    });
}

// Переопределяем обработчики кнопок
function setupGameButtons() {
    document.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const link = this.getAttribute('data-link');
            if (link) openWithSubscriptionCheck(link);
        });
    });
}

function setupExchangeButtons() {
    document.querySelectorAll('.exchange-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const url = this.getAttribute('data-url');
            if (url) openWithSubscriptionCheck(url);
        });
    });
}

// Обновлённый профиль с количеством рефералов
function loadUserData() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateProfileDisplay(user);
            currentUserId = user.id;
            sendMiniAppStat(user);
            fetchRefCount(); // запрашиваем количество друзей
        } else {
            showFallbackProfile();
            currentUserId = null;
        }
    } else {
        showFallbackProfile();
        currentUserId = null;
    }
}

async function fetchRefCount() {
    if (!currentUserId) return;
    try {
        const res = await fetch(WORKER_URL + '/ref-count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId.toString() })
        });
        const data = await res.json();
        const refEl = document.getElementById('ref-count');
        const refNum = document.getElementById('ref-number');
        if (refEl && refNum && data.count !== undefined) {
            refEl.style.display = 'flex';
            refNum.textContent = data.count;
        }
    } catch (e) {
        console.error('Не удалось получить количество рефералов', e);
    }
}

// Шеринг с реферальной ссылкой (уже было, но обновим BOT_USERNAME)
function setupShareButton() {
    const shareButton = document.getElementById('share-friends-button');
    if (!shareButton) return;
    shareButton.addEventListener('click', function() {
        vibrate();
        let botUrl;
        if (currentUserId) {
            botUrl = `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`;
        } else {
            botUrl = `https://t.me/${BOT_USERNAME}`;
        }
        const shareText = '🚀 Играй, зарабатывай и получай подарки в Hadron Hub!';
        if (window.Telegram?.WebApp) {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(shareText)}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
            fallbackCopyToClipboard(botUrl);
        }
    });
}

// Остальные функции (Telegram WebApp, темы, навигация, 2048) остаются как в исходном коде.
// Убедись, что в setupNavigation добавлена обработка hub-section и game-section.
// В setupNavigation внутри forEach по nav-items уже будет 5 элементов; toggleHeaderForSection может скрывать header для profile-section (оставь как есть).

// В конце инициализации не забудь вызвать все initialize* функции, включая initializeHub().
