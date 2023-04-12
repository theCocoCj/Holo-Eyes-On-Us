let calibrated = false;
let elementClicked;
let puntiELements;
let punti = {
    b_sx: undefined,
    b_dx: undefined,
    a_dx: undefined,
    a_sx: undefined
};
let puntoDaCalibrare = 'b_dx';
let angle = undefined;

let socket = new WebSocket(URL_WS);

socket.addEventListener('open', function() {
    socket.send(REQ.ACCENDI_CAM);
});

socket.addEventListener('message', function(evt) {
    let message = evt.data;
    let body = document.getElementsByTagName('body')[0];

    if(message === ANS.ACCENDI_CAM) {
        body.removeChild(body.children[0]);
        setTimeout(function() {
            socket.send(REQ.SEND_POSITION);
        }, 1000);
        let p = document.createElement('p');
        p.id = 'warning';
        body.appendChild(p);
        setAngle();
    } else if(message.indexOf(ANS.SEND_POSITION + '_') === 0) {
        if(!calibrated) {
            let positions = [];
            let t = message.split(ANS.SEND_POSITION + '_')[1].split('\n\n');
            t.pop();
            for (let pos of t)
                positions.push(getObjectFromData(pos))

            let a_v = allVisible(positions);
            if (a_v !== 'yes')
                document.getElementById('warning').innerHTML = a_v;
            else {
                document.getElementById('warning').innerHTML = '';
                let mano = manoSopraLaTesta(positions);
                if (mano != null) {
                    let i;
                    if (mano === 'sinistra')
                        i = INDEXS.PIEDI.SX[1];
                    else
                        i = INDEXS.PIEDI.DX[1];
                    angle.style.backgroundColor = 'rgba(0,255,0,0.50)';

                    socket.send(REQ.STOP_SEND_POSITION);
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
        } else {
            let esci = false;
            let m = message.split(ANS.SEND_POSITION + '_')[1].split('\n\n');
            let poss = [];
            m.pop();
            for(let n = 0; n < 4; n ++)
                poss.push(getObjectFromData(m.pop()));
            for(let el of getPuntiEachElement(false)) {
                let arr = [el.punti.a_dx, el.punti.a_sx, el.punti.b_dx, el.punti.b_sx];
                for(let pos of poss)
                    if(pointInPolygon(arr, pos)) {
                        elementClicked = el.element;
                        esci = true;

                        if(el.element.href.indexOf('/game') !== -1) {
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

                            socket.send(REQ.SAVE_CALIBR + '_' + JSON.stringify(dati));
                        } else
                            createMeta('/game/calibrazione');
                        break;
                    }
                if(esci)
                    break;
            }
        }
    } else if(message === ANS.SAVE_CALIBR)
        setTimeout(() => {
            createMeta('/game');
        }, 2500);
});

function createMeta(url) {
    let meta = document.createElement('meta');
    meta.httpEquiv = 'refresh';
    meta.content = "0; url='" + url + "'";
    document.getElementsByTagName('head')[0].appendChild(meta);
}

function setFineCalibrazione() {
    let w = document.getElementById('warning');
    w.innerHTML = 'CALIBRAZIONE COMPLETATA';
    let div = document.createElement('div');

    let a1 = document.createElement('a');
    a1.innerHTML = 'TORNA ALLA HOME';
    a1.href = '/game';
    a1.style.textDecoration = 'none';
    a1.style.color = '#fff';
    div.appendChild(a1);
    let a2 = document.createElement('a');
    a2.innerHTML = 'RIFAI LA CALIBRAZIONE';
    a2.href = '/game/calibrazione';
    a2.style.textDecoration = 'none';
    a2.style.color = '#fff';
    div.appendChild(a2);

    document.getElementsByTagName('body')[0].appendChild(div);
}

function setAngle() {
    let b = document.getElementsByTagName('body')[0];
    angle = document.createElement('div');
    angle.className = 'div-angle ' + puntoDaCalibrare;
    b.appendChild(angle);
}