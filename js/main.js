String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
};

var response;
var startRow = 0;
var endRow = 1000;
var advanced = false;
var baseSearch = "";
$body = $("body");
    
function toogleQueryingMode(){
    
    if(!advanced){
        $("#field").val('({!join from=parent_bug to=id}fix_t:"'+$("#field").val()+'") OR (type:"BUG" AND report_t:"'+$("#field").val()+'")');
        
        $("#advanced_mode").text("Basic querying");
        
    }else{
        $("#advanced_mode").text("Advanced querying");
        $("#field").val("");
    }
    
    advanced = !advanced;
    
}

if(window.location.hash) {
    //Puts hash in variable, and removes the # character
    var hash = window.location.hash.substring(1); 

    if(hash.startsWith("!/query/")){
        baseSearch = hash.replace("!/query/", "");
    }else if(hash.startsWith("!/advanced/")){
        toogleQueryingMode();
        baseSearch = hash.replace("!/advanced/", "");
    }
}
    
function paginate(){
    startRow = endRow;
    endRow = endRow + 1000;
    $("#submit").click();  
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

    if(description.length > 340){

        description = head + description.splice(340, 0, moreTag) + lessTag;
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

function languageIcon(languageExtension){
    switch(languageExtension) {
        case 'rb':
            return '<i title="ruby" class="devicon-ruby-plain"></i>';
        case 'js':
            return '<i title="javascript" class="devicon-javascript-plain"></i>';
        case 'py':
            return '<i title="pyton" class="devicon-python-plain"></i>';
        case 'cc':
            return '<i title="c++" class="devicon-cplusplus-plain"></i>';
        case 'java':
            return '<i title="java" class="devicon-java-plain"></i>';
        default:
            return '<i title="'+languageExtension+'" class="fa fa-code"></i>';
    }
}

function projectIcon(project){
    switch(project) {
        case 'netbeans':
            return '<i title="netbeans" class="persicon-netbeans"></i>';
        case 'apache':
            return '<i title="Apache Software Foundation" class="devicon-apache-plain"></i>';
        default :
            return '<i title="'+project+'" class="fa fa-code"></i>';
    }
}

function constructSaveMyDay(idBug, idRow, daySaved){
    return '<i onclick="savedDay(\''+idBug+'\', \''+idRow+'\');"'+ 
           'title="Already '+daySaved+' days saved"' +  
           'class="fa fa-life-ring"><span class="nb-live-save">'+daySaved+'</span></i>';
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
                projectIcon(bug.id.split('_')[1]) + 
                languageIcon(mostCommonTerm(extractExtensions(bug.file))) +
            '</div>' +
            '<div class="col-md-11">' + 
            '<h4 onclick="loadDetails(\''+bug.id+'\', \''+id+'\');">'+bug.title+'</h4>'+
            constructDescription(bug.description, id) + 
            constructStatistics(bug, id) +
            '</div></div>';

        $("#list_results").append(bug_result);
    });
}

function savedDay(id, rowId){
    console.log(id);
    console.log(rowId);
    $.ajax({
        url: 'https://bumper-app.com/life-saver/'+id,
        dataType: 'json',
        processData: false,
        type: 'GET',
        timeout : 5000,
        success: function(res){

            console.log($("#row-"+rowId+" > .icons > i.fa-life-ring > span.nb-live-save").text());

            $("#row-"+rowId+" > .icons > i.fa-life-ring").addClass("actif");
            $("#row-"+rowId+" > .icons > i.fa-life-ring > span.nb-live-save").text(
                parseInt($("#row-"+rowId+" > .icons > i.fa-life-ring > span.nb-live-save").text()) + 1);
            $("#row-"+rowId+" > .icons > i.fa-life-ring").attr('onclick', '').click('');
        }
    });
}

function ajaxRequest(){

    $.ajax({
        url: 'https://bumper-app.com/api/select?q=' + ((advanced) ? $("#field").val()+'&sort=live_saver+desc&start='+startRow+'&rows='+endRow+'&wt=json'
            : '({!join from=parent_bug to=id}fix_t:%27'+$("#field").val()+'%27) OR (type:"BUG" AND report_t:%27'+$("#field").val()+'%27)&sort=live_saver+desc&start='+startRow+'&rows='+endRow+'&wt=json'),
        dataType: 'jsonp',
        timeout : 5000,
        jsonp: 'json.wrf',
        beforeSend: function( xhr ) {
            $body.addClass("loading");
            $(".error").hide();
        },
        success: function(res){
            
            $body.removeClass("loading");

            fillBugsView(res.response.docs);

            ajaxComments(res.response.docs[0].id);
            ajaxFix(res.response.docs[0].id);

            $("#result-count").html(res.response.numFound);
            $("#time").html(res.responseHeader.QTime / 100);
        },
        error: function (xhr, errorType, exception) {
            $(".error").show();
            $body.removeClass("loading");
        },
    });
}


$(document).ready(function() {


    $( "#search_form" ).submit(function( event ) {

        $( "#fixes > .row" ).remove();
        $( "#comments > .row" ).remove();
        $( "#list_results > .row" ).remove();

        ajaxRequest();

        event.preventDefault();
    });

    $("#list_results, #details-bug").css("height", $( document ).height() - $("#header").height());

    $("#field").val(baseSearch);
    $("#search_form").submit();
});