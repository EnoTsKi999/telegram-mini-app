\// Вход
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
                message = `➖ Убрано ${newBalance} дб у игрока ${targetNickname} (баланс обнулен)`;
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

// Назначение обработчиков событий
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик кнопки входа
    document.querySelector('#loginSection .btn').addEventListener('click', login);
    
    // Загружаем данные при старте
    allAccounts = JSON.parse(localStorage.getItem('allAccounts') || '{}');
    accountsData = JSON.parse(localStorage.getItem('accountsData') || '{}');
    
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
            } else {
                showLoginForm();
            }
        } catch (e) {
            showLoginForm();
        }
    } else {
        showLoginForm();
    }
});
