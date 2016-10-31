import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: '<button (click)="clicked()">Bite Me</button>'
})

export class AppComponent { 
  public clicked() {
    console.log("you clicked me");
  }
}