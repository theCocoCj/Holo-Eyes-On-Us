let calibrated = false; //indicate if the calibration was done prevously
let elementClicked;
let puntiELements;
//are the position of the corners of the screen
let punti = {
    b_sx: undefined,
    b_dx: undefined,
    a_dx: undefined,
    a_sx: undefined
};
let puntoDaCalibrare = 'b_sx';
let angle = undefined;

let socket = new WebSocket('ws://localhost:3000'); //a WebSocket object that connects to the URL " ws://localhost:3000"

//request to the server for the turning on of the cam
socket.addEventListener('open', function() {
    socket.send(REQ.ACCENDI_CAM);
});

//execute the code when a message is received from the server
socket.addEventListener('message', function(evt) {
    let message = evt.data;
    let body = document.getElementsByTagName('body')[0];

    //if the message is requesting the turning on of the camera...
    if(message === ANS.ACCENDI_CAM) {
        body.removeChild(body.children[0]);
        setTimeout(() => {
            socket.send(REQ.SEND_POSITION);
        }, 1000);
        let p = document.createElement('p');
        p.id = 'warning';
        body.appendChild(p);
        setAngle();
        //the code checks whether the calibration has already been completed or not
    } else if(message.indexOf(ANS.SEND_POSITION + '_') === 0) {
        if(!calibrated) { //if is not calibrated
            let positions = [];

            let t = message.split(ANS.SEND_POSITION + '_')[1].split('\n\n');
            t.pop();
            for (let pos of t)
                positions.push(getObjectFromData(pos))

            //if all the body is visible on the cam...
            let a_v = allVisible(positions);
            if (a_v !== 'yes')
                document.getElementById('warning').innerHTML = a_v;
            else {
                //calibration of the page
                //when the tip of the foot is on the corner and the corrrect hand is raised up,
                //the calibration of the corner is done
                document.getElementById('warning').innerHTML = '';
                let mano = manoSopraLaTesta(positions);
                if (mano != null) {
                    let i;
                    //if is the left hand..
                    if (mano === 'sinistra')
                        i = INDEXS.PIEDI.SX[1];//tip of the left foot
                    else//otherwise...
                        i = INDEXS.PIEDI.DX[1]; //tip of the right foot
                    angle.style.backgroundColor = 'rgba(0,255,0,0.50)'; //the corner turns green

                    socket.send(REQ.STOP_SEND_POSITION);

                    //this is the last corner to calibrate, after a delay the calibration variables are saved and the positions are sent
                    if (puntoDaCalibrare === 'b_sx') {
                        punti.b_sx = positions[i];
                        dati = punti;
                        console.log(puntiELements)
                        calibrated = true;
                        setTimeout(() => {
                            console.log(punti);
                            body.removeChild(angle);
                            setFineCalibrazione();
                            socket.send(REQ.SEND_POSITION);
                        }, 2000);
                    } else {
                        //the coordinates are assigned to the correct variables...b_sx, b_dx.. while doing the calibration
                        console.log(puntoDaCalibrare, ': ', positions[i]);
                        if (puntoDaCalibrare === 'a_sx') {
                            punti.a_sx = positions[i];
                            puntoDaCalibrare = 'b_sx';
                        } else if (puntoDaCalibrare === 'b_dx') {
                            punti.b_dx = positions[i];
                            puntoDaCalibrare = 'a_dx';
                        } else if (puntoDaCalibrare === 'a_dx') {
                            punti.a_dx = positions[i];
                            puntoDaCalibrare = 'a_sx';
                        }
                        setTimeout(() => {
                            body.removeChild(angle);
                            setAngle();
                            socket.send(REQ.SEND_POSITION);
                        }, 2000);
                    }
                }
            }
            // if the calibration was done..
        } else {
            let esci = false;
            //the positions of the corners are send
            let m = message.split(ANS.SEND_POSITION + '_')[1].split('\n\n');
            let poss = [];
            m.pop();
            //with all the positions the buttons are created and there is a control of the mouse if is in the area of one of the button
            for(let n = 0; n < 4; n ++)
                poss.push(getObjectFromData(m.pop()));
            for(let el of getPuntiEachElement(false)) {
                let arr = [el.punti.a_dx, el.punti.a_sx, el.punti.b_dx, el.punti.b_sx];
                for(let pos of poss)
                    if(pointInPolygon(arr, pos)) {
                        elementClicked = el.element;
                        esci = true;
                        //the buttons of the firts page are created in the correct position
                        if(el.element.href.indexOf('homePage.html') !== -1) {
                            //creation of the button
                            while (body.childElementCount > 0)
                                body.removeChild(body.children[0]);
                            let pause = document.createElement('button');
                            pause.className = 'btn btn-primary';
                            pause.type = 'button';
                            pause.disabled = true;
                            let sp = document.createElement('span');
                            sp.className = 'spinner-border spinner-border-sm';
                            sp.ariaRoleDescription = 'status';
                            sp.ariaHidden = 'true';
                            pause.appendChild(sp);
                            pause.innerHTML = 'salvataggio dei dati';
                            body.appendChild(pause);
                            //request for the calibration saving
                            socket.send(REQ.SAVE_CALIBR + '_' + JSON.stringify(dati));
                        } else
                            //here we are redirected to the page of the calibration
                            createMeta('calibrazione.html');
                        break;
                    }
                if(esci)
                    break;
            }
        }
        //if is calibrated...
    } else if(message === ANS.SAVE_CALIBR)
        setTimeout(() => {
            createMeta('homePage.html');//the homepage is created
        }, 2500);
});

//the meta of the HTML's page is created inside the head to redirect to other page
function createMeta(url) {
    let meta = document.createElement('meta');
    meta.httpEquiv = 'refresh';
    meta.content = "0; url='" + url + "'";
    document.getElementsByTagName('head')[0].appendChild(meta);
}

//final messages of the calibration and of the buttons and it appends in the tags the buttons
//the links to the other pages are created
function setFineCalibrazione() {
    let w = document.getElementById('warning');
    w.innerHTML = 'CALIBRAZIONE COMPLETATA';
    let div = document.createElement('div');

    let a1 = document.createElement('a');
    a1.innerHTML = 'TORNA ALLA HOME';
    a1.href = 'homePage.html';
    a1.style.textDecoration = 'none';
    a1.style.color = '#fff';
    div.appendChild(a1);
    let a2 = document.createElement('a');
    a2.innerHTML = 'RIFAI LA CALIBRAZIONE';
    a2.href = 'calibrazione.html';
    a2.style.textDecoration = 'none';
    a2.style.color = '#fff';
    div.appendChild(a2);

    document.getElementsByTagName('body')[0].appendChild(div);
}
//creates a new div element and adds it to the HTML's body
function setAngle() {
    let b = document.getElementsByTagName('body')[0];
    angle = document.createElement('div');
    angle.className = 'div-angle ' + puntoDaCalibrare;
    b.appendChild(angle);
}