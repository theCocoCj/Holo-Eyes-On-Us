const NOMI_BASI = ['Dimmi', 'Good Enough - Cheeky', 'Nights', 'Siri', 'Softy - Bridges']; // Array of base titles

const WIDTH_RESIZE_PIANO = 1400, HEIGHT_RESIZE_PIANO = 700, HEIGHT_RESIZE_INFO = 650; // min height and width dimensions to responsive the page
let PIANO3D, PIANO2D, TOP_PAGE, SECT_PIANO_2D, INFO, DURATION, VOLUME, MENU_TENDINA, BTN, OPTIONS, PAUSE_RESUME = { }, ROT, VOLUMES, UL; // References to various HTML elements

let base = undefined, textTime, intervalUpdateTime = undefined, baseDuration, secBasePassati, active = undefined; // Variables for storing information about the current base
let isPause = false, menuAperto = false, volume = 100, arrVol = [], arrChildren = [], arrChildren2D = []; // variables that indicate if the menu is open, if is in pause and the arrays with some key of the piano
let pianoLibero = true;

window.addEventListener('load', function() {  // event on load of the page
    textTime = document.getElementById('testo'); // set the HTML element of the time of a song

    let tasti2_3D = [], tasti2_2D = [];
    PIANO3D = document.getElementById('piano');
    PIANO2D = document.getElementById('piano-2d');

    let btns = document.getElementsByTagName('button'), t = [];
    let divs = document.getElementsByClassName('key');
    for(let btn of btns)
        if(btn.className.indexOf('key-') !== -1)
            t.push(btn);

    // Divide the second mid of keys in the array to add and remove them at the change of the page dimensions
    for(let k = Math.ceil(t.length / 2); k < t.length; k ++)
        tasti2_3D.push(t[k]);
    for(let k = Math.ceil(divs.length / 2); k < divs.length; k ++)
        tasti2_2D.push(divs[k]);

    // Get some more elements from HTML
    TOP_PAGE = document.getElementById('sopra');
    SECT_PIANO_2D = document.getElementsByClassName('piano2D')[0];
    INFO = document.getElementById('info');
    VOLUME = document.getElementById('volume');
    BTN = document.getElementsByClassName('btn-secondary')[0];
    ROT = document.getElementById('rotella-volume');
    VOLUMES = document.getElementsByClassName('btn-volume');

    if(!pianoLibero) {
        DURATION = document.getElementById('durata-canzone');
        MENU_TENDINA = document.getElementsByClassName('menuSong')[0];
        UL = document.getElementById('ul-menu');
        OPTIONS = [];
        // add a voice to the dropdown menu for each base title
        for(let title of NOMI_BASI) {
            let li = document.createElement('li'); // create the <li> of the options
            let __btn = document.createElement('button');

            // Set the button attributes
            __btn.className = 'dropdown-item';
            __btn.innerHTML = title;
            __btn.style.fontSize = '30px';
            __btn.style.height = '70px';
            li.appendChild(__btn);
            UL.appendChild(li);

            // Add the click event to each button in the dropdown menu
            __btn.addEventListener('click', function() {
                if(intervalUpdateTime !== undefined)
                    clearInterval(intervalUpdateTime);
                // Change the active button and the base
                changeActive(__btn);
                cambioBase();
            });
            OPTIONS.push(__btn);
        }
    }

    //add a click event listener to each volume control element
    for(let vol of VOLUMES) {
        vol.addEventListener('click', function() {
            volume = parseInt(vol.id.split('_')[1]);
            ROT.className = vol.id + '_';
            if(!pianoLibero && base !== undefined)
                base.volume = volume / 100;
        });
        //add the current volume control element in an array of volume controls
        arrVol.push(vol);
    }

    // add 4 div elements to each piano key element in the 3D piano
    for(let child of PIANO3D.children)
        for(let name of ['bsx', 'asx', 'bdx', 'adx']) {
            let d = document.createElement('div');
            d.className = 'piano3d-' + name;
            child.appendChild(d);
            // Add the current piano key element in an array of piano keys
            arrChildren.push(child);
        }

    // Add each piano key element in the 2D piano in an array of piano keys
    for(let child of PIANO2D.children)
        arrChildren2D.push(child)

    // Check the size of the window every 200 milliseconds and adjust the layout as necessary
    setInterval(() => {
        if(innerWidth < WIDTH_RESIZE_PIANO && PIANO3D.children.length > 15) { // If the window is too small, remove some piano keys
            tasti2_3D.forEach(t => { PIANO3D.removeChild(t); });
            tasti2_2D.forEach(t => { PIANO2D.removeChild(t); });
        } else if(innerWidth > WIDTH_RESIZE_PIANO && PIANO3D.children.length < 15) {  // If the window is large enough, add more piano keys
            tasti2_3D.forEach(t => { PIANO3D.appendChild(t); });
            tasti2_2D.forEach(t => { PIANO2D.appendChild(t); });
        }

        //If the height of the window is less than HEIGHT_RESIZE_PIANO the 2d piano was removed
        if(innerHeight < HEIGHT_RESIZE_PIANO && TOP_PAGE.childElementCount > 1) {
            //Remove the 2D piano section and adjust the margins
            TOP_PAGE.removeChild(SECT_PIANO_2D);
            //INFO.style.margin = '50px';
            TOP_PAGE.style.marginTop = '-100px';

            if(!pianoLibero) {
                INFO.removeChild(DURATION);
                MENU_TENDINA.style.width = '45%';
            } else
                INFO.style.width = '100%';
            VOLUME.style.width = pianoLibero? '70%': '45%';
            INFO.style.margin = '-20px 0 0 0';
            INFO.style.flexDirection = 'row';
            INFO.style.justifyContent = 'center';
            VOLUME.style.alignSelf = 'center';
        }
        // Otherwise, if the height of the window is greater than HEIGHT_RESIZE_PIANO the 2d piano was added
        else if(innerHeight > HEIGHT_RESIZE_PIANO && TOP_PAGE.childElementCount < 2) {
            //Remove the INFO section and add the 2D piano before and adjust the margins
            TOP_PAGE.removeChild(INFO);
            TOP_PAGE.appendChild(SECT_PIANO_2D);
            TOP_PAGE.style.marginTop = '0';
            TOP_PAGE.appendChild(INFO);
            
            INFO.removeChild(VOLUME);
            if(!pianoLibero) {
                INFO.removeChild(MENU_TENDINA);
                INFO.appendChild(DURATION);
                INFO.appendChild(MENU_TENDINA);
                MENU_TENDINA.style.width = '100%';
            }
            INFO.appendChild(VOLUME);
            INFO.style.width = '45%';
            INFO.style.margin = '50px';
            INFO.style.flexDirection = 'column';
            INFO.style.justifyContent = 'center';
            VOLUME.style.width = '100%';
            VOLUME.style.alignSelf = 'flex-end';
        }

        if(!pianoLibero) {
            //Set the minWidth property of all the elements with class OPTIONS to the width of BTN
            for (let opt of OPTIONS)
                opt.style.minWidth = BTN.offsetWidth + 'px';
        }
    }, 200);


    //Assign the HTML element with id 'stop-resume-btn' to the button property of the object PAUSE_RESUME and the child element with index 0 to the icon property of the object PAUSE_RESUME
    PAUSE_RESUME.button = document.getElementById('stop-resume-btn');
    PAUSE_RESUME.icon = PAUSE_RESUME.button.children[0];

    // assign to the height of the ROT its width in pixel
    ROT.style.height = ROT.offsetWidth + 'px';
});

function setPauseResume() {
    isPause = !isPause; // change the state of isPause
    if(isPause && base !== undefined) {
        base.pause();  // stop the base
        PAUSE_RESUME.icon.name = 'caret-forward-outline'; // change the icon
    } else if(base !== undefined) {
        base.play().catch((err) => { console.log(err) }); // start the base
        PAUSE_RESUME.icon.name = 'pause-outline'; // change the icon
    }
}

function sound(name) {
    if(!isPause) {
        let a = new Audio('../Assets/Audios/note/' + name + '.mp3');
        a.volume = volume / 100;
        a.play().catch(() => {
        });
    }
}

function changeActive(btn) {
    BTN.innerHTML = btn.innerHTML;
    if(active !== undefined)
        active.className = 'dropdown-item';
    active = btn; // assign to the active variables the pressed button of the menu
    btn.className += ' active'; // change the status of the pressed button of the menu
}

function itoa(i) { //if the number is < 10 add 0 before number (5->05)
    return i < 10? '0' + i: i;
}

// The following function plays an audio file and updates the text displaying the current and total duration
function cambioBase() {
    // If an audio file is already playing, pause it before starting the new one
    if(base !== undefined)
        base.pause();
    base = new Audio('../Assets/Audios/Basi/' + BTN.innerHTML + '.mp3');    // Create a new Audio object with the file path specified by the button's innerHTML, (equals to the name of th song)
    base.load();     // Load the audio file
    base.volume = volume / 100; // set the volume of the song

    if(!isPause)  // If the audio file was not paused before changing, start playing it and catch any errors

        base.play().catch((err) => { console.log(err) });

    // Wait 300 milliseconds for the audio file to load, then update the text displaying the current and total duration
    setTimeout(function() {  // otherwise the duration will be NaN
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
            for (let el of getPuntiEachElement(isPiano, (menuAperto && !esci)? OPTIONS: arrVol.concat([PAUSE_RESUME.button, BTN]))) {
                let arr = [el.punti.a_dx, el.punti.a_sx, el.punti.b_dx, el.punti.b_sx];

                // Check if the position is within the element
                for (let pos of poss) {
                    if (pointInPolygon(arr, pos)) {
                        // If piano is playing, play the corresponding sound
                        esci = true;
                        console.log(el.element)
                        if (isPiano) {
                            sound(el.element.id);
                            // Get the index of the element and change its background color
                            let index = arrChildren.indexOf(el.element);
                            let oldCol;
                            if(arrChildren2D[index] !== undefined) {
                                oldCol = arrChildren2D[index].style.backgroundColor;
                                arrChildren2D[index].style.backgroundColor = '#0f0';
                            }
                            // Animation of the key that's click
                            if(el.element.className !== 'key-2') {
                                el.element.style.animation = 'keyClicked 0.7s ease';
                                setTimeout(() => {
                                    el.element.style.removeProperty('animation');
                                }, 1400);
                            } else {
                                el.element.style.animation = 'key2Clicked 0.7s ease';
                                setTimeout(() => {
                                    el.element.style.removeProperty('animation');
                                }, 1400);
                            }
                            setTimeout(() => {
                                esci = false;
                                if(arrChildren2D[index] !== undefined)
                                    arrChildren2D[index].style.backgroundColor = '#fff';
                            }, 750);
                        } else if (el.element.tagName === 'A') { // Redirect to homePage.html for button A
                            let meta = document.createElement('meta');
                            meta.httpEquiv = 'refresh';
                            meta.content = "0; url='../index.html'";
                            document.getElementsByTagName('head')[0].appendChild(meta);
                        } else if (el.element === PAUSE_RESUME.button) { // Pause or resume audio playback for Pause/Resume button
                            setPauseResume();
                            setTimeout(() => esci = false, 2000);
                        } else if(el.element === BTN) {
                            $('#ul-menu').show(); //show the menu
                            setTimeout(() => {
                                esci = false;
                                menuAperto = true; //set menuAperto to true after 2 seconds
                            }, 2000);
                        } else if(arrVol.indexOf(el.element) !== -1) {
                            volume = parseInt(el.element.id.split('_')[1]); //set volume to the value of the clicked element
                            ROT.className = el.element.id + '_'; //change the class of ROT
                            setTimeout(() => esci = false, 800); //set esci to false after 0.8 seconds
                            if (base !== undefined)
                                base.volume = volume / 100; //set the volume of the base sound
                        } else if(OPTIONS.indexOf(el.element) !== -1) {
                            menuAperto = false; //set menuAperto to false
                            $('#ul-menu').hide(); //hide the menu
                            if (intervalUpdateTime !== undefined)
                                clearInterval(intervalUpdateTime); //clear the interval
                            changeActive(el.element); //call the changeActive function with the clicked element as parameter
                            cambioBase(); //call the cambioBase function
                            setTimeout(() => esci = false, 800); //set esci to false after 0.8 seconds
                        }
                    }
                    if (esci)  //if esci(out)==true stop the control of the data of the person in front of the cam
                        break;
                }
            }
        }
    }
});