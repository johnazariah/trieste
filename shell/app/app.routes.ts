import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClusterComponent } from './component.cluster/cluster';
import { JobComponent } from './component.job/job';

export const routes: Routes = [ 
    {path: '', redirectTo: 'cluster', pathMatch: 'full' }, 
    {path: 'cluster', component: ClusterComponent },
    {path: 'job', component: JobComponent }
]

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);