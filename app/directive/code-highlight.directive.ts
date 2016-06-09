import { Directive, ElementRef, Input } from '@angular/core';

declare var hljs: any;

@Directive({ selector: '[codeHighlight]' })
export class CodeHighlightDirective {

	nativeElement:any;

    constructor(el: ElementRef) {
		this.nativeElement = el.nativeElement;
    }

    ngAfterViewInit(){
		hljs.highlightBlock(this.nativeElement);
    }
}