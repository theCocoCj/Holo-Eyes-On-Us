const INDEXS = { // Define an object constant called INDEXS to store body part index values
    PIEDI: { // Body part: PIEDI (Feet)
        SX : [29, 31], // Index values for left foot
        DX : [30, 32] // Index values for right foot
    },
    OCCHI : [1, 2, 3, 4, 5, 6], // Index values for eyes
    MANI : { // Body part: MANI (Hands)
        SX : [17, 19, 21], // Index values for left hand
        DX : [18, 20, 22] // Index values for right hand
    }
};
const MIN_VISIBILITY = 0.65; // Minimum visibility threshold

function getObjectFromData(data) { // Function to extract object data from a string
    let arr = data.split('\n'); // Split the string into an array at every newline character
    return { // Return an object with properties extracted from the array
        x: parseFloat(arr[0].split('x: ')[1]), // Extract x value and convert to float
        y: parseFloat(arr[1].split('y: ')[1]), // Extract y value and convert to float
        z: parseFloat(arr[2].split('z: ')[1]), // Extract z value and convert to float
        visibility: parseFloat(arr[3].split('visibility: ')[1]) // Extract visibility value and convert to float
    }
}

function allVisible(pos) { // Function to check if all body parts are visible based on visibility threshold
    let arr = INDEXS.PIEDI.DX.concat(INDEXS.PIEDI.SX).concat(INDEXS.OCCHI).concat(INDEXS.MANI.DX).concat(INDEXS.MANI.SX); // Concatenate index arrays of all body parts
    for(let i = 0; i < arr.length; i ++) { // Loop through each index value
        if (pos[arr[i]].visibility <= MIN_VISIBILITY) { // Check if visibility of body part is less than or equal to minimum visibility threshold
            if (i < 2)
                return 'non si vede bene il piede destro'; // Return message for right foot not being visible
            else if (i < 4)
                return 'non si vede bene il piede sinistro'; // Return message for left foot not being visible
            else if (i < 10)
                return 'non si vedono bene gli occhi'; // Return message for eyes not being visible
            else if (i < 13)
                return 'non si vede bene la mano destra'; // Return message for right hand not being visible
            else
                return 'non si vede bene la mano sinistra'; // Return message for left hand not being visible
        }
    }
    return 'yes'; // Return 'yes' if all body parts are visible
}

function manoSopraLaTesta(pos) { // Function to check if hands are above the head
    let y_occhi = [], y_mano_sx = [], y_mano_dx = []; // Arrays to store y values of eyes, left hand, and right hand
    for(let i of INDEXS.OCCHI)
        y_occhi.push(pos[i].y); // Push y values of eyes to y_occhi array
    for(let i of INDEXS.MANI.SX)
        y_mano_sx.push(pos[i].y); // Push y values of left hand to y_mano_sx array

    if(getMax(y_mano_sx) < getMin(y_occhi) + 0.05) // Check if the maximum y value of left hand is less than the minimum y value of eyes plus 0.05
        return 'sinistra'; // Return 'sinistra' if left hand is above the head

    for(let i of INDEXS.MANI.DX)
        y_mano_dx.push(pos[i].y); // Push y values of right hand to y_mano_dx array

    if(getMax(y_mano_dx) < getMin(y_occhi) + 0.05) // Check if the maximum y value of right hand is less than the minimum y value of eyes plus 0.05
        return 'destra'; // Return 'destra' if right hand is above the head
    return null; // Return null if hands are not above the head
}

function getMax(arr) { // Function to get the maximum value from an array
    let m = arr[0]; // Initialize m with the first element of the array
    for(let n of arr)
        if(n > m) // Compare each element with m and update m if a larger value is found
            m = n;
    return m; // Return the maximum value
}

function getMin(arr) { // Function to get the minimum value from an array
    let m = arr[0]; // Initialize m with the first element of the array
    for(let n of arr)
        if(n < m) // Compare each element with m and update m if a smaller value is found
            m = n;
    return m; // Return the minimum value
}