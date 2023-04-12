const NOMI_BASI = ['Dimmi', 'Good Enough - Cheeky', 'Nights', 'Siri', 'Softy - Bridges']; // 'Home Grown - hideout', // Array of base titles

const WIDTH_RESIZE_PIANO = 1400, HEIGHT_RESIZE_PIANO = 700, HEIGHT_RESIZE_INFO = 650;    //piano dimensions
let PIANO3D, PIANO2D, TOP_PAGE, SECT_PIANO_2D, INFO, DURATION, VOLUME, MENU_TENDINA, BTN, OPTIONS, PAUSE_RESUME = { }; // References to various HTML elements

let base = undefined, textTime, intervalUpdateTime = undefined, baseDuration, secBasePassati, active = undefined;  // Variables for storing information about the current base and the song
let isPause = false, menuAperto = false, alreadyPressed = false, myDropdown;    // Booleans indicating whether the menu is open and whether the song is currently paused

window.addEventListener('load', function() {    // Load the page
    // Get references to various HTML elements
    myDropdown = document.getElementById('menu');
    //base = document.getElementById('audio-base');
    textTime = document.getElementById('testo');

    let tasti2_3D = [], tasti2_2D = [];
    PIANO3D = document.getElementById('piano');
    PIANO2D = document.getElementById('piano-2d');

    let btns = document.getElementsByTagName('button'), t = [];
    let divs = document.getElementsByClassName('key');
    for(let btn of btns)
        if(btn.className.indexOf('key-') !== -1)
            t.push(btn);             //push of key buttons in the array of buttons

    // Divide buttons in two arrays for 3d and 2d piano
    for(let k = Math.ceil(t.length / 2); k < t.length; k ++)
        tasti2_3D.push(t[k]);
    for(let k = Math.ceil(divs.length / 2); k < divs.length; k ++)
        tasti2_2D.push(divs[k]);

    // Get some more elements from HTML
    TOP_PAGE = document.getElementById('sopra');
    SECT_PIANO_2D = document.getElementsByClassName('piano2D')[0];
    INFO = document.getElementById('info');
    DURATION = document.getElementById('durata-canzone');
    VOLUME = document.getElementById('volume');
    MENU_TENDINA = document.getElementsByClassName('menuSong')[0];
    BTN = document.getElementsByClassName('btn-secondary')[0];
    let UL = document.getElementById('ul-menu');
    OPTIONS = [];

    // Create a dropdown menu for each base title
    for(let title of NOMI_BASI) {
        // If an interval update is currently defined, clear it
        if(intervalUpdateTime !== undefined)
            clearInterval(intervalUpdateTime);
        let li = document.createElement('li');
        let __btn = document.createElement('button');

        // Set the button attributes
        __btn.className = 'dropdown-item';
        __btn.innerHTML = title;
        __btn.style.fontSize = '30px';   //font size
        __btn.style.height = '70px';   //button's height
        li.appendChild(__btn);
        UL.appendChild(li);
        // Add an event listener to each button in the dropdown menu
        __btn.addEventListener('click', function() {
            if(intervalUpdateTime !== undefined)
                clearInterval(intervalUpdateTime);
            // Change the active button and the base
            changeActive(__btn);
            cambioBase();
        });
        OPTIONS.push(__btn);
    }

    // Check the size of the window every 200 milliseconds and adjust the layout as necessary
    setInterval(() => {
        if(innerWidth < WIDTH_RESIZE_PIANO && PIANO3D.children.length > 15) {

            // If the window is too small, remove some piano keys
            tasti2_3D.forEach(t => { PIANO3D.removeChild(t); });
            tasti2_2D.forEach(t => { PIANO2D.removeChild(t); });
        } else if(innerWidth > WIDTH_RESIZE_PIANO && PIANO3D.children.length < 15) {
            // If the window is large enough, add more piano keys
            tasti2_3D.forEach(t => { PIANO3D.appendChild(t); });
            tasti2_2D.forEach(t => { PIANO2D.appendChild(t); });
        }

        //If the height of the window is less than HEIGHT_RESIZE_PIANO and there is more than one child element in TOP_PAGE
        if(innerHeight < HEIGHT_RESIZE_PIANO && TOP_PAGE.childElementCount > 1) {
            //Remove the 2D piano section and adjust the margins
            TOP_PAGE.removeChild(SECT_PIANO_2D);
            INFO.style.margin = '50px';
            TOP_PAGE.style.marginTop = '-100px';
        }
        //Otherwise, if the height of the window is greater than HEIGHT_RESIZE_PIANO and there is only one child element in TOP_PAGE
        else if(innerHeight > HEIGHT_RESIZE_PIANO && TOP_PAGE.childElementCount < 2) {
            //Remove the INFO section and add the 2D piano section and adjust the margins
            TOP_PAGE.removeChild(INFO);
            TOP_PAGE.appendChild(SECT_PIANO_2D);
            INFO.style.width = '50%';
            INFO.style.margin = '50px 10% 0 10%';
            TOP_PAGE.style.marginTop = '0';
            TOP_PAGE.appendChild(INFO);
        }
        //If the height of the window is less than HEIGHT_RESIZE_INFO and there are three child elements in INFO
        if(innerHeight < HEIGHT_RESIZE_INFO && INFO.childElementCount === 3) {
            //Remove the DURATION element and adjust the margins
            INFO.removeChild(DURATION);
            INFO.style.width = '100%';
            INFO.style.margin = '-20px 0 0 0';
            INFO.style.flexDirection = 'row';
            INFO.style.justifyContent = 'space-around';
            MENU_TENDINA.style.width = '45%';
            VOLUME.style.width = '45%';
            VOLUME.style.alignSelf = '50px';
        }
        //Otherwise, if the height of the window is greater than HEIGHT_RESIZE_INFO and there are two child elements in INFO
        else if(innerHeight > HEIGHT_RESIZE_INFO && INFO.childElementCount === 2) {
            //Remove the MENU_TENDINA and VOLUME elements and add the DURATION element and adjust the margins
            INFO.removeChild(MENU_TENDINA);
            INFO.removeChild(VOLUME);
            INFO.appendChild(DURATION);
            INFO.appendChild(MENU_TENDINA);
            INFO.appendChild(VOLUME);
            INFO.style.width = '45%';
            INFO.style.margin = '50px';
            INFO.style.flexDirection = 'column';
            INFO.style.justifyContent = 'center';
            MENU_TENDINA.style.width = '100%';
            VOLUME.style.width = '100%';
            VOLUME.style.alignSelf = 'flex-end';
        }
        //Set the minWidth property of all the elements with class OPTIONS to the offsetWidth of BTN
        for(let opt of OPTIONS)
            opt.style.minWidth = BTN.offsetWidth + 'px';
    }, 200);

    //Assign the HTML element with id 'stop-resume-btn' to the button property of the object PAUSE_RESUME and the child element with index 0 to the icon property of the object PAUSE_RESUME
    PAUSE_RESUME.button = document.getElementById('stop-resume-btn');
    PAUSE_RESUME.icon = PAUSE_RESUME.button.children[0];
});

function setPauseResume() {
    isPause = !isPause;  //the base for start is necessary to be !isPause
    if(isPause) {
        base.pause();  //the base stop
        PAUSE_RESUME.icon.name = 'caret-forward-outline';
    } else {
        //base.currentTime = secBasePassati;
        base.play().catch((err) => { console.log(err) });
        PAUSE_RESUME.icon.name = 'pause-outline';
    }
}

function sound(name) {
    new Audio('../Assets/Audios/note/' + name + '.mp3').play();    //load of note sound
}

//this function change the image of the button pause/play
function changeActive(btn) {
    BTN.innerHTML = btn.innerHTML;
    if(active !== undefined)
        active.className = 'dropdown-item';
    active = btn;
    btn.className += ' active';
}

function itoa(i) {  //if the number is <10 add 0 before number (5->05)
    return i < 10? '0' + i: i;
}

// The following function plays an audio file and updates the text displaying the current and total duration
function cambioBase() {
    // If an audio file is already playing, pause it before starting the new one
    if(base !== undefined)
        base.pause();
    // Create a new Audio object with the file path specified by the button's innerHTML
    base = new Audio('../Assets/Audios/Basi/' + BTN.innerHTML + '.mp3');
    // Load the audio file
    base.load();
    // If the audio file was not paused before changing, start playing it and catch any errors
    if(!isPause)
        base.play().catch((err) => { console.log(err) });

    // Wait 300 milliseconds for the audio file to load, then update the text displaying the current and total duration
    setTimeout(function() {  // otherwise it doesn't know the duration
        // Calculate the duration of the audio file in minutes and seconds and store it in an object
        baseDuration = { m: Math.floor(parseInt(base.duration) / 60), s: parseInt(base.duration) % 60 };
        // Update the text displaying the current and total duration
        textTime.innerHTML = '00:00 - ' + itoa(baseDuration.m) + ':' + itoa(baseDuration.s);
        secBasePassati = 0;

        // Update the text displaying the current duration every second
        intervalUpdateTime = setInterval(function() {
            if(!isPause) {
                secBasePassati++;
                textTime.innerHTML = itoa(Math.floor(secBasePassati / 60)) + ':' + itoa(secBasePassati % 60) + ' - ' + itoa(baseDuration.m) + ':' + itoa(baseDuration.s);
                // If the audio file has finished playing, clear the interval and start playing the next one
                if (secBasePassati >= parseInt(base.duration)) {
                    clearInterval(intervalUpdateTime);
                    intervalUpdateTime = undefined;
                    changeActive(OPTIONS[(NOMI_BASI.indexOf(BTN.innerHTML) + 1) % NOMI_BASI.length]);
                    cambioBase();
                }
            }
        }, 1000);
    }, 300);
}


// Create a WebSocket object
let socket = new WebSocket('ws://localhost:3000');
let esci = false;

// When the WebSocket connection is opened, send a message to get the calibration data
socket.addEventListener('open', function() {
    //send a message to turn on the camera
    socket.send(REQ.ACCENDI_CAM);
});

// When a message is received over the WebSocket connection, parse the message and update the relevant variables
socket.addEventListener('message', function(evt) {
    let message = evt.data;
    // If the message is to turn on the camera, send a message to get the calibration data
    if(message === ANS.ACCENDI_CAM)
        socket.send(REQ.GET_DATI_CALIBR);
    // If the message contains the calibration data, parse it and update the "dati", then send a message to send the position data
    else if(message.indexOf(ANS.GET_DATI_CALIBR + '_') === 0) {
        let obj = JSON.parse(message.split(ANS.GET_DATI_CALIBR + '_')[1]);
        delete obj.fatta;
        dati = obj;
        socket.send(REQ.SEND_POSITION);

        // If the message contains the position data and the "esci" variable is false, parse it and push the objects onto the "poss" array
    } else if(message.indexOf(ANS.SEND_POSITION + '_') === 0 && !esci) {
        // Split the message by the separator and create an array of objects
        let m = message.split(ANS.SEND_POSITION + '_')[1].split('\n\n');
        m.pop();
        let poss = [];
        for (let n = 0; n < 4; n++)
            poss.push(getObjectFromData(m.pop()));
        // Iterate through each element on the 2D plane and the Pause/Resume button on the 3D plane
        for(let isPiano of [false, true]) {
            for (let el of getPuntiEachElement(isPiano, [PAUSE_RESUME.button, BTN])) {
                let arr = [el.punti.a_dx, el.punti.a_sx, el.punti.b_dx, el.punti.b_sx];

                // Check if the position is within the element
                for (let pos of poss) {
                    if (pointInPolygon(arr, pos)) {
                        esci = true;
                        console.log(el.element)
                        if (isPiano) {
                            // Play sound
                            sound(el.element.id);
                            //let index = PIANO3D.children.indexOf(el.element);
                            //PIANO2D.children[index].style.backgroundColor = '#0f0';
                            setTimeout(() => {
                                esci = false;
                                //PIANO2D.children[index].style.backgroundColor = '#fff';
                            }, 1000);
                            // Redirect to homePage.html for button A
                        } else if (el.element.tagName === 'A') {
                            let meta = document.createElement('meta');
                            meta.httpEquiv = 'refresh';
                            meta.content = "0; url='homePage.html'";
                            document.getElementsByTagName('head')[0].appendChild(meta);
                            // Pause or resume audio playback for Pause/Resume button
                        } else if (el.element === PAUSE_RESUME.button) {
                            console.log('qui');
                            setPauseResume();
                            setTimeout(() => esci = false, 2000);
                        } else if(el.element === BTN) {
                            console.log('menu');
                            menuAperto = true;
                            //BTN.click();
                            //if(!menuAperto)
                            $('#ul-menu').show();
                            //else
                            //$('#ul-menu').hide();
                            //menuAperto = !menuAperto;
                            //esci = false;

                            /*if (!alreadyPressed) {
                                esci = false;
                                alreadyPressed = true;
                            }else{*/
                            setTimeout(() => {
                                esci = false
                            }, 1000);
                            //}
                        }
                    }
                    if (esci)    //if esci(out)==true program stop
                        break;
                }
            }
        }
    }
});