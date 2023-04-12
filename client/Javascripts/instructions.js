let ws = new WebSocket('ws://localhost:3000');

window.addEventListener('beforeunload', () => ws.send(REQ.CLOSE_CAMERA));