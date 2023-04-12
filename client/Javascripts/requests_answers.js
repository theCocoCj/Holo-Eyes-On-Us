// Request from the server to the client
const REQ = {
    CALIBR_FATTA: '100', // If the calibration is already done
    ACCENDI_CAM: '101',
    SEND_POSITION: '102',
    STOP_SEND_POSITION: '103',
    SAVE_CALIBR: '104',
    GET_DATI_CALIBR: '105',
    FOLLOW_POSITION: '106',
    CHECK_LOGIN: '107',
    CLOSE_CAMERA: '108'
};

// Answers of the client to the server
const ANS = {
    CALIBR_FATTA: {
        FALSE: '200',
        TRUE: '201'
    },
    ACCENDI_CAM: '202',
    SEND_POSITION: '203',
    SAVE_CALIBR: '204',
    GET_DATI_CALIBR: '205',
    CHECK_LOGIN: {
        FALSE: '206',
        TRUE: '207'
    }
};