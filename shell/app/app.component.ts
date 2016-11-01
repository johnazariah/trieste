import { Component } from '@angular/core';

import launchProxy from "./client-proxy/launch-client";

@Component({
  selector: 'my-app',
  template: '<button (click)="clicked()">Bite Me</button>'
})

export class AppComponent { 
  public clicked() {
    console.log("you clicked me");
    launchProxy.launch("launch notepad plz");
  }
}