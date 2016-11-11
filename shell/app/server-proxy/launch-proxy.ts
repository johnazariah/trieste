/**
 * Node.js server side proxy class for injecting into the client
 */

export default class LaunchProxy {
    public create_cluster(cluster_id: string, vm_size: string, vm_count: number) {
        const exec = require('child_process').exec;

        let cmd = `cd .. && python trieste.py cluster create --cluster-id ${cluster_id} --vm-size ${vm_size} --vm-count ${vm_count}`
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
            console.log(stderr);
        });
    }

    public submit_run(cluster_id, run_id) {
        let cmd = `cd .. && python trieste.py run submit --cluster-id ${cluster_id} --run-id ${run_id}`;
        const exec = require('child_process').exec;

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
            console.log(stderr);
        });
    }
}
