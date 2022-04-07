const socket = io();

const setTheme = function(theme){
    document.documentElement.className = theme;
}
        
function renderMessage(message) {
    var randomColor = getUniqueRandomColor(escapeHtml(message.author));
    $('.messages').append(`
        <div class="messages--single">
            <strong> [`+ escapeHtml(message.dateTime) +`] <span style='background-color: ${randomColor};'>`+ escapeHtml(message.author) +`</span></strong>: `+ escapeHtml(message.message) +`
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

function getDateTimeNow(){
    let today = new Date();
    
    let day = convertToTwoDigits(today.getDate());
    let month = convertToTwoDigits(today.getMonth() + 1);
    let year = today.getFullYear();

    let hour = convertToTwoDigits(today.getHours());
    let minutes = convertToTwoDigits(today.getMinutes());

    let date = [day, month, year].join('-');
    let time = [hour, minutes].join(':');

    return String(date+'  '+time);
}

function getUniqueRandomColor(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

$('#sharelink').click(function(){
    var href = window.location.href;
    navigator.clipboard.writeText(href);
});

tippy('#sharelink', {
    trigger: 'click',
    content: "📋 Copiado com sucesso!",
    placement: 'bottom',
    allowHTML: true
});

socket.on('receivedMessage', function(message) {
    renderMessage(message);
});

socket.on('previousMessages', function(messages) {
    for (message of messages) {
        renderMessage(message);      
    }
    scrollDivBottom($('.messages'));
});

socket.on('autoDeleteMessages', function () {
    removeAllMessages($('#chat'), $('.messages--single'));
});

socket.on('authorAlreadyInUse', function () {
    Swal.fire(
        'Opa!',
        'Usuário já está em uso no chat.',
        'warning'
    );
    $('input[name=username').val('');
});

$('input[name=username]').change(function(){
    var author = $('input[name=username]').val();
    
    if (author.length) {
        var authorObject = {
            author: author,
            id: socket.id,
        };
        socket.emit('sendAuthor', authorObject);
    }
});

$('#chat').submit(function(event) {
    event.preventDefault();

    var author = $('input[name=username]').val();
    var message = $('input[name=message]').val();
    var dateTime = getDateTimeNow();
    
    if (author.length && message.length) {
        var messageObject = {
            dateTime: dateTime,
            author: author,
            message: message,
        };
        renderMessage(messageObject);
        socket.emit('sendMessage', messageObject);

        scrollDivBottom($('.messages'));
        $('input[name=message').val('');
    }
});
