
/**
 * Node.js server side proxy class for injecting into the client
 */

export default class LaunchProxy {
    public launch(message: string) {
        console.log("*** LAUNCHING *** :: ", message);

        const spawn = require('child_process').spawn;
        spawn('notepad.exe');
    }
}

