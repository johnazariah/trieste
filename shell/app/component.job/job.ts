import {Component} from '@angular/core';
import {JobService} from "../../app/services/job-service";
import {Job} from "../../app/models/job";
import {TaskService} from "../../app/services/task-service";
import {Task} from "../../app/models/task";
import {RxListProxy} from "../../app/services/core/rx-list-proxy";

@Component({
  selector: 'job',
  template: `
  <section class="content-header">
      <h1>Job</h1>
  </section>
  <div class="box-body table-responsive">
    <table class="table no-margin">
      <thead>
        <tr>
          <th>#</th>
          <th>Id</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody *ngFor="let item of data.items | async; let i = index">
        <tr>
          <td>{{i}}</td>
          <td>{{item.id}}</td>
          <td>{{item.state}}</td>
        </tr>
      </tbody>
    </table>
  </div>
`
})

export class JobComponent {
  public data : any;
  constructor(private service : JobService) {
    this.data = service.list();
    this.data.fetchNext();
  }
}