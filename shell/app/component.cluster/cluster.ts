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
  <p class="toolbar">
      <a class="create btn btn-default" href="javascript:" (click)=clicked()>Create Item</a>
      <span class="alert"></span>
  </p>
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
    alert("baaah");
  }

  constructor(private service : PoolService) {
    this.data = service.list();
    this.data.fetchNext();
  }
}