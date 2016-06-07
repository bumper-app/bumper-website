import { Component } from '@angular/core';
import { Report } from './report';
import { ReportService } from './report.service';
import { FixComponent } from './fix.component';
import { OnInit } from '@angular/core';


@Component({
  selector: 'reports',
  templateUrl: 'app/html/report.html',
  directives: [FixComponent]
})
export class ReportComponent implements OnInit {
  constructor(private reportService: ReportService) { }
  title = 'Find out how other fixed it';
  reports: Report[];
  selectedReport: Report;
  advanced: boolean = false;
  start: number = 0;
  end: number = 100;
  languages: string[] = [];
  datasets: string[] = [];


  ngOnInit() {
    this.getReports();
  }

  getReports() {
    this.reportService.getReports("Null Pointer Exception", this.advanced, this.start, this.end, this.languages, this.datasets)
      .then(
      reports => {
        this.reports = reports;
        this.onSelect(this.reports[0]);
      }
      );
  }

  onVote(report:Report, direction:string){
    this.reportService.vote(direction, report.id);
  }

  onSelect(report: Report) {

    if (report.fixes === undefined || report.fixes.length === 0
      || report.changeset === undefined) {

      this.reportService.getFixes(report)
        .then(report => {
          this.selectedReport = report;
        });
    } else {
      this.selectedReport = report;
    }
  }
}