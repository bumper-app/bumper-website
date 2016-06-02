import { Component, Input } from '@angular/core';
import { Report } from './report';

@Component({
  selector: 'fix',
  template: `
  <div *ngIf="report">
    <h2>{{report.title}} details!</h2>
    <div><label>id: </label>{{report.internal_id}}</div>
    <div>
      <label>title: </label>
      <input [(ngModel)]="report.title" placeholder="title"/>
    </div>
  </div>`
})
export class FixComponent {
  @Input()
  report: Report;
}
