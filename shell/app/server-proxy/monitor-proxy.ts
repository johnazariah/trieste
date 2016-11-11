export default class MonitorProxy {
    public load(cluster_id, run_id) {        
        const exec = require('child_process').exec;

        let cmd = `cd .. && python cntklogparser.py $cluster_id\\$run_id\\stderr.txt`
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
    }
}