const Pusher = require('pusher');
console.log('Pusher:', typeof Pusher);
console.log('Pusher.default:', typeof Pusher.default);
try {
    new Pusher({ appId: '1', key: '2', secret: '3', cluster: '4' });
    console.log('new Pusher() worked');
} catch (e) {
    console.log('new Pusher() failed:', e.message);
}
try {
    new Pusher.default({ appId: '1', key: '2', secret: '3', cluster: '4' });
    console.log('new Pusher.default() worked');
} catch (e) {
    console.log('new Pusher.default() failed:', e.message);
}
