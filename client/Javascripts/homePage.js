let socket = new WebSocket(URL_WS);
let nSec = 5;

socket.addEventListener('open', function() {
    socket.send(REQ.CALIBR_FATTA); // Send CALIBR_FATTA request when the socket is opened
});

socket.addEventListener('message', function(evt) {
    let message = evt.data;

    if(message === ANS.CALIBR_FATTA.FALSE) {
        let body = document.getElementsByTagName('body')[0];
        body.removeChild(body.children[0]);  // Remove the first child of body element

        // Create a div element for displaying a message
        let divMess = document.createElement('div');
        divMess.id = 'div-p';
        body.appendChild(divMess);

        // Create a paragraph element with a message
        let mess_1 = document.createElement('p');
        mess_1.innerHTML = 'Non ti sei ancora mai calibrato, fallo subito per iniziare a giocare';
        mess_1.className = 'mess';
        divMess.appendChild(mess_1);

        // Set a meta tag for refreshing the page after a specified time interval (5s)
        let meta = document.createElement('meta');
        meta.httpEquiv = 'refresh';
        meta.content = nSec + "; url='HTMLs/calibrazione.html'";
        document.getElementsByTagName('head')[0].appendChild(meta);

        // Create another paragraph element for displaying countdown
        let mess_2 = document.createElement('p');
        mess_2.innerHTML = 'Calibrazione fra ' + nSec;
        mess_2.className = 'mess';
        divMess.appendChild(mess_2);

        // Update countdown and paragraph every second
        setInterval(function() {
            nSec --;
            mess_2.innerHTML = 'Calibrazione fra ' + nSec;
        }, 1000);
    } else if(message === ANS.CALIBR_FATTA.TRUE)
        socket.send(REQ.ACCENDI_CAM); // Send ACCENDI_CAM request if CALIBR_FATTA is TRUE
    else if(message.indexOf(ANS.GET_DATI_CALIBR + '_') === 0) {
        // Parse message to extract JSON calibration data and send SEND_POSITION request
        let obj = JSON.parse(message.split(ANS.GET_DATI_CALIBR + '_')[1]);
        delete obj.fatta;
        dati = obj;
        socket.send(REQ.SEND_POSITION);
    } else if(message.indexOf(ANS.SEND_POSITION + '_') === 0) {
        // Extract position data from message and perform some operations
        let m = message.split(ANS.SEND_POSITION + '_')[1].split('\n\n');
        m.pop();
        let poss = [];
        for(let n = 0; n < 4; n ++)
            poss.push(getObjectFromData(m.pop())); // transform the last 4 positions in objects

        // Check if position data lies within any polygon and perform further actions
        for(let el of getPuntiEachElement(false)) {
            let arr = [el.punti.a_dx, el.punti.a_sx, el.punti.b_dx, el.punti.b_sx]; // array with every 4 points pr polygon of the element
            for (let pos of poss)
                if (pointInPolygon(arr, pos)) { //if a point of a foot is into the element-polygon
                    // create a meta to refresh and change the page
                    let meta = document.createElement('meta');
                    meta.httpEquiv = 'refresh';
                    meta.content = "0; url='" + el.element.href + "'";
                    document.getElementsByTagName('head')[0].appendChild(meta);
                }
        }
    } else if(message === ANS.ACCENDI_CAM) {  // If the received message is equal to ANS.ACCENDI_CAM
        let body = document.getElementsByTagName('body')[0];
        body.removeChild(body.children[0]); // Remove the first child element of body
        body.className = 'body-after';

        // Create a new div element with id 'div-a'
        let div = document.createElement('div');
        div.id = 'div-a';

        // Create three anchor elements (a1, a2, a3) with their respective href, innerHTML, and styles (they are the buttons in the homePage (index.html)
        let a1 = document.createElement('a')
        a1.href = 'HTMLs/freePiano.html';
        a1.innerHTML = 'PIANO LIBERO';
        a1.style.textDecoration = 'none';
        a1.style.color = '#fff';

        let a2 = document.createElement('a')
        a2.href = 'HTMLs/calibrazione.html';
        a2.innerHTML = 'CALIBRAZIONE';
        a2.style.textDecoration = 'none';
        a2.style.color = '#fff';

        let a3 = document.createElement('a')
        a3.href = 'HTMLs/pianoBase.html';
        a3.innerHTML = 'PIANO CON BASE';
        a3.style.textDecoration = 'none';
        a3.style.color = '#fff';

        // Append the anchor elements (a1, a2, a3) to the div element
        div.appendChild(a1);
        div.appendChild(a2);
        div.appendChild(a3);
        body.appendChild(div);  // Append the div element to the body

        socket.send(REQ.GET_DATI_CALIBR);  // Send the request REQ.GET_DATI_CALIBR through the socket
    }
});