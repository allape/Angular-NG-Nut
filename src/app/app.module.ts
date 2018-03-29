import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // 自定义模块
    HomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
