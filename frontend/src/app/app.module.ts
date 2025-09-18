import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // <-- Import
import { FormsModule } from '@angular/forms'; // <-- Import

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule, // <-- Add to imports
    FormsModule       // <-- Add to imports
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }