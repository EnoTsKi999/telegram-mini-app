// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Хранилище аккаунтов (в localStorage)
let accounts = [];

// Текущий пользователь
let currentUser = null;

// Инициализация приложения
function initApp() {
    loadAccounts();
    
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showProfile();
    } else {
        showMainMenu();
    }
}

// Загрузка аккаунтов из localStorage
function loadAccounts() {
    const saved = localStorage.getItem('serverAccounts');
    if (saved) {
        accounts = JSON.parse(saved);
        console.log('Аккаунты загружены:', accounts);
    }
}

// Сохранение аккаунтов в localStorage
function saveAccounts() {
    localStorage.setItem('serverAccounts', JSON.stringify(accounts));
    console.log('Аккаунты сохранены:', accounts);
}

// Сохранение текущего пользователя
function saveCurrentUser() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Показать главное меню
function showMainMenu() {
    hideAllSections();
    document.getElementById('mainMenu').classList.add('active');
    updateStatus('Выберите действие');
}

// Показать регистрацию
function showRegister() {
    hideAllSections();
    document.getElementById('registerSection').classList.add('active');
    updateStatus('Заполните форму регистрации');
    
    // Очищаем поля
    document.getElementById('regNickname').value = '';
    document.getElementById('regPassword').value = '';
}

// Показать вход
function showLogin() {
    hideAllSections();
    document.getElementById('loginSection').classList.add('active');
    updateStatus('Введите данные для входа');
    
    // Очищаем поля
    document.getElementById('loginNickname').value = '';
    document.getElementById('loginPassword').value = '';
}

// Показать профиль
function showProfile() {
    hideAllSections();
    document.getElementById('profileSection').classList.add('active');
    
    // Заполняем данные профиля
    document.getElementById('profileNickname').textContent = currentUser.nickname;
    document.getElementById('profileId').textContent = currentUser.playerId;
    document.getElementById('profileStatus').textContent = currentUser.status;
    document.getElementById('profileRegDate').textContent = currentUser.registrationDate;
    
    updateStatus(`Вход выполнен: ${currentUser.nickname}`);
}

// Скрыть все секции
function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
}

// Обновить статус
function updateStatus(text) {
    document.getElementById('statusText').textContent = text;
}

// Регистрация
function register() {
    const nickname = document.getElementById('regNickname').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    
    // Валидация
    if (!nickname) {
        showAlert('❌ Введите никнейм!');
        return;
    }
    
    if (!password) {
        showAlert('❌ Введите пароль!');
        return;
    }
    
    if (nickname.length < 3) {
        showAlert('❌ Никнейм должен быть не менее 3 символов!');
        return;
    }
    
    if (password.length < 4) {
        showAlert('❌ Пароль должен быть не менее 4 символов!');
        return;
    }
    
    // Проверяем, не занят ли никнейм
    if (accounts.find(acc => acc.nickname === nickname)) {
        showAlert('❌ Этот никнейм уже занят!');
        return;
    }
    
    // Создаем аккаунт
    const newAccount = {
        nickname: nickname,
        password: password,
        playerId: generatePlayerId(),
        registrationDate: new Date().toLocaleDateString('ru-RU'),
        status: 'Активен'
    };
    
    // Сохраняем аккаунт
    accounts.push(newAccount);
    saveAccounts();
    
    // Автоматически входим
    currentUser = newAccount;
    saveCurrentUser();
    
    showAlert(`✅ Регистрация успешна!\nДобро пожаловать, ${nickname}!`);
    showProfile();
    sendToBot('registration');
}

// Вход в аккаунт
function login() {
    const nickname = document.getElementById('loginNickname').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // Валидация
    if (!nickname || !password) {
        showAlert('❌ Заполните все поля!');
        return;
    }
    
    // Ищем аккаунт
    const account = accounts.find(acc => 
        acc.nickname === nickname && acc.password === password
    );
    
    if (account) {
        // Успешный вход
        currentUser = account;
        saveCurrentUser();
        
        showAlert(`✅ Вход выполнен!\nПривет, ${nickname}!`);
        showProfile();
        sendToBot('login');
    } else {
        showAlert('❌ Неверный никнейм или пароль!');
        vibrate();
    }
}

// Выход
function logout() {
    currentUser = null;
    saveCurrentUser();
    showAlert('👋 До встречи!');
    showMainMenu();
}

// Генерация ID игрока
function generatePlayerId() {
    return 'PL' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase();
}

// Вспомогательные функции
function showAlert(message) {
    tg.showAlert(message);
}

function vibrate() {
    tg.HapticFeedback.impactOccurred('heavy');
}

// Отправка данных в бота
function sendToBot(action) {
    const data = {
        action: action,
        nickname: currentUser.nickname,
        playerId: currentUser.playerId,
        registrationDate: currentUser.registrationDate,
        timestamp: new Date().toISOString()
    };
    
    tg.sendData(JSON.stringify(data));
    console.log('Данные отправлены боту:', data);
}

// Обработчик кнопки "Назад"
tg.BackButton.onClick(() => {
    if (document.getElementById('profileSection').classList.contains('active')) {
        logout();
    } else {
        showMainMenu();
    }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);
