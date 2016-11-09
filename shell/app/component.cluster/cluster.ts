import {Component} from '@angular/core';
import {PoolService} from "../../app/services/pool-service";
import {Pool} from "../../app/models/pool";
import {RxListProxy} from "../../app/services/core/rx-list-proxy";

@Component({
  selector: 'cluster',
  template: `
  <section class="content-header">
      <h1>Cluster</h1>
  </section>
  <!-- Button trigger modal -->
  <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal">
    Create Cluster...
  </button>

  <!-- Modal -->
  <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="myModalLabel">Create Cluster</h4>
        </div>
        <div class="modal-body">
          <div class="box box-primary">
              <div class="box-header with-border">
                <h3 class="box-title">Credentials</h3>
                <div class="box-tools pull-right">
                  <button class="btn btn-box-tool" type="button" data-widget="collapse"><i class="fa fa-minus">-</i></button>
                </div>
              </div>
              <div class="box-body" style="display: block;">
                <div class="panel panel-default">
                  <div class="panel-heading">
                    <h3 class="panel-title">Batch Credentials</h3>
                  </div>
                  <div class="panel-body">
                    Panel content
                  </div>
                </div>
                <div class="panel panel-default">
                  <div class="panel-heading">
                    <h3 class="panel-title">Storage Credentials</h3>
                  </div>
                  <div class="panel-body">
                    Panel content
                  </div>
                </div>
              </div>
            </div>
            <div class="box box-primary">
              <div class="box-header with-border">
                <h3 class="box-title">Cluster Specification</h3>
              </div>
              <div class="box-body" style="display: block;">
                <div class="form-group">
                  <label class="col-sm-2 control-label" for="poolName">Pool Name</label>
                  <div class="col-sm-10">
                    <input class="form-control" id="poolName" type="text" placeholder="Pool Name">
                  </div>
                </div>
              </div>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
  <div class="box-body table-responsive">
    <table class="table no-margin">
      <thead>
        <tr>
          <th>#</th>
          <th>Id</th>
          <th>Pool State</th>
          <th>VM Size</th>
          <th>VM Count</th>
          <th>GPU Enabled?</th>
        </tr>
      </thead>
      <tbody *ngFor="let item of data.items | async; let i = index">
        <tr>
          <td>{{i}}</td>
          <td>{{item.id}}</td>
          <td>{{item.state}}</td>
          <td>{{item.vmSize}}</td>
          <td>{{item.currentDedicated}}</td>
          <td>{{item.vmSize}}</td>
        </tr>
      </tbody>
    </table>
  </div>
`
})

export class ClusterComponent {
  public data : any;

  public clicked() {
    alert("Saved this");
  }

  constructor(private service : PoolService) {
    this.data = service.list();
    this.data.fetchNext();
  }
}