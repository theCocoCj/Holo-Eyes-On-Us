let ws = new WebSocket('ws://localhost:3000');
let username, password, camEsterna;


ws.addEventListener('message', function(evt) {
    let message = evt.data;
    if(message === ANS.CHECK_LOGIN.TRUE)
        createMeta('instructions' + (camEsterna? 'Ext': 'Int') + 'Cam');
    else if(message === ANS.CHECK_LOGIN.FALSE)
        createMeta('login');
});

function createMeta(url) {
    let meta = document.createElement('meta');
    meta.httpEquiv = 'refresh';
    meta.content = "0; url='" + url + '.html' + "'";
    document.getElementsByTagName('head')[0].appendChild(meta);
}

function login() {
    username = document.getElementsByName('username')[0].value;
    password = document.getElementsByName('password')[0].value;
    camEsterna = document.getElementById('flexCheckChecked').checked;

    ws.send(REQ.CHECK_LOGIN + '_' + JSON.stringify({
        username: username,
        password: password
    }));
}