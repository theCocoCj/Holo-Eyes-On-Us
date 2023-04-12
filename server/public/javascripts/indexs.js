const INDEXS = {
    PIEDI: {
        SX : [29, 31],
        DX : [30, 32]
    },
    OCCHI : [1, 2, 3, 4, 5, 6],
    MANI : {
        SX : [17, 19, 21],
        DX : [18, 20, 22]
    }
};
const MIN_VISIBILITY = 0.65;

function getObjectFromData(data) {
    let arr = data.split('\n');
    return {
        x: parseFloat(arr[0].split('x: ')[1]),
        y: parseFloat(arr[1].split('y: ')[1]),
        z: parseFloat(arr[2].split('z: ')[1]),
        visibility: parseFloat(arr[3].split('visibility: ')[1])
    }
}

function allVisible(pos) {
    let arr = INDEXS.PIEDI.DX.concat(INDEXS.PIEDI.SX).concat(INDEXS.OCCHI).concat(INDEXS.MANI.DX).concat(INDEXS.MANI.SX);
    for(let i = 0; i < arr.length; i ++)
        if (pos[arr[i]].visibility <= MIN_VISIBILITY) {
            if (i < 2)
                return 'non si vede bene il piede destro';
            else if (i < 4)
                return 'non si vede bene il piede sinistro';
            else if (i < 10)
                return 'non si vedono bene gli occhi';
            else if (i < 13)
                return 'non si vede bene la mano destra';
            else
                return 'non si vede bene la mano sinistra';
        }
    return 'yes';
}

function manoSopraLaTesta(pos) {
    let y_occhi = [], y_mano_sx = [], y_mano_dx = [];
    for(let i of INDEXS.OCCHI)
        y_occhi.push(pos[i].y)
    for(let i of INDEXS.MANI.SX)
        y_mano_sx.push(pos[i].y);

    if(getMax(y_mano_sx) < getMin(y_occhi) + 0.05)
        return 'sinistra';

    for(let i of INDEXS.MANI.DX)
        y_mano_dx.push(pos[i].y);

    if(getMax(y_mano_dx) < getMin(y_occhi) + 0.05)
        return 'destra';
    return null;
}

function getMax(arr) {
    let m = arr[0];
    for(let n of arr)
        if(n > m)
            m = n;
    return m;
}

function getMin(arr) {
    let m = arr[0];
    for(let n of arr)
        if(n < m)
            m = n;
    return m;
}