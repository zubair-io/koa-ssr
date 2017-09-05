
import { NgModule, Component } from '@angular/core';
import { ServerModule } from "@angular/platform-server";
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from "@angular/common";
import { AppComponent } from './app.component';



@NgModule({
  bootstrap: [AppComponent],
  declarations: [ ],
  imports: [
    ServerModule,
    BrowserModule.withServerTransition({
        appId: 'koa'
    }),
  ],
  providers:[
       { provide: APP_BASE_HREF, useValue: '/'}
  ]
})
export class AppNodeModule { }
