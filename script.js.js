// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#f5576c');
tg.setBackgroundColor('#f5576c');

// Переменные
let selectedRole = '';
let hasVirtualCard = false;
let currentUser = null;
let allAccounts = JSON.parse(localStorage.getItem('allAccounts') || '{}');
let accountsData = JSON.parse(localStorage.getItem('accountsData') || '{}');

// Показать форму входа (по умолчанию)
function showLoginForm() {
    hideAllSections();
    document.getElementById('loginSection').classList.add('active');
    // Очищаем поля
    document.getElementById('loginNickname').value = '';
    document.getElementById('loginPassword').value = '';
}

// Показать форму регистрации
function showRegisterForm() {
    hideAllSections();
    document.getElementById('registerSection').classList.add('active');
    // Очищаем поля
    document.getElementById('regNickname').value = '';
    document.getElementById('regPassword').value = '';
    // Сбрасываем выбор роли
    selectedRole = '';
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Показать профиль
function showProfile() {
    hideAllSections();
    document.getElementById('profileSection').classList.add('active');
}

// Показать страницу перевода
function showTransferPage() {
    hideAllSections();
    document.getElementById('transferSection').classList.add('active');
    
    // Обновляем баланс
    if (currentUser) {
        const balance = currentUser.balance || 0;
        document.getElementById('currentBalance').textContent = balance.toLocaleString();
        document.getElementById('afterBalance').textContent = balance.toLocaleString();
    }
    
    // Очищаем поля
    document.getElementById('transferAmount').value = '';
    document.getElementById('receiverNickname').value = '';
}

// Показать страницу управления балансом
function showManageBalancePage() {
    hideAllSections();
    document.getElementById('manageBalanceSection').classList.add('active');
    
    // Очищаем поля
    document.getElementById('targetNickname').value = '';
    document.getElementById('balanceAmount').value = '';
}

// Выбор роли
function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

// Скрыть все секции
function hideAllSections() {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
}

// Проверка на английские символы и цифры
function isEnglishAndNumbers(text) {
    return /^[A-Za-z0-9]+$/.test(text);
}

// Вход
function login() {
    const nickname = document.getElementById('loginNickname').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!nickname || !password) {
        tg.showAlert('❌ Заполни все поля!');
        return;
    }

    // Получаем данные аккаунта из accountsData
    const accountData = accountsData[nickname.toLowerCase()];
    
    if (!accountData) {
        // Показываем экран ошибки
        hideAllSections();
        document.getElementById('errorSection').classList.add('active');
        tg.HapticFeedback.impactOccurred('heavy');
        return;
    }

    if (accountData.password === password) {
        // Успешный вход
        currentUser = accountData;
        localStorage.setItem('serverAccount', JSON.stringify(accountData));
        
        document.getElementById('profileNickname').textContent = accountData.nickname;
        document.getElementById('profileRole').textContent = getRoleDisplayName(accountData.role);
        
        // Проверяем есть ли виртуальная карта
        hasVirtualCard = accountData.hasVirtualCard || false;
        updateCardButton();
        
        // Показываем кнопку управления балансом только для работников банка
        const manageBalanceBtn = document.getElementById('manageBalanceBtn');
        if (accountData.role === 'employee') {
            manageBalanceBtn.style.display = 'block';
        } else {
            manageBalanceBtn.style.display = 'none';
        }
        
        hideAllSections();
        document.getElementById('profileSection').classList.add('active');
        
        tg.showAlert(`✅ Привет, ${nickname}!`);
        tg.HapticFeedback.impactOccurred('medium');
    } else {
        tg.showAlert('❌ Неверный пароль!');
        tg.HapticFeedback.impactOccurred('heavy');
    }
}

// Регистрация
function register() {
    const nickname = document.getElementById('regNickname').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    
    if (!nickname) {
        tg.showAlert('❌ Введи никнейм!');
        return;
    }
    
    if (!password) {
        tg.showAlert('❌ Введи пароль!');
        return;
    }
    
    if (!selectedRole) {
        tg.showAlert('❌ Выбери роль!');
        return;
    }
    
    // Проверка на английские символы
    if (!isEnglishAndNumbers(nickname)) {
        tg.showAlert('❌ Никнейм должен содержать только английские буквы и цифры!');
        return;
    }
    
    if (!isEnglishAndNumbers(password)) {
        tg.showAlert('❌ Пароль должен содержать только английские буквы и цифры!');
        return;
    }
    
    if (nickname.length < 3) {
        tg.showAlert('❌ Никнейм должен быть не менее 3 символов!');
        return;
    }
    
    if (password.length < 4) {
        tg.showAlert('❌ Пароль должен быть не менее 4 символов!');
        return;
    }

    // Проверка уникальности ника
    if (accountsData[nickname.toLowerCase()]) {
        tg.showAlert('❌ Этот никнейм уже занят!');
        return;
    }

    // Создаем данные аккаунта
    const accountData = {
        nickname: nickname,
        password: password,
        role: selectedRole,
        playerId: 'PL' + Date.now().toString().slice(-8),
        hasVirtualCard: false,
        balance: 0,
        registrationDate: new Date().toLocaleDateString('ru-RU')
    };
    
    // Сохраняем в accountsData
    accountsData[nickname.toLowerCase()] = accountData;
    localStorage.setItem('accountsData', JSON.stringify(accountsData));
    
    // Сохраняем в allAccounts для проверки уникальности
    allAccounts[nickname.toLowerCase()] = true;
    localStorage.setItem('allAccounts', JSON.stringify(allAccounts));
    
    // Сохраняем как текущий аккаунт
    localStorage.setItem('serverAccount', JSON.stringify(accountData));
    
    // Показываем успех
    document.getElementById('successNickname').textContent = nickname;
    document.getElementById('successRole').textContent = getRoleDisplayName(selectedRole);
    document.getElementById('successId').textContent = accountData.playerId;
    
    hideAllSections();
    document.getElementById('successSection').classList.add('active');
    
    tg.showAlert(`✅ Добро пожаловать, ${nickname}!`);
    tg.HapticFeedback.impactOccurred('medium');
}

// Получить отображаемое название роли
function getRoleDisplayName(role) {
    switch(role) {
        case 'client': return '👤 Клиент банка';
        case 'employee': return '💼 Работник банка';
        default: return '👤 Пользователь';
    }
}

// Создание виртуальной карты
function createVirtualCard() {
    if (!hasVirtualCard) {
        // Создаем виртуальную карту
        currentUser.hasVirtualCard = true;
        currentUser.balance = 1000; // Начальный баланс
        currentUser.cardNumber = '4276' + Math.floor(1000 + Math.random() * 9000) + '****' + Math.floor(1000 + Math.random() * 9000);
        
        // Сохраняем во все места
        accountsData[currentUser.nickname.toLowerCase()] = currentUser;
        localStorage.setItem('accountsData', JSON.stringify(accountsData));
        localStorage.setItem('serverAccount', JSON.stringify(currentUser));
        
        hasVirtualCard = true;
        updateCardButton();
        
        tg.showAlert('🎉 Виртуальная карта успешно создана!\nНачальный баланс: 1 000 дб');
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Обновить кнопку создания карты/баланс
function updateCardButton() {
    const cardBtn = document.getElementById('createCardBtn');
    if (hasVirtualCard) {
        const balance = currentUser.balance || 1000;
        cardBtn.innerHTML = `💳 Баланс: ${balance.toLocaleString()} дб`;
        cardBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        cardBtn.style.cursor = 'pointer';
        cardBtn.onclick = showBalanceInfo;
    } else {
        cardBtn.innerHTML = '💳 Создать виртуальную карту';
        cardBtn.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
        cardBtn.style.cursor = 'pointer';
        cardBtn.onclick = createVirtualCard;
    }
}

// Показать информацию о балансе
function showBalanceInfo() {
    const balance = currentUser.balance || 1000;
    const cardNumber = currentUser.cardNumber || '4276 **** **** 1234';
    
    tg.showAlert(`💳 Информация о карте:\n\nНомер: ${cardNumber}\nБаланс: ${balance.toLocaleString()} дб\n\n💸 Используйте кнопки выше для операций`);
    tg.HapticFeedback.impactOccurred('light');
}

// Расчет баланса после перевода
function calculateBalanceAfter() {
    const amount = parseInt(document.getElementById('transferAmount').value) || 0;
    const currentBalance = currentUser.balance || 0;
    const afterBalance = currentBalance - amount;
    
    document.getElementById('afterBalance').textContent = afterBalance >= 0 ? afterBalance.toLocaleString() : '0';
    
    // Подсветка если недостаточно средств
    const balanceAfterElement = document.getElementById('balanceAfter');
    if (afterBalance < 0) {
        balanceAfterElement.style.background = 'rgba(255, 107, 107, 0.1)';
        balanceAfterElement.style.borderColor = 'rgba(255, 107, 107, 0.3)';
    } else {
        balanceAfterElement.style.background = 'rgba(67, 233, 123, 0.1)';
        balanceAfterElement.style.borderColor = 'rgba(67, 233, 123, 0.3)';
    }
}

// Перевод денег
function makeTransfer() {
    const amount = parseInt(document.getElementById('transferAmount').value);
    const receiverNickname = document.getElementById('receiverNickname').value.trim();
    const currentBalance = currentUser.balance || 0;
    
    if (!amount || amount <= 0) {
        tg.showAlert('❌ Введите корректную сумму!');
        return;
    }
    
    if (amount > currentBalance) {
        tg.showAlert('❌ Недостаточно средств на счете!');
        return;
    }
    
    if (!receiverNickname) {
        tg.showAlert('❌ Введите никнейм получателя!');
        return;
    }
    
    if (!isEnglishAndNumbers(receiverNickname)) {
        tg.showAlert('❌ Никнейм получателя должен содержать только английские буквы и цифры!');
        return;
    }
    
    // Проверяем существует ли получатель
    const receiverData = accountsData[receiverNickname.toLowerCase()];
    if (!receiverData) {
        tg.showAlert('❌ Получатель с таким никнеймом не найден!');
        return;
    }
    
    // Обновляем балансы
    currentUser.balance -= amount;
    receiverData.balance += amount;
    
    // Сохраняем изменения
    accountsData[currentUser.nickname.toLowerCase()] = currentUser;
    accountsData[receiverNickname.toLowerCase()] = receiverData;
    localStorage.setItem('accountsData', JSON.stringify(accountsData));
    localStorage.setItem('serverAccount', JSON.stringify(currentUser));
    
    updateCardButton();
    
    tg.showAlert(`✅ Перевод на сумму ${amount} дб пользователю ${receiverNickname} выполнен!\nНовый баланс: ${currentUser.balance.toLocaleString()} дб`);
    tg.HapticFeedback.impactOccurred('medium');
    
    // Возвращаем в профиль
    showProfile();
}

// Управление балансом (только для работников банка)
function manageBalance() {
    const targetNickname = document.getElementById('targetNickname').value.trim();
    const action = document.getElementById('balanceAction').value;
    const amount = parseInt(document.getElementById('balanceAmount').value);
    
    if (!targetNickname) {
        tg.showAlert('❌ Введите никнейм игрока!');
        return;
    }
    
    if (!amount || amount < 0) {
        tg.showAlert('❌ Введите корректную сумму!');
        return;
    }
    
    // Проверяем существует ли игрок
    const targetData = accountsData[targetNickname.toLowerCase()];
    if (!targetData) {
        tg.showAlert('❌ Игрок с таким никнеймом не найден!');
        return;
    }
    
    let newBalance = targetData.balance || 0;
    let message = '';
    
    switch(action) {
        case 'add':
            newBalance += amount;
            message = `➕ Добавлено ${amount} дб игроку ${targetNickname}`;
            break;
        case 'remove':
            if (amount > newBalance) {
                newBalance = 0;
                message = `➖ Убрано ${targetData.balance} дб у игрока ${targetNickname} (баланс обнулен)`;
            } else {
                newBalance -= amount;
                message = `➖ Убрано ${amount} дб у игрока ${targetNickname}`;
            }
            break;
        case 'set':
            newBalance = amount;
            message = `⚡ Баланс игрока ${targetNickname} установлен: ${amount} дб`;
            break;
    }
    
    // Обновляем баланс
    targetData.balance = newBalance;
    accountsData[targetNickname.toLowerCase()] = targetData;
    localStorage.setItem('accountsData', JSON.stringify(accountsData));
    
    // Если редактируем свой аккаунт, обновляем currentUser
    if (targetNickname.toLowerCase() === currentUser.nickname.toLowerCase()) {
        currentUser.balance = newBalance;
        localStorage.setItem('serverAccount', JSON.stringify(currentUser));
        updateCardButton();
    }
    
    tg.showAlert(message);
    tg.HapticFeedback.impactOccurred('medium');
    
    // Очищаем поля
    document.getElementById('targetNickname').value = '';
    document.getElementById('balanceAmount').value = '';
}

// Выход
function logout() {
    currentUser = null;
    localStorage.removeItem('serverAccount');
    showLoginForm();
    tg.showAlert('👋 До встречи!');
}

// Назначение обработчиков событий при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем данные при старте
    allAccounts = JSON.parse(localStorage.getItem('allAccounts') || '{}');
    accountsData = JSON.parse(localStorage.getItem('accountsData') || '{}');
    
    // Назначаем обработчики на ВСЕ кнопки
    setupEventListeners();
    
    // Проверяем есть ли сохраненная сессия
    const savedAccount = localStorage.getItem('serverAccount');
    if (savedAccount) {
        try {
            currentUser = JSON.parse(savedAccount);
            // Проверяем актуальность данных
            const freshData = accountsData[currentUser.nickname.toLowerCase()];
            if (freshData && freshData.password === currentUser.password) {
                // Автоматический вход
                document.getElementById('profileNickname').textContent = freshData.nickname;
                document.getElementById('profileRole').textContent = getRoleDisplayName(freshData.role);
                hasVirtualCard = freshData.hasVirtualCard || false;
                updateCardButton();
                
                const manageBalanceBtn = document.getElementById('manageBalanceBtn');
                if (freshData.role === 'employee') {
                    manageBalanceBtn.style.display = 'block';
                }
                
                hideAllSections();
                document.getElementById('profileSection').classList.add('active');
                return;
            }
        } catch (e) {
            console.error('Error loading saved account:', e);
        }
    }
    
    // Если нет сохраненной сессии, показываем вход
    showLoginForm();
});

// Функция для настройки всех обработчиков событий
function setupEventListeners() {
    // Кнопка входа
    const loginBtn = document.querySelector('#loginSection .btn');
    if (loginBtn) loginBtn.addEventListener('click', login);
    
    // Кнопка регистрации в форме входа
    const registerBtn = document.querySelector('.register-btn-large');
    if (registerBtn) registerBtn.addEventListener('click', showRegisterForm);
    
    // Кнопка создания аккаунта
    const createAccountBtn = document.querySelector('.btn-create');
    if (createAccountBtn) createAccountBtn.addEventListener('click', register);
    
    // Кнопка перевода в профиле
    const transferBtn = document.querySelector('.action-btn.transfer');
    if (transferBtn) transferBtn.addEventListener('click', showTransferPage);
    
    // Кнопка управления балансом в профиле
    const manageBalanceBtn = document.getElementById('manageBalanceBtn');
    if (manageBalanceBtn) manageBalanceBtn.addEventListener('click', showManageBalancePage);
    
    // Кнопка подтверждения перевода
    const confirmTransferBtn = document.querySelector('#transferSection .btn');
    if (confirmTransferBtn) confirmTransferBtn.addEventListener('click', makeTransfer);
    
    // Кнопка выполнения управления балансом
    const executeBalanceBtn = document.querySelector('#manageBalanceSection .btn');
    if (executeBalanceBtn) executeBalanceBtn.addEventListener('click', manageBalance);
    
    // Кнопки "Назад"
    const backButtons = document.querySelectorAll('.btn-back');
    backButtons.forEach(btn => {
        if (btn.closest('#registerSection')) {
            btn.addEventListener('click', showLoginForm);
        } else if (btn.closest('#transferSection') || btn.closest('#manageBalanceSection')) {
            btn.addEventListener('click', showProfile);
        } else if (btn.closest('#errorSection')) {
            btn.addEventListener('click', showLoginForm);
        }
    });
    
    // Кнопка входа из успешной регистрации
    const successLoginBtn = document.querySelector('#successSection .btn');
    if (successLoginBtn) successLoginBtn.addEventListener('click', showLoginForm);
    
    // Кнопка регистрации из ошибки
    const errorRegisterBtn = document.querySelector('#errorSection .btn-register');
    if (errorRegisterBtn) errorRegisterBtn.addEventListener('click', showRegisterForm);
    
    // Кнопка выхода
    const logoutBtn = document.querySelector('#profileSection .btn-back');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Обработчик для поля суммы перевода
    const transferAmountInput = document.getElementById('transferAmount');
    if (transferAmountInput) {
        transferAmountInput.addEventListener('input', calculateBalanceAfter);
    }
}

// Делаем функции глобальными для onclick атрибутов в HTML
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.showProfile = showProfile;
window.showTransferPage = showTransferPage;
window.showManageBalancePage = showManageBalancePage;
window.selectRole = selectRole;
window.register = register;
window.createVirtualCard = createVirtualCard;
window.showBalanceInfo = showBalanceInfo;
window.calculateBalanceAfter = calculateBalanceAfter;
window.makeTransfer = makeTransfer;
window.manageBalance = manageBalance;
window.logout = logout;

function showRegisterForm() {
    // Ваш код для показа формы регистрации
    console.log("Register form should be shown");
    // Например: document.getElementById('registerForm').style.display = 'block';
}
function showRegisterForm() {
    // Пример реализации - покажите форму регистрации
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm && registerForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    
    // Или альтернативный вариант:
    // alert('Форма регистрации будет здесь');
    console.log('Register form function called');
}

function showRegisterForm() {
    // Ваш код для показа формы регистрации
    console.log("Форма регистрации открыта");
    
    // Пример: скрыть форму входа и показать форму регистрации
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    
    // Или просто покажите сообщение
    // alert("Форма регистрации");
}
