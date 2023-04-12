let dati = {
    b_dx: {
        visibility: 0.9898812770843506,
        x: 0.3051157295703888,
        y: 0.8472602367401123,
        z: -0.04156290739774704
    },
    b_sx: {
        visibility: 0.9596124887466431,
        x: 0.8223257064819336,
        y: 0.8660596013069153,
        z: 0.0038573690690100193
    },
    a_sx: {
        visibility: 0.9430789947509766,
        x: 0.6443069577217102,
        y: 1.0709221363067627,
        z: -0.055593203753232956
    },
    a_dx: {
        visibility: 0.9850335121154785,
        x: 0.04452347010374069,
        y: 1.013640284538269,
        z: -0.1944582164287567
    }
};

let rette = {
    up: ['m', 'q'],
    down: ['m', 'q'],
    right: ['m', 'q'],
    left: ['m', 'q']
};
let puntoProspettiva = {
    x: 'x',
    y: 'y'
};

function setRette() {
    rette.up = getM_Q(dati.a_sx, dati.a_dx);
    rette.down = getM_Q(dati.b_sx, dati.b_dx);
    rette.left = getM_Q(dati.b_sx, dati.a_sx);
    rette.right = getM_Q(dati.b_dx, dati.a_dx);
}

function setPuntoProspettiva() {
    setRette();
    puntoProspettiva.x = (rette.right[1] - rette.left[1]) / (rette.left[0] - rette.right[0]);
    puntoProspettiva.y = rette.left[0] * puntoProspettiva.x + rette.left[1];
}

function getM_Q(p1, p2) {
    let m = (p1.y - p2.y) / (p1.x - p2.x);
    let q = p2.y - m * p2.x;
    return [m, q];
}

function getElementsToClick(exceptions=[], element=undefined) {
    let arr = [];
    if(element === undefined)
        element = document.getElementsByTagName('body')[0];
    if(element.tagName === 'A' || exceptions.indexOf(element) !== -1)
        arr.push(element);
    for (let child of element.children)
        arr = arr.concat(getElementsToClick(exceptions, child));
    return arr;
}

function getOffsetTop(el) {
    if(el == null || el === document.getElementsByTagName('body')[0])
        return 0;
    return el.offsetTop + getOffsetTop(el.offsetParent);
}

function getOffsetLeft(el) {
    if(el == null || el === document.getElementsByTagName('body')[0])
        return 0;
    return el.offsetLeft + getOffsetLeft(el.offsetParent);
}

function getPuntiPerElement(exceptionsElement=[]) {
    let arr = [];
    let elements = getElementsToClick(exceptionsElement);
    for(let el of elements)
        arr.push({
            element: el,
            punti: {
                a_sx: {
                    x: getOffsetLeft(el),
                    y: getOffsetTop(el)
                },
                a_dx: {
                    x: getOffsetLeft(el) + el.offsetWidth,
                    y: getOffsetTop(el)
                },
                b_sx: {
                    x: getOffsetLeft(el),
                    y: getOffsetTop(el) + el.offsetHeight
                },
                b_dx: {
                    x: getOffsetLeft(el) + el.offsetWidth,
                    y: getOffsetTop(el) + el.offsetHeight
                }
            }
        });
    return arr;
}

function getPuntiEachElement(isPiano, exceptionsElement=[]) {
    setPuntoProspettiva();
    let arr = [];

    let widthI = ((dati.b_sx.x - dati.b_dx.x) ** 2 + (dati.b_sx.y - dati.b_dx.y) ** 2) ** .5;
    let heightC = dati.a_sx.y - dati.b_sx.y;

    for(let el of (isPiano)? getPianoCoordinates(): getPuntiPerElement(exceptionsElement)) {
        let x_terra_sx = dati.b_sx.x - widthI * el.punti.b_sx.x / innerWidth;
        let y_terra_sx = rette.down[0] * x_terra_sx + rette.down[1];
        let x_terra_dx = dati.b_sx.x - widthI * el.punti.b_dx.x / innerWidth;
        let y_terra_dx = rette.down[0] * x_terra_dx + rette.down[1];

        let re_sx = getM_Q({ x: x_terra_sx, y: y_terra_sx }, puntoProspettiva);
        let re_dx = getM_Q({ x: x_terra_dx, y: y_terra_dx }, puntoProspettiva);

        let y_to = dati.a_sx.y - heightC * el.punti.a_sx.y / innerHeight;
        let y_bo = dati.a_sx.y - heightC * el.punti.b_sx.y / innerHeight;

        let r_y_to = [rette.down[0], rette.down[1] + y_to - dati.b_sx.y];
        let r_y_bo = [rette.down[0], rette.down[1] + y_bo - dati.b_sx.y];

        let __b_sx_x = (r_y_bo[1] - re_sx[1]) / (re_sx[0] - r_y_bo[0]);
        let __b_dx_x = (r_y_bo[1] - re_dx[1]) / (re_dx[0] - r_y_bo[0]);
        let __a_sx_x = (r_y_to[1] - re_sx[1]) / (re_sx[0] - r_y_to[0]);
        let __a_dx_x = (r_y_to[1] - re_dx[1]) / (re_dx[0] - r_y_to[0]);

        arr.push({
            element: el.element,
            punti: {
                b_sx: {
                    x: __b_sx_x,
                    y: re_sx[0] * __b_sx_x + re_sx[1]
                },
                b_dx: {
                    x: __b_dx_x,
                    y: re_dx[0] * __b_dx_x + re_dx[1]
                },
                a_sx: {
                    x: __a_sx_x,
                    y: re_sx[0] * __a_sx_x + re_sx[1]
                },
                a_dx: {
                    x: __a_dx_x,
                    y: re_dx[0] * __a_dx_x + re_dx[1]
                }
            }
        });
    }
    return arr;
}

function pointInPolygon(polygon, point) {
    //A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
    let odd = false;
    //For each edge (In this case for each point of the polygon and the previous one)
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
        //If a line from the point into infinity crosses this edge
        if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) // One point needs to be above, one below our y coordinate
            // ...and the edge doesn't cross our Y corrdinate before our x coordinate (but between our x coordinate and infinity)
            && (point.x < ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x))) {
            // Invert odd
            odd = !odd;
        }
        j = i;

    }
    //If the number of crossings was odd, the point is in the polygon
    return odd;
}

function getPianoCoordinates() {
    let arr = [];
    let piano = document.getElementById('piano');

    for (let child of piano.children) {
        let bsx = child.children[0].getBoundingClientRect(), asx = child.children[1].getBoundingClientRect();
        let bdx = child.children[2].getBoundingClientRect(), adx = child.children[3].getBoundingClientRect();
        arr.push({
            element: child,
            punti: {
                b_sx: {
                    x: bsx.x,
                    y: bsx.y
                },
                a_sx: {
                    x: asx.x,
                    y: asx.y
                },
                b_dx: {
                    x: bdx.x,
                    y: bdx.y
                },
                a_dx: {
                    x: adx.x,
                    y: adx.y
                }
            }
        });
    }

    return arr;
}