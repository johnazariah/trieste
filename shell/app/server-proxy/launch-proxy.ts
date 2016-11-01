/**
 * Node.js server side proxy class for injecting into the client
 */

export default class LaunchProxy {
    public launch(message: string) {
        const exec = require('child_process').exec;

        exec('cd .. && python trieste.py cluster create', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
            console.log(stderr);
        });
    }
}