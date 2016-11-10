import { Component } from '@angular/core';

import batchClient from '../api/batch/batch-client'
import launchProxy from "../client-proxy/launch-client";

batchClient.setOptions({
    account: "azuregenomics",
    key: "IATpKFKP+AAF7/nDM9ZjXx7Hc9NqXLzj5mCqKV9/2QFXZd/Etz7SLhE6YcUclf32bDvvHQHR66UAk5QfO9VPNA==",
    url: "https://azuregenomics.southeastasia.batch.azure.com"
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