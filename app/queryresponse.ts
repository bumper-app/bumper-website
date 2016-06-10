import { Report } from './report';

export class QueryResponse {

	ellapsedTime:number;
	documentFound:number;
	reports:Report[];

	constructor(ellapsedTime: number, documentFound: number, reports: Report[]){
		
		this.ellapsedTime = ellapsedTime;
		this.documentFound = documentFound;
		this.reports = reports;
	}

}