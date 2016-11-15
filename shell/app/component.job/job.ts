import { Component } from '@angular/core';
import { PoolService } from "../../app/services/pool-service";
import { Pool } from "../../app/models/pool";
import { JobService } from "../../app/services/job-service";
import { Job } from "../../app/models/job";
import { TaskService } from "../../app/services/task-service";
import { Task } from "../../app/models/task";
import { RxListProxy } from "../../app/services/core/rx-list-proxy";

import monitorProxy from "../client-proxy/monitor-client";
import launchProxy from "../client-proxy/launch-client";

declare var $:any;

@Component({
  selector: 'job',
  templateUrl: './app/component.job/template.html'
})

export class JobComponent {
  public clusters: any;
  public runs: any;

  public selectedCluster: any;
  public selectedRun: any;

  public newRunId: string;
  public newRUnCluster: any;

  public chartData: any;

  constructor(private poolService: PoolService, private taskService: TaskService) {
    this.clusters = poolService.list();
    this.clusters.fetchNext();

    //setInterval(this.doSomethingPeridoically, 3000);
  }

  public select_cluster(item) {
    this.selectedCluster = item.id;
    this.runs = this.taskService.list(this.selectedCluster);
    this.runs.fetchNext();
  }

  public select_run(item) {
    this.selectedRun = item.id;
    this.showChart(this.selectedCluster, this.selectedRun);
  }

  public submit_run() {
    let clusterId = $("#myDropdown").val();
    let runId = $("#runId").val();
    console.log(`Submit Run with cluster (${clusterId}), run (${runId})`);
    launchProxy.submit_run(clusterId, runId);
  }

  public onChange(val){
    alert("yes");
    console.log("here i am" + val);
  }

  public download_data() {
    monitorProxy.downloadModel(this.selectedCluster, this.selectedRun);
  }

  public showChart(clusterId, runId) {
    console.log(`I would show the graph for ${clusterId}/${runId} here`);

    monitorProxy.load(this.selectedCluster, this.selectedRun, this.drawChart);
  }

  private drawChart(myLogParseData) {
    var totEpochs = 300

    var finEp = 0;
    if (myLogParseData.finPts) {
      finEp = myLogParseData.finPts[myLogParseData.finPts.length - 1][0]
    }
    var miniEp = 0;
    if (myLogParseData.miniPts) {
      miniEp = myLogParseData.miniPts[myLogParseData.miniPts.length - 1][0]
    }
    var maxEp = Math.max(finEp, miniEp)
    if (maxEp > 0) {
      totEpochs = parseInt(maxEp.toString());
    }

    var jobProgressModule: any = {};

    jobProgressModule.plotVMargin = 0.04;
    jobProgressModule.numEpochs = 300;
    jobProgressModule.gFMinErr = 0;
    jobProgressModule.gFMaxErr = 100;
    jobProgressModule.isMinibatchMode = false;
    jobProgressModule.isMixedMode = false;
    jobProgressModule.gMMinErr = 0;
    jobProgressModule.gMMinErr = 100;

    jobProgressModule.forceUpdate = false;
    jobProgressModule.zoomInMode = false;

    let adjustYaxes = function (plot, dataLen, isUseFin, margin) {
      var min = 0;
      var max = 100;
      var delta = 0.0;

      if (isUseFin) {
        delta = jobProgressModule.gFMaxErr - jobProgressModule.gFMinErr;
      }
      else {
        delta = jobProgressModule.gMMaxErr - jobProgressModule.gMMinErr;
      }

      if (dataLen == 0) {
        plot.getOptions().yaxes[0].min = min;
        plot.getOptions().yaxes[0].max = max;
      }
      else if (dataLen < 2 || delta < 0.0005) {
        plot.getOptions().yaxes[0].min = min;
        var plotLines = plot.getData();
        plot.getOptions().yaxes[0].max = plotLines[0].data[0][1] * (1.2);
      }
      else {
        if (isUseFin) {
          min = jobProgressModule.gFMinErr;
          max = jobProgressModule.gFMaxErr;
        }
        else {
          min = jobProgressModule.gMMinErr;
          max = jobProgressModule.gMMaxErr;
        }
        plot.getOptions().yaxes[0].min = Math.max(min - margin, 0);
        plot.getOptions().yaxes[0].max = max + margin;
      }
    }

    let updateMinMaxFromJson = function (data: any) {
      var gMMinErr = data.gMMinErr;
      var gMMaxErr = data.gMMaxErr;

      if (jobProgressModule.isMixedMode) {
        if (data.gFMinErr < data.gMMinErr) {
          gMMinErr = data.gFMinErr;
        }
        if (data.gFMaxErr > data.gMMaxErr) {
          gMMaxErr = data.gFMaxErr;
        }
      }

      if (jobProgressModule.gFMinErr != data.gFMinErr ||
        jobProgressModule.gFMaxErr != data.gFMaxErr ||
        (jobProgressModule.isMinibatchMode && (jobProgressModule.gMMinErr != gMMinErr ||
          jobProgressModule.gMMaxErr != gMMaxErr))) {

        jobProgressModule.gFMinErr = data.gFMinErr;
        jobProgressModule.gFMaxErr = data.gFMaxErr;
        if (jobProgressModule.isMinibatchMode) {
          jobProgressModule.gMMinErr = gMMinErr;
          jobProgressModule.gMMaxErr = gMMaxErr;
        }
        return true;
      }
      else {
        return false;
      }
    }

    var finishedEpochPlotElem = $("#graph-flot-realtime");
    var plotFinishedEpoch = $.plot(finishedEpochPlotElem, [[]], {
      series: {
        lines: {
          show: true,
          lineWidth: 2,
          fill: true,
          fillColor: { colors: [{ opacity: 0.3 }, { opacity: 0.3 }] }
        },
        shadowSize: 0 // Drawing is faster without shadows
      },
      colors: "#ff0000",
      yaxis: {
        min: 0,
        max: 100,
        tickDecimals: 4,
        axisLabel: 'Train loss per epoch'
      },
      xaxis: {
        min: 0,
        max: jobProgressModule.numEpochs
      },
      selection: {
        mode: "x"
      }
    });

    var minibatchPlotElem = $("#graph-flot-realtime-minibatch");
    var plotMinibatch = $.plot(minibatchPlotElem, [[]], {
      series: {
        lines: {
          show: true,
          lineWidth: 2,
          fill: true,
          fillColor: { colors: [{ opacity: 0.3 }, { opacity: 0.3 }] }
        },
        shadowSize: 0	// Drawing is faster without shadows
      },
      colors: ["#ff0000"],
      yaxis: {
        min: 0,
        max: 100,
        tickDecimals: 4,
        axisLabel: 'Train loss per minibatch'
      },
      xaxis: {
        min: 0,
        max: jobProgressModule.numEpochs
      },
      selection: {
        mode: "x"
      }
    });

    var plotFinData = [];
    var numFinDataPts = 0;
    var plotMinibatchData = [];
    var numMinibathDataPts = 0;

    plotFinData.push({ data: myLogParseData.finPts, label: "data", color: "#ff0000" });
    if (myLogParseData.finPts) {
      numFinDataPts = numFinDataPts + myLogParseData.finPts.length;
    }

    if (myLogParseData.miniPts) {
      jobProgressModule.isMinibatchMode = true;
      plotMinibatchData.push({ data: myLogParseData.miniPts, label: "data", color: "#ff0000" });
      numMinibathDataPts = numMinibathDataPts + myLogParseData.miniPts.length;
    }
    else {
      plotMinibatchData.push({ data: myLogParseData.finPts, label: "data", color: "#ff0000" });
      if (myLogParseData.finPts) {
        numMinibathDataPts = numMinibathDataPts + myLogParseData.finPts.length;
      }
    }


    jobProgressModule.isMixedMode = numMinibathDataPts > 0 && numFinDataPts > 0;

    if (numMinibathDataPts > 1 && numFinDataPts < 2) {
      var aveErr = 0.0;
      for (let j = 0; j < plotMinibatchData[0].data.length; j++) {
        aveErr = aveErr + plotMinibatchData[0].data[j][1];
      }
      aveErr = aveErr / numMinibathDataPts;
      var miniLen = plotMinibatchData[0].data.length;
      let mydata = [[plotMinibatchData[0].data[0][0], aveErr], [plotMinibatchData[0].data[miniLen - 1][0], aveErr]];
      plotFinData[0].data = mydata;
      let data: any = {};
      data.gFMinErr = aveErr;
      data.gFMaxErr = aveErr;
      numFinDataPts = 2;
    }

    if (numFinDataPts > 0 && numMinibathDataPts > 0) {
      plotFinishedEpoch.setData(plotFinData);
      plotMinibatch.setData(plotMinibatchData);
    }


    var isMinMaxChange = updateMinMaxFromJson(myLogParseData);
    if (jobProgressModule.forceUpdate || isMinMaxChange || totEpochs != jobProgressModule.numEpochs) {
      jobProgressModule.forceUpdate = false;

      jobProgressModule.numEpochs = totEpochs;
      plotFinishedEpoch.getOptions().xaxes[0].min = 0;
      plotMinibatch.getOptions().xaxes[0].min = 0;
      plotFinishedEpoch.getOptions().xaxes[0].max = jobProgressModule.numEpochs;
      plotMinibatch.getOptions().xaxes[0].max = jobProgressModule.numEpochs;

      var delta = jobProgressModule.gFMaxErr - jobProgressModule.gFMinErr;
      var margin = delta * jobProgressModule.plotVMargin;

      adjustYaxes(plotFinishedEpoch, numFinDataPts, true, margin);

      if (jobProgressModule.isMinibatchMode) {
        delta = jobProgressModule.gMMaxErr - jobProgressModule.gMMinErr;
        margin = delta * jobProgressModule.plotVMargin;

        adjustYaxes(plotMinibatch, numMinibathDataPts, false, margin);
      }
      else {
        adjustYaxes(plotMinibatch, numMinibathDataPts, true, margin);
      }
      plotFinishedEpoch.setupGrid();
      plotMinibatch.setupGrid();
    }

    plotFinishedEpoch.draw();
    plotMinibatch.draw();
  }
}