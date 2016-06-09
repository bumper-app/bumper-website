import { Component, OnInit } from '@angular/core';
import { ReportService } from './report.service';
import { ReportComponent } from './report.component';
import { FooterComponent } from './footer.component';

@Component({
	moduleId: module.id,
	selector: 'my-app',
	 template: `
	  <div class="container">
      <reports (searchComplete) = "handleSearchEvent($event)"></reports>
      </div>
      <footer-bumper></footer-bumper>
    `,
	directives: [ReportComponent, FooterComponent],
	providers: [ReportService]
})
export class AppComponent implements OnInit {
	constructor() { }

	ngOnInit() { }

	title = 'Tour of reports';
}