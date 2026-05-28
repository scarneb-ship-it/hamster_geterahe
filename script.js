// ... (весь предыдущий код до определения SERVICES_DATA)

const SERVICES_DATA = [
    {
        id: 1,
        name: "Bybit",
        url: "https://www.bybit.com/invite?ref=57KXPMO",
        description: "Продвинутая торговая платформа",
        image: "images/bybit.jpg",
        fallback: "💱"
    },
    {
        id: 2,
        name: "Telegram Stars",
        url: "https://t.me/PremiumBot?start=stars",
        description: "Купить звёзды для подарков",
        image: "images/stars.jpg",
        fallback: "⭐"
    },
    {
        id: 3,
        name: "Telegram Gifts",
        url: "https://t.me/gift",
        description: "Отправить подарок друзьям",
        image: "images/gifts.jpg",
        fallback: "🎁"
    },
    {
        id: 4,
        name: "Telegram Premium",
        url: "https://t.me/premium?start=premium",
        description: "Улучшенные возможности Telegram",
        image: "images/premium.jpg",
        fallback: "🚀"
    }
];

// === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===
function initializeApp() {
    // Splash screen скрываем через 1.5с для эффекта загрузки
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => splash.style.display = 'none', 400);
            checkSubscriptionModal();
        }, 1500);
    } else {
        checkSubscriptionModal();
    }

    document.body.style.opacity = '1';
    initializeTelegramWebApp();
    setupNavigation();
    initializeGames();
    initializeServices();      // <-- переименованная функция
    setupSettingsPanel();
    loadThemePreference();
    setLanguage();
    loadUserData();
    setupShareButton();
    initGame2048();
    setupLeaderboardRefresh();
    setupLeaderboardShare();
    setupGameTabs();
}

// === ПРОВЕРКА И ПОКАЗ МОДАЛЬНОГО ОКНА ПОДПИСКИ ===
function checkSubscriptionModal() {
    if (localStorage.getItem('hadron_subscribed')) return;

    const modal = document.getElementById('subscription-modal');
    if (!modal) return;
    modal.classList.add('active');

    document.getElementById('subscribe-btn').addEventListener('click', () => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink('https://t.me/hadronn');
        } else {
            window.open('https://t.me/hadronn', '_blank');
        }
        localStorage.setItem('hadron_subscribed', '1');
        modal.classList.remove('active');
    });

    document.getElementById('already-subscribed').addEventListener('click', () => {
        localStorage.setItem('hadron_subscribed', '1');
        modal.classList.remove('active');
    });

    document.getElementById('modal-close').addEventListener('click', () => {
        localStorage.setItem('hadron_subscribed', '1');
        modal.classList.remove('active');
    });
}

// === ПЕРЕИМЕНОВАННАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ СЕРВИСОВ ===
function initializeServices() {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    servicesList.innerHTML = SERVICES_DATA.map(service => `
        <div class="exchange-card" data-service-id="${service.id}">
            <div class="exchange-logo">
                <img src="${service.image}" alt="${service.name}" class="exchange-img" onerror="this.style.display='none'">
                <div class="image-fallback">${service.fallback}</div>
            </div>
            <div class="exchange-info">
                <h3>${service.name}</h3>
                <p>${service.description}</p>
            </div>
            <button class="exchange-button" data-url="${service.url}">
                Перейти
            </button>
        </div>
    `).join('');

    setupServiceButtons();
}

function setupServiceButtons() {
    document.querySelectorAll('.exchange-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const url = this.getAttribute('data-url');
            if (url) {
                if (window.Telegram?.WebApp) {
                    if (url.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(url);
                    else window.Telegram.WebApp.openLink(url);
                } else {
                    window.open(url, '_blank');
                }
            }
        });
    });
}
