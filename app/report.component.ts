import { Component, AfterViewInit, Input } from '@angular/core';
import { Report } from './report';
import { ReportService } from './report.service';
import { FixComponent } from './fix.component';
import { OnInit } from '@angular/core';
import { QueryResponse } from './queryresponse';


@Component({
  selector: 'reports',
  templateUrl: 'app/html/report.html',
  styleUrls: ['app/css/report.css', 'app/css/search-bar.css'],
  directives: [FixComponent]
})
export class ReportComponent {
  
  queryResponse: QueryResponse; 
  title = 'Find out how other fixed it';
  selectedReport: Report;
  reports: Report[] = [];
  advanced: boolean = false;
  start: number = 0;
  end: number = 100;
  languages: string[] = [];
  datasets: string[] = [];
  height:number = 0;
  searchQuery: string;
  landing:boolean = true;

  constructor(private reportService: ReportService) { 
    this.height = window.innerHeight*0.8;
  }

  getReports() {
    this.reportService.getReports("Null Pointer Exception", 
      this.advanced, this.start, this.end, this.languages, this.datasets)
      .then(
        response => {
          this.queryResponse = response;
          this.reports = this.queryResponse.reports;
          this.onSelect(this.queryResponse.reports[0]);
          this.landing = false;
        }
      );
  }

  onVote(report:Report, direction:string){
    this.reportService.vote(direction, report.id);

    (direction === 'up') ?
      this.selectedReport.live_saver++ :
      this.selectedReport.live_saver--;
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

  eventHandler(keycode: number) {
    if (keycode === 13 && this.searchQuery.length !== 0) {
      this.getReports();
    }
    console.log(keycode);
  }

  onSuggestionClick(suggestion: string) {
    this.searchQuery = suggestion;
    this.getReports();
  }

}