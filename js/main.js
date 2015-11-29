String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

String.prototype.startsWith = function (str) {
    return this.indexOf(str) === 0;
};

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

var response;
var startRow = 0;
var endRow = 100;
var advanced = false;
var baseSearch = "";
var languages = [];
var datasets = [];
$body = $("body");

function suggestionClick(suggestion){
  console.log(suggestion);

  $("input[type='search']").val(suggestion);
  $(".searchbox").submit();
}

function toogleQueryingMode(){

    if(!advanced){
        $("#field").val('({!join from=parent_bug to=id}fix_t:"'+$("#field").val()+'") OR (type:"BUG" AND report_t:"'+$("#field").val()+'")');
        $("#query-mode").text("Basic query mode");

    }else{
        $("#query-mode").text("Advanced query mode");
        $("#field").val("");
    }

    advanced = !advanced;

}

if(window.location.hash) {
    //Puts hash in variable, and removes the # character
    var hash = window.location.hash.substring(1);

    if(hash.startsWith("!/query/")){
        baseSearch = hash.replace("!/query/", "");
        $("#field").val(baseSearch);
        $( ".searchbox" ).submit();
    }
}

function languageClick(language){

    if($.inArray(language, languages) > -1){

        languages.remove(language);
        $("[data='"+language+"']").removeClass('actif');
    }else{
        languages.push(language);
        $("[data='"+language+"']").addClass('actif');

    }

    $(".language-notification").text(languages.length);

    $( "#fixes > .row" ).remove();
    $( "#comments > .row" ).remove();
    $( "#list_results > .row" ).remove();

    ajaxRequest();
}

function datasetClick(dataset){
    if($.inArray(dataset, datasets) > -1){

        datasets.remove(dataset);
        $("[data='"+dataset+"']").removeClass('actif');
    }else{
        datasets.push(dataset);
        $("[data='"+dataset+"']").addClass('actif');
    }

    $(".dataset-notification").text(datasets.length);

    $( "#fixes > .row" ).remove();
    $( "#comments > .row" ).remove();
    $( "#list_results > .row" ).remove();

    ajaxRequest();
}

function paginate(){
    startRow = endRow;
    endRow = endRow + 100;
    $( ".pagination-row" ).remove();
    ajaxRequest();
}

function constructComments(bug){
    bugComments = '<div class="row"><div class="col-md-11">';
    if(bug.comment !== undefined && bug.comment !== null && bug.comment.length > 0){
        $.each(bug.comment, function( index, value ){

            var parsedComment = value.split('*`|`*');
            var comment = "<div class='bug_result_comment'>" +
            "<p class='bug_result_commenter'> " + parsedComment[0] + " ("+ parsedComment[1] + ") @ " + parsedComment[2] +"<p>";


            if(parsedComment.length >= 4){
                comment = comment + "<p class='bug_result_comment'> " + parsedComment[3].replace("\\n", "<br />") + "<p>";
            }

            comment = comment + "</div>";

            bugComments += comment;
        });
    }

    bugComments+= "</div></div>";

    $('#comments').append(bugComments);
}

function constructChangeset(changeset){
    var changesetHtml = '<div class="row"><div class="col-md-11">';

    changesetHtml = changesetHtml + "<div class='changeset'>";
    changesetHtml = changesetHtml + "<div class='changeset_summary'><i>" + changeset.id +
        "</i> " + changeset.summary + "</div>";

    changesetHtml = changesetHtml +"<ul class='changeset_file'>";

    $.each(changeset.file_c, function (indexFile, valueFile){

        changesetHtml = changesetHtml + "<li>"+valueFile+"</li>";
    });

    changesetHtml = changesetHtml + "</ul>";

    changesetHtml = changesetHtml + "<div class='changeset_stats'> ("+changeset.number_files +
     ") files, ("+changeset.insertions+") insertions, ("+changeset.deletions+") deletions.</div></div></div>";

    return changesetHtml;
}

function constructHunk(hunk){

    var hunkHtml = '<div class="row"><div class="col-md-11">';

    hunkHtml = hunkHtml + "<pre><code class='diff'>Index: " + hunk.id.split("@@")[2] + "\n";
    hunkHtml = hunkHtml + "===================================================================\n";

    hunkHtml = hunkHtml + hunk.insertion + "\n";

    $.each(hunk.change, function (indexChange, valueChange){

        hunkHtml = hunkHtml + valueChange + "\n";

    });

    hunkHtml = hunkHtml + "</code></pre></div></div>";

    return hunkHtml;
}

function constructFix(fixes){

    var fix = "";

    $.each(fixes, function( index, value ) {

        fix += (value.type == "CHANGESET") ?
            constructChangeset(value)
            : constructHunk(value);
    });

    $('#fixes').append(fix);
}

function ajaxFix(bug_id){
    $.ajax({

        url:"https://bumper-app.com/api/select?q=*%3A*&fq=parent_bug%3A"+bug_id.replace("bug_Apache_", "bug_Apache") +"&fq=type%3A(CHANGESET+OR+HUNKS)&sort=type+asc&wt=json&indent=true",
        dataType: 'jsonp',
        jsonp: 'json.wrf',
        success: function(res){
            constructFix(res.response.docs);

            $(document).ready(function() {
                $('pre code').each(function(i, block) {
                    hljs.highlightBlock(block);
                });
            });
        }
    });
}

function ajaxComments(bug_id){
    $.ajax({
        url:"https://bumper-app.com/api/select?q=*%3A*&fq=id%3A"+bug_id+"&fl=comment&fq=type%3A\"BUG\"&sort=type+asc&wt=json",
        dataType: 'jsonp',
        jsonp: 'json.wrf',
        success: function(res){
            constructComments(res.response.docs[0]);
        }
    });
}

function mostCommonTerm(array)
{
    if(array.length === 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] === null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function countOccurences(array){
    if(array.length === 0){
        return null;
    }

    var modeMap = {};

    for (var i = array.length - 1; i >= 0; i--) {
        if(modeMap[el] === null){

            modeMap[el] = 1;
        }
        else{
            modeMap[el]++;
        }
    }

    return modeMap;
}

function extractExtensions(array){

    var extensionsArray = [];

    if(array){
        for (var i = array.length - 1; i >= 0; i--) {
            extensionsArray[i] = array[i].split('.').pop();
        }
    }

    return extensionsArray;
}

function constructStatistics(bug, id){

    return '<ul class="statistiques" id="statistiques-'+id+'">' +
                '<li>Reporter : ' + bug.reporter_name + '</li>' +
                '<li>Assigned : ' + bug.assigned_to_name + '</li>' +
                '<li>Report Date : ' +  bug.date + '</li>' +
                '<li>Fixing Time : '+bug.fixing_time+'</li>'+
                '<li>Severity : '+bug.bug_severity+'</li>'+
                '<li>Sub-project : '+bug.sub_project+'</li>' +
                '<li>Files : '+bug.number_files+'</li>'+
                '<li>Churns : '+bug.churns+'</li>' +
                '<li>Hunks : '+bug.hunks+'</li>' +
            '</ul>';
}

function constructDescription(description, id){

    var head = '<p id="description-'+id+'" class="description">';
    var moreTag = '<a id="more-'+id+'" onclick="toggleShortLongDescription(\''+id+'\');">' +
            ' more...</a> <span class="long-description" id="long-description-'+id+'">';
    var lessTag = '<a onclick="toggleShortLongDescription(\''+id+'\');"> less...</a></span></p>';

    if(description.length > 180){

        description = head + description.splice(180, 0, moreTag) + lessTag;
    }else{
        description = head + description + moreTag + lessTag;
    }

    return description;

}

function toggleShortLongDescription(id){
    toggleId("more-"+id);
    toggleId("less-"+id);
    toggleId("long-description-"+id);
    toggleId("statistiques-"+id);
    location.href = "#row-"+id;
}

function toggleId(id){
    $("#"+id).toggle();
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function toggleLoading(){
    if($body.hasClass("loading")){
        $body.removeClass("loading");
    }else{
        $body.addClass("loading");
    }
}

function loadDetails(bug_id, rowId){
    $( "#fixes > .row" ).remove();
    $( "#comments > .row" ).remove();
    $( ".row-bug").removeClass("actif");
    ajaxComments(bug_id);
    ajaxFix(bug_id);
    $( "#row-"+rowId).addClass("actif");
}

function constructSaveMyDay(idBug, idRow, daySaved){

  return '<i onclick="upvote(\''+idBug+'\', \''+idRow+'\');" class="fa fa-sort-asc"></i>' +
  '<div class="count-ups">'+daySaved+'</div>' +
  '<i onclick="downvote(\''+idBug+'\', \''+idRow+'\');" class="fa fa-sort-desc"></i>';
}

function constructSourceUrl(project, id){
  switch(project) {
       case 'netbeans':
           return 'https://netbeans.org/bugzilla/show_bug.cgi?id='+id;
       case 'Apache':
           return 'https://netbeans.org/bugzilla/show_bug.cgi?id='+id;
       default :
           return 'https://netbeans.org/bugzilla/show_bug.cgi?id='+id;
   }

}

function constructSubHeader(bug){

  sourceUrl = constructSourceUrl(bug.id.split('_')[1], bug.id.split('_')[2]);

  return '<p>' +
    '<a class="source-link" href="'+sourceUrl+'">'+sourceUrl+'</a>' +
    '<span class="keywords">'+mostCommonTerm(extractExtensions(bug.file))+
    ', '+bug.id.split('_')[1]+', '+bug.project+'</span>'+
  '</p>';

}

function fillBugsView(bugs){

    $.each(bugs, function( index, bug ) {

        var id = guid();

        if(bug.live_saver === undefined){
            bug.live_saver = 0;
        }

        var bug_result = '<div id="row-'+id+'" class="row row-bug">'+
            '<div class="col-md-1 icons">'+
                constructSaveMyDay(bug.id, id, bug.live_saver) +
            '</div>' +
            '<div class="col-md-11">' +
            '<h4 class="dark-blue" onclick="loadDetails(\''+bug.id+'\', \''+id+'\');">'+bug.title+'</h4>'+
            constructSubHeader(bug) +
            constructDescription(bug.description, id) +
            constructStatistics(bug, id) +
            '</div></div>';

        $("#list_results").append(bug_result);
    });
}

function upvote(id, rowId){
  if(!$("#row-"+rowId+" > .icons > i.fa-sort-asc").hasClass("actif")){
    $("#row-"+rowId+" > .icons > i.fa-sort-asc").addClass("actif");
    $("#row-"+rowId+" > .icons > i.fa-sort-desc").removeClass("actif");
    $("#row-"+rowId+" > .icons > div.count-ups").text(
        parseInt($("#row-"+rowId+" > .icons > div.count-ups").text()) + 1);

    vote(id, "up");
  }
}

function downvote(id, rowId){
  if(!$("#row-"+rowId+" > .icons > i.fa-sort-desc").hasClass("actif")){
    $("#row-"+rowId+" > .icons > i.fa-sort-asc").removeClass("actif");
    $("#row-"+rowId+" > .icons > i.fa-sort-desc").addClass("actif");
    $("#row-"+rowId+" > .icons > div.count-ups").text(
        parseInt($("#row-"+rowId+" > .icons > div.count-ups").text()) - 1);

    vote(id, "down");
  }
}

function vote(id, up){

    var url = 'https://bumper-app.com/life-saver/'+id;

    if(up === "down"){
        url = 'https://bumper-app.com/life-unsaver/'+id;
    }

    $.ajax({
        url: url,
        dataType: 'json',
        processData: false,
        type: 'GET',
        timeout : 5000
    });
}

function pagination(nb){
  var pagination = "<div class='pagination-row row'><a onclick='paginate();'>More ...</a></div>";
  $("#list_results").append(pagination);
}

function setDirectDownload(){
  $("#download_button a").each(function(index, value) {
		$(this).attr("href",
    'https://bumper-app.com/api/select?q=' + (
      (advanced) ? query+'&sort=live_saver+desc&wt='+$(this).attr("id")
        : '({!join from=parent_bug to=id}fix_t:%27'+
            query+
            '%27) OR (type:"BUG" AND report_t:%27'+
            query+
            languageFilter +
            datasetFilter +
            '%27)&sort=live_saver+desc'+
            '&wt='+$(this).attr("id")
          )
			);
	});
}

function ajaxRequest(){

    languageFilter = '';
    datasetFilter = '';

    $("#list_results, #details-bug").css("height",
      $( document ).height()
      - $(".searchbox").height() - 30
      - $("nav").height() - 30
      - $("footer").height() - 30
    );

    query = $("#field").val();

    if(languages.length != $("li.language-filter").length){

        languageFilter = "AND (";
        for (var i = 0; i < languages.length - 2; i++) {
            languageFilter = languageFilter + 'file:*.' + languages[i] + ' OR ';
        }

        languageFilter = languageFilter + 'file:*.' + languages[languages.length - 1] + ")";
    }

    if(datasets.length != $("li.dataset-filter").length){

        datasetFilter = "+AND+(";
        for (var i = 0; i < datasets.length - 2; i++) {
            datasetFilter = datasetFilter + 'dataset%3A' + datasets[i] + '+OR+';
        }

        datasetFilter = datasetFilter + 'dataset%3A' + datasets[datasets.length - 1] + ")";
    }

    $.ajax({
        url: 'https://bumper-app.com/api/select?q=' + ((advanced) ? query+'&sort=live_saver+desc&start='+startRow+'&rows='+endRow+'&wt=json'
            : '({!join from=parent_bug to=id}fix_t:%27'+
                query+
                '%27) OR (type:"BUG" AND report_t:%27'+
                query+
                languageFilter +
                datasetFilter +
                '%27)&sort=live_saver+desc&start='+
                startRow+
                '&rows='+
                endRow+
                '&wt=json'),
        dataType: 'jsonp',
        timeout : 5000,
        jsonp: 'json.wrf',
        success: function(res){

            $body.removeClass("loading");

            fillBugsView(res.response.docs);
            pagination(res.response.numFound);

            ajaxComments(res.response.docs[0].id);
            ajaxFix(res.response.docs[0].id);
            $( ".row-bug:first").addClass("actif");

            setDirectDownload();

            $("#result-count").html(res.response.numFound);
            $("#time").html(res.responseHeader.QTime / 100);
        },
        error: function (xhr, errorType, exception) {
            alert("Something went wrong");
        },
    });
}


$(document).ready(function() {

    $( ".searchbox" ).submit(function( event ) {

        $(".landing").addClass("result");
        $(".row-bumper").css("opacity", 1);

        $( "#fixes > .row" ).remove();
        $( "#comments > .row" ).remove();
        $( "#list_results > .row" ).remove();

        ajaxRequest();
        event.preventDefault();

    });

    $.each($('.language-filter'), function( index, filter ) {

        $(filter).attr('onclick', 'languageClick("' + $(filter).attr('data') +'")');

        languages.push($(filter).attr('data'));
        $("[data='"+$(filter).attr('data')+"']").addClass('actif');

    });

    $(".language-notification").text(languages.length);

    $.each($('.dataset-filter'), function( index, filter ) {

        $(filter).attr('onclick', 'datasetClick("' + $(filter).attr('data') +'")');

        datasets.push($(filter).attr('data'));
        $("[data='"+$(filter).attr('data')+"']").addClass('actif');

    });

    $(".dataset-notification").text(datasets.length);

    $("#field").val(baseSearch);
});
