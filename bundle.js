var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
System.register("fix", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Fix, Changeset, Hunks;
    return {
        setters:[],
        execute: function() {
            Fix = (function () {
                function Fix(raw) {
                    for (var attr in raw) {
                        this[attr] = raw[attr];
                    }
                }
                return Fix;
            }());
            exports_1("Fix", Fix);
            Changeset = (function (_super) {
                __extends(Changeset, _super);
                function Changeset() {
                    _super.apply(this, arguments);
                }
                return Changeset;
            }(Fix));
            exports_1("Changeset", Changeset);
            Hunks = (function (_super) {
                __extends(Hunks, _super);
                function Hunks() {
                    _super.apply(this, arguments);
                }
                return Hunks;
            }(Fix));
            exports_1("Hunks", Hunks);
        }
    }
});
System.register("report", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var Report;
    return {
        setters:[],
        execute: function() {
            Report = (function () {
                function Report(raw) {
                    this.file = [];
                    this.showLongDescription = false;
                    this.live_saver = 0;
                    for (var attr in raw) {
                        this[attr] = raw[attr];
                    }
                }
                Report.prototype.url = function () {
                    var splittedId = this.id.split('_')[2];
                    switch (this.id.split('_')[1]) {
                        case 'netbeans':
                            return 'https://netbeans.org/bugzilla/show_bug.cgi?id=' + splittedId;
                        case 'Apache':
                            return 'https://issues.apache.org/jira/browse/' + splittedId;
                        default:
                            return 'https://netbeans.org/bugzilla/show_bug.cgi?id=' + splittedId;
                    }
                };
                Report.prototype.keywords = function () {
                    var extension = [];
                    for (var i = 0; i < this.file.length; i++) {
                        extension[i] = this.file[i].split('.').pop();
                    }
                    return [this.mostCommonTerm(extension), this.project];
                };
                Report.prototype.mostCommonTerm = function (array) {
                    if (array.length === 0)
                        return null;
                    var modeMap = {};
                    var maxEl = array[0], maxCount = 1;
                    for (var i = 0; i < array.length; i++) {
                        var el = array[i];
                        if (modeMap[el] === null)
                            modeMap[el] = 1;
                        else
                            modeMap[el]++;
                        if (modeMap[el] > maxCount) {
                            maxEl = el;
                            maxCount = modeMap[el];
                        }
                    }
                    return maxEl;
                };
                return Report;
            }());
            exports_2("Report", Report);
        }
    }
});
System.register("queryresponse", [], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var QueryResponse;
    return {
        setters:[],
        execute: function() {
            QueryResponse = (function () {
                function QueryResponse(ellapsedTime, documentFound, reports) {
                    this.reports = [];
                    this.ellapsedTime = ellapsedTime;
                    this.documentFound = documentFound;
                    this.reports = reports;
                }
                return QueryResponse;
            }());
            exports_3("QueryResponse", QueryResponse);
        }
    }
});
System.register("report.service", ['@angular/core', '@angular/http', 'rxjs/add/operator/toPromise', "report", "fix", "queryresponse"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var core_1, http_1, report_1, fix_1, queryresponse_1;
    var ReportService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (_1) {},
            function (report_1_1) {
                report_1 = report_1_1;
            },
            function (fix_1_1) {
                fix_1 = fix_1_1;
            },
            function (queryresponse_1_1) {
                queryresponse_1 = queryresponse_1_1;
            }],
        execute: function() {
            /**
             * Simple API consumer for the reports
             */
            ReportService = (function () {
                function ReportService(http) {
                    this.http = http;
                    this.reportUrl = 'https://bumper-app.com/api/select?q=({!join from=parent_bug to=id}fix_t:1query1) OR (type:"BUG" AND report_t:2query2)&sort=live_saver+desc&start=0&rows=100&wt=json';
                    this.advancedReportUrl = 'https://bumper-app.com/api/select?q=1query1';
                    this.fixUrl = 'https://bumper-app.com/api/select?q=*%3A*&fq=parent_bug:BUGID&fq=type%3A(CHANGESET+OR+HUNKS)&sort=type+asc&wt=json';
                }
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
                ReportService.prototype.getReports = function (query, advanced, start, end, languages, datasets) {
                    //Construct the final query string
                    var finalQuery = ((advanced) ? this.advancedReportUrl : this.reportUrl)
                        .replace('1query1', "'" + query + "'")
                        .replace('2query2', "'" + query + "'" +
                        this.complexFilter(languages, 'file:*.') +
                        this.complexFilter(datasets, 'dataset%3A'))
                        .concat('&sort', 'live_saver', '&start', start.toString(), '&rows', end.toString(), '&wt=json');
                    finalQuery = 'app/mock.json';
                    // Construct the promise
                    return this.http.get(finalQuery).toPromise().then(function (response) {
                        return new queryresponse_1.QueryResponse(response.json().response.QTime, response.json().response.numFound, response.json().response.docs.map(function (report) {
                            return new report_1.Report(report);
                        }));
                    }).catch(this.handleError);
                };
                ReportService.prototype.getFixes = function (report) {
                    console.debug("fetching fixes for id:", report.id);
                    return this.http.get(
                    // this.fixUrl
                    // .replace('BUGID', report.id)
                    // .replace("bug_Apache_", "bug_Apache")
                    'app/response.mock.json').toPromise().then(function (response) {
                        report.changeset = new fix_1.Changeset(response.json().response.docs[0]);
                        report.fixes = response.json().response.docs
                            .slice(1, parseInt(response.json().response.numFound))
                            .map(function (hunk) {
                            return new fix_1.Hunks(hunk);
                        });
                        return report;
                    }).catch(this.handleError);
                };
                ReportService.prototype.vote = function (direction, id) {
                    var url = 'https://bumper-app.com/life-saver/' + id;
                    if (direction === "down") {
                        url = 'https://bumper-app.com/life-unsaver/' + id;
                    }
                    this.http.get(url);
                };
                /**
                 * Build a Lucene AND(arg:X OR arg:Y OR arg:Z ...) filter
                 * @param  {string[]} options  [description]
                 * @param  {string}   attribut [description]
                 * @return {string}            [description]
                 */
                ReportService.prototype.complexFilter = function (options, attribut) {
                    var filter = '';
                    if (options.length > 0) {
                        filter = "+AND+(";
                        for (var i = 0; i < options.length - 2; i++) {
                            filter = filter + attribut + options[i] + '+OR+';
                        }
                        filter = filter + attribut + options[options.length - 1] + ")";
                    }
                    return filter;
                };
                /**
                 * Simple error logging
                 * @param {any} error [description]
                 */
                ReportService.prototype.handleError = function (error) {
                    console.error('An error occurred', error);
                    return Promise.reject(error.message || error);
                };
                ReportService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http])
                ], ReportService);
                return ReportService;
            }());
            exports_4("ReportService", ReportService);
        }
    }
});
System.register("directive/code-highlight.directive", ['@angular/core'], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var core_2;
    var CodeHighlightDirective;
    return {
        setters:[
            function (core_2_1) {
                core_2 = core_2_1;
            }],
        execute: function() {
            CodeHighlightDirective = (function () {
                function CodeHighlightDirective(el) {
                    this.nativeElement = el.nativeElement;
                }
                CodeHighlightDirective.prototype.ngAfterViewInit = function () {
                    hljs.highlightBlock(this.nativeElement);
                };
                CodeHighlightDirective = __decorate([
                    core_2.Directive({ selector: '[codeHighlight]' }), 
                    __metadata('design:paramtypes', [core_2.ElementRef])
                ], CodeHighlightDirective);
                return CodeHighlightDirective;
            }());
            exports_5("CodeHighlightDirective", CodeHighlightDirective);
        }
    }
});
System.register("fix.component", ['@angular/core', "report", "directive/code-highlight.directive"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var core_3, report_2, code_highlight_directive_1;
    var FixComponent;
    return {
        setters:[
            function (core_3_1) {
                core_3 = core_3_1;
            },
            function (report_2_1) {
                report_2 = report_2_1;
            },
            function (code_highlight_directive_1_1) {
                code_highlight_directive_1 = code_highlight_directive_1_1;
            }],
        execute: function() {
            FixComponent = (function () {
                function FixComponent() {
                    // hljs.highlightBlock('pre');
                }
                __decorate([
                    core_3.Input(), 
                    __metadata('design:type', report_2.Report)
                ], FixComponent.prototype, "report", void 0);
                FixComponent = __decorate([
                    core_3.Component({
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
                        directives: [code_highlight_directive_1.CodeHighlightDirective]
                    }), 
                    __metadata('design:paramtypes', [])
                ], FixComponent);
                return FixComponent;
            }());
            exports_6("FixComponent", FixComponent);
        }
    }
});
System.register("report.component", ['@angular/core', "report.service", "fix.component"], function(exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var core_4, report_service_1, fix_component_1;
    var ReportComponent;
    return {
        setters:[
            function (core_4_1) {
                core_4 = core_4_1;
            },
            function (report_service_1_1) {
                report_service_1 = report_service_1_1;
            },
            function (fix_component_1_1) {
                fix_component_1 = fix_component_1_1;
            }],
        execute: function() {
            ReportComponent = (function () {
                function ReportComponent(reportService) {
                    this.reportService = reportService;
                    this.title = 'Find out how other fixed it';
                    this.reports = [];
                    this.advanced = false;
                    this.start = 0;
                    this.end = 100;
                    this.languages = [];
                    this.datasets = [];
                    this.height = 0;
                    this.landing = true;
                    this.height = window.innerHeight * 0.8;
                }
                ReportComponent.prototype.getReports = function () {
                    var _this = this;
                    this.reportService.getReports("Null Pointer Exception", this.advanced, this.start, this.end, this.languages, this.datasets)
                        .then(function (response) {
                        _this.queryResponse = response;
                        _this.reports = _this.queryResponse.reports;
                        _this.onSelect(_this.queryResponse.reports[0]);
                        _this.landing = false;
                    });
                };
                ReportComponent.prototype.onVote = function (report, direction) {
                    this.reportService.vote(direction, report.id);
                    (direction === 'up') ?
                        this.selectedReport.live_saver++ :
                        this.selectedReport.live_saver--;
                };
                ReportComponent.prototype.onSelect = function (report) {
                    var _this = this;
                    if (report.fixes === undefined || report.fixes.length === 0
                        || report.changeset === undefined) {
                        this.reportService.getFixes(report)
                            .then(function (report) {
                            _this.selectedReport = report;
                        });
                    }
                    else {
                        this.selectedReport = report;
                    }
                };
                ReportComponent.prototype.eventHandler = function (keycode) {
                    if (keycode === 13 && this.searchQuery.length !== 0) {
                        this.getReports();
                    }
                    console.log(keycode);
                };
                ReportComponent.prototype.onSuggestionClick = function (suggestion) {
                    this.searchQuery = suggestion;
                    this.getReports();
                };
                ReportComponent = __decorate([
                    core_4.Component({
                        selector: 'reports',
                        templateUrl: 'app/html/report.html',
                        styleUrls: ['app/css/report.css', 'app/css/search-bar.css'],
                        directives: [fix_component_1.FixComponent]
                    }), 
                    __metadata('design:paramtypes', [report_service_1.ReportService])
                ], ReportComponent);
                return ReportComponent;
            }());
            exports_7("ReportComponent", ReportComponent);
        }
    }
});
System.register("footer.component", ['@angular/core'], function(exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var core_5;
    var FooterComponent;
    return {
        setters:[
            function (core_5_1) {
                core_5 = core_5_1;
            }],
        execute: function() {
            FooterComponent = (function () {
                function FooterComponent() {
                }
                FooterComponent.prototype.ngOnInit = function () { };
                FooterComponent = __decorate([
                    core_5.Component({
                        moduleId: module.id,
                        selector: 'footer-bumper',
                        templateUrl: 'html/footer.html',
                        styleUrls: ['css/footer-bumper.css']
                    }), 
                    __metadata('design:paramtypes', [])
                ], FooterComponent);
                return FooterComponent;
            }());
            exports_8("FooterComponent", FooterComponent);
        }
    }
});
System.register("app.component", ['@angular/core', "report.service", "report.component", "footer.component"], function(exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var core_6, report_service_2, report_component_1, footer_component_1;
    var AppComponent;
    return {
        setters:[
            function (core_6_1) {
                core_6 = core_6_1;
            },
            function (report_service_2_1) {
                report_service_2 = report_service_2_1;
            },
            function (report_component_1_1) {
                report_component_1 = report_component_1_1;
            },
            function (footer_component_1_1) {
                footer_component_1 = footer_component_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                    this.title = 'Tour of reports';
                }
                AppComponent.prototype.ngOnInit = function () { };
                AppComponent = __decorate([
                    core_6.Component({
                        moduleId: module.id,
                        selector: 'my-app',
                        template: "\n\t  <div class=\"container\">\n      <reports (searchComplete) = \"handleSearchEvent($event)\"></reports>\n      </div>\n      <footer-bumper></footer-bumper>\n    ",
                        directives: [report_component_1.ReportComponent, footer_component_1.FooterComponent],
                        providers: [report_service_2.ReportService]
                    }), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            }());
            exports_9("AppComponent", AppComponent);
        }
    }
});
System.register("main", ['@angular/platform-browser-dynamic', '@angular/http', "app.component"], function(exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var platform_browser_dynamic_1, http_2, app_component_1;
    return {
        setters:[
            function (platform_browser_dynamic_1_1) {
                platform_browser_dynamic_1 = platform_browser_dynamic_1_1;
            },
            function (http_2_1) {
                http_2 = http_2_1;
            },
            function (app_component_1_1) {
                app_component_1 = app_component_1_1;
            }],
        execute: function() {
            platform_browser_dynamic_1.bootstrap(app_component_1.AppComponent, [http_2.HTTP_PROVIDERS]);
        }
    }
});
//# sourceMappingURL=bundle.js.map