const $chat = $('#chat');
const $messages = $('.chat--messages');
const $suggestions = $('.chat--suggestions');
const $titleDots = $('.title--dots');
const $inputUsername = $('.chat--input-text[name=username]');
const $inputMessage = $('.chat--input-text[name=message]');

const chatSuggestions = [
    'eaí',
    'boa noite 🌃',
    'tudo bem?',
    'olá 🌞',
    'como vão as coisas?',
    'tudo tranquilo',
    'estou bem',
    'eaí, beleza?',
    'bom dia 🥱',
    '🌟🌟🌟',
    'tchau 👋',
    'vlw 👋'
];

function randomizeArray(array){
    return array.sort(() => {
        return Math.random() - 0.5;
    });
}

function setTheme(theme){
    document.documentElement.className = theme;
}

function dotsAnimation() {
    setInterval(() => {
        $titleDots.text().length === 3 ? $titleDots.text('') : $titleDots.text($titleDots.text()+'.');
    }, 450);
}

function addChatSuggestions(messages) {
    messages.forEach(message => {
        $suggestions.append('<span>'+message+'</span>');
    });
}

function renderMessage(message) {
    const randomColor = getUniqueRandomColor(escapeHtml(message.author));
    let style = `style='background-image: linear-gradient(to right, ${randomColor}, ${randomColor}95)'`;

    $messages.append(`
        <div class="chat--messages-single">
            <b class="single--dateTime">[${escapeHtml(getOnlyTime(message.dateTime))}]</b>
            <span class="single--author" ${style}>${escapeHtml(message.author)}</span>
            <b class="single--message">: ${escapeHtml(message.message)}</b>
        </div>
    `);
}

function renderNotification(message) {
    $messages.append(`
        <div class="chat--messages-single">
            <b class="single--dateTime">[${escapeHtml(getOnlyTime(message.dateTime))}]</b>
            <text class="single--message-notification">${escapeHtml(message.message)}</text>
        </div>
    `);
}

function escapeHtml(value) {
    return value.replace(/&/g,  "&amp;")
                .replace(/</g,  "&lt;")
                .replace(/>/g,  "&gt;")
                .replace(/"/g,  "&quot;")
                .replace(/'/g,  "&apos;")
                .replace(/`/g,  "&grave;")
                .replace(/{/g,  "&lbrace;")
                .replace(/}/g,  "&rbrace;")
                .replace(/ /g,  "&nbsp;")
                .replace(/\(/g, "&lpar;")
                .replace(/\)/g, "&rpar;");
}

function scrollDivBottom(element) {
    $(element).scrollTop($(element)[0].scrollHeight);
}

function convertToTwoDigits(value) {
    return ("0" + value).slice(-2);
}

function getOnlyDate(dateTime){
    let date = new Date(dateTime);
    let day = convertToTwoDigits(date.getDate());
    let month = convertToTwoDigits(date.getMonth() + 1);
    let year = date.getFullYear();
    return String([day, month, year].join('-'));
}

function getOnlyTime(dateTime){
    let date = new Date(dateTime);
    let hour = convertToTwoDigits(date.getHours());
    let minutes = convertToTwoDigits(date.getMinutes());
    return String([hour, minutes].join(':'));
}

function getUniqueRandomColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}