import { Component, Input } from '@angular/core';
import { Report } from './report';
import { CodeHighlightDirective } from './directive/code-highlight.directive';


@Component({
  selector: 'fix',
  // template: `
  // <div *ngIf="report">
  //   <h2>{{report.title}} details!</h2>
  //   <div><label>id: </label>{{report.internal_id}}</div>
  //   <div>
  //     <label>title: </label>
  //     <input [(ngModel)]="report.title" placeholder="title"/>
  //     {{report.changeset.id}}
  //   </div>
  // </div>`
  templateUrl: 'app/html/fix.html',
  directives: [CodeHighlightDirective]
})
export class FixComponent {
  @Input()
  report: Report;

  constructor(){
    // hljs.highlightBlock('pre');
  }
}
