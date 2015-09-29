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

// Add startsWith if it does nt exist
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

 if(window.location.hash) {
    var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character

    if(hash.startsWith("!/query/")){
        baseSearch = hash.replace("!/query/", "");
    }else if(hash.startsWith("!/advanced/")){
        toogleQueryingMode();
        baseSearch = hash.replace("!/advanced/", "");
    }
}
    
function paginate(start, end){
    startRow = start;
    endRow = end;
    $("#submit").click();
    
}
    
function report_select(index){
    
     $.ajax({
        url:"https://bumper-app.com/solr/select?q=*%3A*&fq=id%3A"+index+"&fq=type%3A\"BUG\"&sort=type+asc&wt=json",
        dataType: 'jsonp',
        jsonp: 'json.wrf',
        beforeSend: function( xhr ) {
            window.location.hash = '#!/query/'+index;
        },
        success: function(res){
            
                var report = res.response.docs[0];
                var bug_detail = "<div class='bug_details'>"
                +"<div class='header_details'>"
                +"<div class='project_image'><img src='img/netbeans.png'/></div>"
                +"<div class='bug_id'>" + report.id + " (" + report.project + ")</div>"
                +"<div class='bug_title'>" + report.title + "</div>"

                +"<h4>Details</h4><div class='section-details'>"
                +"<ul class='classification'>"

                +"<li class='item'><span class='wrap-li'>Report type:</span> " + report.type + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Status:</span>  " + report.bug_status + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Severity:</span>  " + report.bug_severity + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Days to fix:</span>  " + report.fixing_time + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Churns:</span>  " + report.churns + "</li><br />"
                + "</ul><ul class='classification'>"
                +"<li class='item'><span class='wrap-li'>Resolution:</span>  " + report.resolution + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Version:</span>  " + report.version + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Sub-Project:</span>  " + report.sub_project + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Comments:</span>  " + report.comments_nb + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Hunks:</span>  " + report.hunks + "</li><br />"
                + "</ul><ul class='classification'>"
                +"<li class='item'><span class='wrap-li'>Reporter:</span>  " + report.reporter_pseudo + " (" + report.reporter_name + ")" + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Assignee:</span>  " + report.assigned_to_pseudo + " (" + report.assigned_to_name + ")" + "</li><br />"
                +"<li class='item'><span class='wrap-li'>Files to fix:</span>  " + report.number_files + "</li><br />"


                +"</ul></div>"
                +"</div>"

                + "<h4>Description</h4><div class='section_description'>"
                +"<div class='description'>" + report.description + "</div></div>"

                + '<h4>Comments</h4><div class="section_comment">';
            
                if(report.comments_nb > 0){
                    $.each(report.comment, function( index, value ){

            
                        var parsedComment = value.split('*`|`*');
                        var comment = "<div class='bug_result_comment'>"
                        + "<p class='bug_result_commenter'> " + parsedComment[0] + " ("+ parsedComment[1] + ") @ " + parsedComment[2] +"<p>";


                        if(parsedComment.length >= 4){
                            comment = comment + "<p class='bug_result_comment'> " + parsedComment[3].replace("\\n", "<br />") + "<p>";
                        }

                        comment = comment + "</div>";

                        bug_detail = bug_detail + comment;
                    });
                }
                
                bug_detail = bug_detail + "</div>";

                bug_detail = bug_detail + "<h4>Fix</h4><div class='section_fix'>";
                bug_detail = bug_detail +"<div class='fix'>No Fix Known</div>";
                bug_detail = bug_detail +"</div></div>";
            
                $("#bug_details").html(bug_detail);
            
             $.ajax({
                 
                url:"https://bumper-app.com/solr/select?q=*%3A*&fq=parent_bug%3A"+index.replace("bug_Apache_", "bug_Apache") +"&fq=type%3A(CHANGESET+OR+HUNKS)&sort=type+asc&wt=json&indent=true",
                dataType: 'jsonp',
                jsonp: 'json.wrf',
                success: function(res){


                    var fix = "";

                    $.each(res.response.docs, function( index, value ) {

                        var fixItem = "";

                        if(value.type == "CHANGESET"){

                            fixItem = fixItem + "<div class='changeset'>";
                            fixItem = fixItem + "<div class='changeset_summary'><i>" + value.id + "</i> " + value.summary + "</div>";

                            fixItem = fixItem +"<ul class='changeset_file'>";

                            $.each(value.file_c, function (indexFile, ValueFile){

                                fixItem = fixItem + "<li>"+ValueFile+"</li>";

                            });


                            fixItem = fixItem + "</ul>";

                            fixItem = fixItem + "<div class='changeset_stats'> ("+value.number_files + ") files, ("+value.insertions+") insertions, ("+value.deletions+") deletions.</div>";

                            fix = fix + fixItem;

                        }else{

                            fixItem = fixItem + "<pre><code class='diff'>Index: " + value.id.split("@@")[2] + "\n";
                            fixItem = fixItem + "===================================================================\n";

                            fixItem = fixItem + value.insertion + "\n";

                            $.each(value.change, function (indexChange, valueChange){

                                fixItem = fixItem + valueChange + "\n";

                            });

                            fixItem = fixItem + "</code><pre>";
                            fix = fix + fixItem;

                            $('.fix').html(fix);

                            $(document).ready(function() {
                            $('pre code').each(function(i, block) {
                                hljs.highlightBlock(block);
                              });
                            });
                            
                            

                        }

                    });
        }
         
     });

   }});
    
    
}
    
$( "#search_form" ).submit(function( event ) {
    

    
  $("#list_results, #bug_details").empty();

  $("#download_button").hide();

  $.ajax({
    url: 'https://bumper-app.com/solr/select?q=' + ((advanced) ? $("#field").val()+'&start='+startRow+'&rows='+endRow+'&wt=json'
        : '({!join from=parent_bug to=id}fix_t:%27'+$("#field").val()+'%27) OR (type:"BUG" AND report_t:%27'+$("#field").val()+'%27)&start='+startRow+'&rows='+endRow+'&wt=json'),
    dataType: 'jsonp',
    timeout : 5000,
    jsonp: 'json.wrf',
    beforeSend: function( xhr ) {
        $body.addClass("loading");
        $(".error").hide();
    },
    success: function(res){
        
         $body.removeClass("loading");

        $("#search_statistics").html("~" + res.response.numFound + " <i class='fa fa-bug'></i> found in " +res.responseHeader.QTime+" ms <i class='fa fa-clock-o'></i>");
        
        $("#download_button a").each(function(index, value){
            
            $(this).attr("href", 'https://bumper-app.com/solr/select?q=' + ((advanced) ? encodeURIComponent($("#field").val()+"&start=0&rows=1000&wt=json") : '({!join from=parent_bug to=id}fix_t:"'+$("#field").val()+'") OR (type:"BUG" AND report_t:"'+$("#field").val()+'")&start='+startRow+'&rows='+endRow+'&wt=') + 
                        $(this).attr("id"));
        });
        
        
        $("#download_button").show();
        
        var pagination = "<ul>";
        
        for(i = 0; i < (res.response.numFound - res.response.numFound % 1000) / 1000; i++){
                
            pagination = pagination + "<li><a href='#' onclick='paginate("+(i*1000)+","+((i+1)*1000)+")'>"+ (i+1) + "</a></li>";
            
        }
        
        pagination = pagination + "</ul>";
        
        $("#pagination").html(pagination);
        
        var ulWidth = ((res.response.numFound - res.response.numFound % 1000) / 1000) * 20;
        
        if(ulWidth > 1100){
                ulWidth = 1100;
        }
        
        $("#pagination ul").css("width", ulWidth + "px");

        if(res.response.numFound!="0"){
            //$("#download_button").show();
        }

        var html = "";
        response = res.response;

        $.each(res.response.docs, function( index, value ) {
            
            
            var bug_thumbnail = "<div onclick='report_select(\""+value.id+"\")' class='bug_tumbnail'>"
            + "<div class='bug_project_left'>" + value.id + " (" + value.project + ")</div>"
            + "<div class='bug_title_left'>" + value.title.substring(0, 35); + "</div>"
            + "</div>";
            
            
            $("#list_results").append(bug_thumbnail);
            
            if(index == 0){
                    $('.bug_tumbnail').click();
            }

        });

    },
    error: function (xhr, errorType, exception) {
        $(".error").show();
        $body.removeClass("loading");
    },
  });

  event.preventDefault();
});


$(document).ready(function() {
    // if text input field value is not empty show the "X" button
    $("#field").keyup(function() {
        $("#x").fadeIn();
        if ($.trim($("#field").val()) == ""){
            $("#x").fadeOut();
        }
    });
    // on click of "X", delete input field value and hide "X"
    $("#x").click(function() {
        $("#field").val("");
        $(this).hide();
    });
    
    $("#field").val(baseSearch);
    $("#submit").click();
});