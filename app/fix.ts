
export class Fix{

	constructor(raw:any){
		for (var attr in raw) {
			(this as any)[attr] = raw[attr];
		}
	}

	id:string;
	type:string;
	parent_bug: string;
}

export class Changeset extends Fix{
	parentSHA1: string;// "",
	user: string;//"Tomas Hurka <thurka@netbeans.org>",
	date_string: string;//"Sat Aug 21 12:22:59 2010 +0200",
	summary: string;//"bugfix #168116 and #168324, do not use local variables to increase number of recursive calls in generateMirrorNode() and addChild()",
	file_c: string[];
	number_files: number;
	insertions: number;
	deletions: number;
	churns: number;
}

export class Hunks extends Fix{
	parent_changeset: string;
	negative_churns: number;
	positive_churns: number;
	insertion: string;
	change: string[];
}