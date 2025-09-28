// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Показываем информацию о пользователе
document.getElementById('userid').textContent = tg.initDataUnsafe.user?.id || 'Неизвестно';
document.getElementById('platform').textContent = tg.platform;

// Обновляем время
function updateTime() {
    document.getElementById('currentTime').textContent = new Date().toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

// Отправка данных в бота
function sendData() {
    const data = {
        name: document.getElementById('name').value || 'Аноним',
        message: document.getElementById('message').value || 'Привет от Mini App!',
        timestamp: new Date().toISOString()
    };
    
    tg.sendData(JSON.stringify(data));
    tg.showAlert('Данные отправлены боту! 🎉');
}

// Демо функция
function showFeature(featureName) {
    tg.showAlert(`Функция "${featureName}" в разработке! 💪`);
}

// Обработчик кнопки "Назад" в Telegram
tg.BackButton.onClick(() => {
    tg.close();
});