const socket = io();

socket.on('receivedMessage', message => {
    renderMessage(message);
});

socket.on('previousMessages', messages => {
    messages.forEach(message => {
        message.notification === 1 ? renderNotification(message) : renderMessage(message);
    });
    scrollDivBottom($messages);
});

socket.on('autoDeleteMessages', () => {
    let $singleMessage = $('.chat--messages-single');
    $chat.find($singleMessage).fadeOut(500, function() {
        $singleMessage.remove();
    });
});

socket.on('authorAlreadyInUse', () => {
    Swal.fire(
        'Opa!',
        'Usuário já está em uso no chat.',
        'warning'
    );
    $inputUsername.val('');
});

socket.on('blockUsernameChange', () => {
    $inputUsername.prop('disabled', true);
});

socket.on('sendNotification', message => {
    renderNotification(message);
});

$(document).ready(() => {
    addChatSuggestions(chatSuggestions);
    initSuggestionsSlider();
    dotsAnimation();
});

$chat.keypress(event => {
    let key = event.which;
    if(key == 13){
       return false;
    }
});

$chat.submit(event => {
    event.preventDefault();

    let author = $inputUsername.val();
    let message = $inputMessage.val();
    
    if (author.length && message.length) {
        let messageObject = {
            dateTime: new Date(),
            author: author,
            message: message
        };
        renderMessage(messageObject);
        socket.emit('sendMessage', messageObject);

        scrollDivBottom($messages);
        $inputMessage.val('');
    }
});

$inputUsername.change(() => {
    let author = $inputUsername.val();
    
    if (author.length) {
        let authorObject = {
            author: author,
            id: socket.id,
        };
        socket.emit('sendAuthor', authorObject);
    }
});

function initSuggestionsSlider(){
    let mouseIsDown = false;
    let startX;
    let scrollLeft;

    $suggestions.on('mousedown', (event) => {
        mouseIsDown = true;
        $suggestions.addClass('active');
        startX = event.pageX - $suggestions.offset().left;
        scrollLeft = $suggestions.scrollLeft();
    });

    $suggestions.on('mouseleave', () => {
        mouseIsDown = false;
        $suggestions.removeClass('active');
    });

    $suggestions.on('mouseup', () => {
        mouseIsDown = false;
        $suggestions.removeClass('active');
    });

    $suggestions.on('mousemove', (event) => {
        if(!mouseIsDown) return;
        event.preventDefault();
        const x = event.pageX - $suggestions.offset().left;
        const walk = (x - startX) * 2;
        $suggestions.scrollLeft(scrollLeft - walk);
    });
};

$suggestions.click(event => {
    let currentSuggestion = $(event.target);
    if (currentSuggestion[0].childElementCount == 0) {
        $inputMessage.val($inputMessage.val() + currentSuggestion.text() + ' ');
        addChatSuggestions([currentSuggestion.text()]);
        currentSuggestion.remove();
    }
});

tippy('#sharelink', {
    trigger: 'click',
    content: "📋 Copiado com sucesso!",
    placement: 'bottom',
    allowHTML: true
});

$('#sharelink').click(() => {
    let href = window.location.href;
    navigator.clipboard.writeText(href);
});