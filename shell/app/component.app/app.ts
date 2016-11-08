import { Component } from '@angular/core';

import batchClient from '../api/batch/batch-client'
import launchProxy from "../client-proxy/launch-client";

batchClient.setOptions({
    account: "<>",
    key: "<>",
    url: "<>"
});

@Component({
  selector: 'app-main',
  templateUrl: './app/component.app/template.html',
})
export class AppComponent {
  public clicked() {
    console.log("you clicked me");
    launchProxy.launch("launch notepad please");
  }
}