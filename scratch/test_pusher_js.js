try {
    const PusherClient = require('pusher-js');
    console.log('PusherClient:', typeof PusherClient);
    console.log('PusherClient.default:', typeof PusherClient.default);
    new PusherClient('key', { cluster: 'abc' });
    console.log('new PusherClient() worked');
} catch (e) {
    console.log('new PusherClient() failed:', e.message);
}
