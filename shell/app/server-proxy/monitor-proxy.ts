export default class MonitorProxy {
    public load(cluster_id, run_id, do_something_with_json) {
        const exec = require('child_process').exec;

        var result : any;
        
        let downloadLogCommand = `cd .. && python trieste.py run get-data --cluster-id ${cluster_id} --run-id ${run_id}`;
        
        let runDirectory = `${cluster_id}\\${run_id}`
        let inputFile  = `${runDirectory}\\stderr.txt`;
        let outputFile = `${runDirectory}\\progress.json`;
        let parseLogToJsonCommand = `cd .. && python cntklogparser.py ${inputFile} > ${outputFile}`
        
        exec(downloadLogCommand, (_err, _stdout, _stderr) => {
            if (_err) {console.log(_err); return; }

            exec(parseLogToJsonCommand, (__err, __stdout, __stderr) => {
                if (__err) {console.log(__err); return; }

                result = JSON.parse(require('fs').readFileSync(`..\\${cluster_id}\\${run_id}\\progress.json`, 'utf8'));
                do_something_with_json(result);
            })
        });
    }
}