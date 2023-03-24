const socket = io();

const setTheme = function(theme){
    document.documentElement.className = theme;
}

const chatSuggestions = [
    'Olá, tudo bem?',
    'Boa noite :)',
    'abc',
    '1234',
    'Teste',
    'Placeholder',
    'Sample',
    'Sample',
    'Sample',
    'Sample',
    'Sample',
].sort(() => {
    return Math.random() - 0.5;
});

$(document).ready(() => {
    addChatSuggestions(chatSuggestions);
    dotsAnimation();
});

//refatorar
const slider = document.querySelector('.chat--suggestions');
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  slider.classList.add('active');
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});
slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.classList.remove('active');
});
slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.classList.remove('active');
});
slider.addEventListener('mousemove', (e) => {
  if(!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 3;
  slider.scrollLeft = scrollLeft - walk;
  console.log(walk);
});
//refatorar

$('.chat--suggestions').click(event => {
    let currentSuggestion = $(event.target);
    if (currentSuggestion[0].childElementCount == 0) {
        let currentMessage = $('.chat--input-text[name=message]');
        currentMessage.val(currentMessage.val() + currentSuggestion.text() + ' ');
        currentSuggestion.remove();
        addChatSuggestions([currentSuggestion.text()]);
    }
});

function dotsAnimation() {
    let dots = $('.title--dots');
    setInterval(() => {
        dots.text().length === 3 ? dots.text('') : dots.text(dots.text()+'.');
    }, 450);
}

function addChatSuggestions(messages) {
    messages.forEach(message => {
        $('.chat--suggestions').append('<span>'+message+'</span>');
    });
}

function renderMessage(message) {
    const randomColor = getUniqueRandomColor(escapeHtml(message.author));
    
    let style = `style='background-image: linear-gradient(to right, ${randomColor}, ${randomColor}95)'`;

    $('.chat--messages').append(`
        <div class="chat--messages-single">
            <span class="single--dateTime">[${escapeHtml(message.dateTime)}]</span>
            <span class="single--author" ${style}>${escapeHtml(message.author)}</span>
            <span class="single--message">: ${escapeHtml(message.message)}</span>
        </div>
    `);
}

function renderNotification(message) {
    $('.chat--messages').append(`
        <div class="chat--messages-single">
            <span class="single--dateTime">[${escapeHtml(message.dateTime)}]</span>
            <span class="single--message-notification">${escapeHtml(message.message)}</span>
        </div>
    `);
}

function removeAllMessages(element, child){
    $(element).find(child).fadeOut(500, function() {
        $(this).remove();
    });
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

function getDateNow(){
    let today = new Date();
    
    let day = convertToTwoDigits(today.getDate());
    let month = convertToTwoDigits(today.getMonth() + 1);
    let year = today.getFullYear();

    let date = [day, month, year].join('-');

    return String(date+'  '+time);
}

function getTimeNow(){
    let today = new Date();

    let hour = convertToTwoDigits(today.getHours());
    let minutes = convertToTwoDigits(today.getMinutes());

    let time = [hour, minutes].join(':');

    return String(time);
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

$('#sharelink').click(() => {
    let href = window.location.href;
    navigator.clipboard.writeText(href);
});

tippy('#sharelink', {
    trigger: 'click',
    content: "📋 Copiado com sucesso!",
    placement: 'bottom',
    allowHTML: true
});

socket.on('receivedMessage', message => {
    renderMessage(message);
});

socket.on('previousMessages', messages => {
    messages.forEach(message => {
        message.notification === 1 ? renderNotification(message) : renderMessage(message);
    });
    scrollDivBottom($('.chat--messages'));
});

socket.on('autoDeleteMessages', () => {
    removeAllMessages($('#chat'), $('.chat--messages-single'));
});

socket.on('authorAlreadyInUse', () => {
    Swal.fire(
        'Opa!',
        'Usuário já está em uso no chat.',
        'warning'
    );
    $('input[name=username').val('');
});

socket.on('blockUsernameChange', () => {
    $('input[name=username]').prop( "disabled", true);
});

socket.on('sendNotification', message => {
    renderNotification(message);
});

$('input[name=username]').change(() => {
    let author = $('input[name=username]').val();
    
    if (author.length) {
        let authorObject = {
            author: author,
            id: socket.id,
        };
        socket.emit('sendAuthor', authorObject);
    }
});

$('#chat').keypress(event => {
    let key = event.which;
    if(key == 13){
       return false;
    }
});

$('#chat').submit(event => {
    event.preventDefault();

    let author = $('input[name=username]').val();
    let message = $('input[name=message]').val();
    
    if (author.length && message.length) {
        let messageObject = {
            dateTime: getTimeNow(),
            author: author,
            message: message
        };
        renderMessage(messageObject);
        socket.emit('sendMessage', messageObject);

        scrollDivBottom($('.chat--messages'));
        $('input[name=message').val('');
    }
});