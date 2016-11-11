/**
 * Node.js server side proxy class for injecting into the client
 */

export default class LaunchProxy {
    public launch(cluster_id: string, vm_size: string) {
        const exec = require('child_process').exec;

        let cmd = `cd .. && python trieste.py cluster create $cluster_id\\$run_id\\stderr.txt`
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
