import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Report } from './report';
import { Fix, Changeset, Hunks } from './fix';
import { QueryResponse } from './queryresponse';
/**
 * Simple API consumer for the reports
 */
@Injectable()
export class ReportService {

	private reportUrl = 'https://bumper-app.com/api/select?q=({!join from=parent_bug to=id}fix_t:1query1) OR (type:"BUG" AND report_t:2query2)&sort=live_saver+desc&start=0&rows=100&wt=json';
	private advancedReportUrl = 'https://bumper-app.com/api/select?q=1query1';
	private fixUrl = 'https://bumper-app.com/api/select?q=*%3A*&fq=parent_bug:BUGID&fq=type%3A(CHANGESET+OR+HUNKS)&sort=type+asc&wt=json';

	constructor(private http: Http) { }

	/**
	 * Query the JSON API for reports
	 * @param  {string}            query     
	 * @param  {boolean}           advanced  
	 * @param  {number}            start     
	 * @param  {number}            end       
	 * @param  {string[]}          languages 
	 * @param  {string[]}          datasets  
	 * @return {Promise<Report[]>}           
	 */
	getReports(query: string, advanced: boolean,
		start: number, end: number, languages: string[], datasets: string[])
		: Promise<QueryResponse> {

		//Construct the final query string
		let finalQuery = ((advanced) ? this.advancedReportUrl : this.reportUrl)
			.replace('1query1', "'" + query + "'")
			.replace('2query2', "'" + query + "'" +
			this.complexFilter(languages, 'file:*.') +
			this.complexFilter(datasets, 'dataset%3A'))
			.concat(
			'&sort', 'live_saver',
			'&start', start.toString(),
			'&rows', end.toString(),
			'&wt=json'
			);

		finalQuery = 'app/mock.json';

		// Construct the promise
		return this.http.get(finalQuery).toPromise().then(
			response => 
				new QueryResponse(
					response.json().response.QTime,
					response.json().response.numFound,
					response.json().response.docs.map(
						function(report) {
							return new Report(report);
						}
					)
				)
		).catch(this.handleError);
	}

	getFixes(report:Report):Promise<Report> {

		console.debug("fetching fixes for id:", report.id);
		return this.http.get(
				// this.fixUrl
				// .replace('BUGID', report.id)
				// .replace("bug_Apache_", "bug_Apache")
				'app/response.mock.json'
			).toPromise().then(
				response => {
					report.changeset = new Changeset(response.json().response.docs[0]);
					report.fixes = response.json().response.docs
						.slice(1, parseInt(response.json().response.numFound))
						.map(function(hunk){
							return new Hunks(hunk);
						});
					return report;
				}
			).catch(this.handleError);
	}

	vote(direction:string, id:string){

		let url = 'https://bumper-app.com/life-saver/' + id;

		if (direction === "down") {
			url = 'https://bumper-app.com/life-unsaver/' + id;
		}

		this.http.get(url);
	}

	/**
	 * Build a Lucene AND(arg:X OR arg:Y OR arg:Z ...) filter
	 * @param  {string[]} options  [description]
	 * @param  {string}   attribut [description]
	 * @return {string}            [description]
	 */
	private complexFilter(options: string[], attribut:string):string{
		
		let filter = '';
		if(options.length > 0){

			filter = "+AND+(";
			for (var i = 0; i < options.length - 2; i++) {
				filter = filter + attribut + options[i] + '+OR+';
			}

			filter = filter + attribut + options[options.length - 1] + ")";
		}

		return filter;
	}

	/**
	 * Simple error logging
	 * @param {any} error [description]
	 */
	private handleError(error: any) {
		console.error('An error occurred', error);
		return Promise.reject(error.message || error);
	}
}