import { Component, OnInit } from '@angular/core';
import { ReportService } from './report.service';
import { ReportComponent } from './report.component';

@Component({
	moduleId: module.id,
	selector: 'my-app',
	 template: `
      <h1>{{title}}</h1>
      <reports></reports>
    `,
	directives: [ReportComponent],
	providers: [ReportService]
})
export class AppComponent implements OnInit {
	constructor() { }

	ngOnInit() { }

	title = 'Tour of reports';
}