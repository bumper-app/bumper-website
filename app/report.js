"use strict";
var Report = (function () {
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
exports.Report = Report;
//# sourceMappingURL=report.js.map