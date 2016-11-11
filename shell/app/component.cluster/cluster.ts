import {Component} from '@angular/core';
import {PoolService} from "../../app/services/pool-service";
import {Pool} from "../../app/models/pool";
import {RxListProxy} from "../../app/services/core/rx-list-proxy";

@Component({
  selector: 'cluster',
  templateUrl: './app/component.cluster/template.html'
})

export class ClusterComponent {
  public data : any;

  public clicked() {
    alert("Saved this");
  }

  constructor(private poolService: PoolService) {
    this.data = poolService.list();
    this.data.fetchNext();
  }
}