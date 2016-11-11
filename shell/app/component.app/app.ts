import { Component } from '@angular/core';

import batchClient from '../api/batch/batch-client'
import launchProxy from "../client-proxy/launch-client";

batchClient.setOptions({
    account: "johnaz",
    key: "o1nVKqJGU7m5SepCpmpLfGclxGkEDDMiCw0kr3pmw4l+HSYwiWA04wxusB/bmIEs5T228O9nwmHP/ThFvetNAg==",
    url: "https://johnaz.southcentralus.batch.azure.com"
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