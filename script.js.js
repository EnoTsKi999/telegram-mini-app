// Действия в профиле
function transferMoney() {
    tg.showAlert('💸 Функция перевода денег скоро будет доступна!');
    tg.HapticFeedback.impactOccurred('light');
}

function depositMoney() {
    tg.showAlert('💰 Функция пополнения счета скоро будет доступна!');
    tg.HapticFeedback.impactOccurred('light');
}

function createVirtualCard() {
    if (!hasVirtualCard) {
        // Создаем виртуальную карту
        const savedAccount = localStorage.getItem('serverAccount');
        const account = JSON.parse(savedAccount);
        account.hasVirtualCard = true;
        account.balance = 1000; // Начальный баланс
        account.cardNumber = '4276' + Math.floor(1000 + Math.random() * 9000) + '****' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('serverAccount', JSON.stringify(account));
        
        hasVirtualCard = true;
        updateCardButton();
        
        tg.showAlert('🎉 Виртуальная карта успешно создана!\nНачальный баланс: 1 000 ₽');
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Обновить кнопку создания карты/баланс
function updateCardButton() {
    const cardBtn = document.getElementById('createCardBtn');
    if (hasVirtualCard) {
        const savedAccount = localStorage.getItem('serverAccount');
        const account = JSON.parse(savedAccount);
        const balance = account.balance || 1000;
        
        cardBtn.innerHTML = `💳 Баланс: ${balance.toLocaleString()} ₽`;
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
    const savedAccount = localStorage.getItem('serverAccount');
    const account = JSON.parse(savedAccount);
    const balance = account.balance || 1000;
    const cardNumber = account.cardNumber || '4276 **** **** 1234';
    
    tg.showAlert(`💳 Информация о карте:\n\nНомер: ${cardNumber}\nБаланс: ${balance.toLocaleString()} ₽\n\n💸 Используйте кнопки выше для операций`);
    tg.HapticFeedback.impactOccurred('light');
}
