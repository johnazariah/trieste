import { NgModule }      from '@angular/core';
import { MaterialModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AppComponent }   from './component.app/app';
import { ClusterComponent } from './component.cluster/cluster';
import { JobComponent } from './component.job/job';

import { JobService } from './services/job-service';
import { PoolService } from './services/pool-service';
import { TaskService } from "./services/task-service";

@NgModule({
  entryComponents: [/*dialog component*/],
  imports:      [ BrowserModule, MaterialModule.forRoot(), RouterModule.forRoot(routes, {useHash: true})],
  declarations: [ AppComponent, ClusterComponent, JobComponent, /*dialog component*/],
  bootstrap:    [ AppComponent ],
  providers:    [ JobService, PoolService, TaskService ]
})

export class AppModule { }