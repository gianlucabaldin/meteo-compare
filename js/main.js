/* Baldin Gianluca 24/7/2017 */

// submit form by mouse-click on "Search" button
$("#search").click(function(){
   performRequest();
});

// submit form by "Enter key" press (same as click on search button)
$(document).keypress(function(e) {
    if(e.which == 13) {
        performRequest();
    }
});

// tooltip for "country" input
$("#country").tooltip({
    title: "Not mandatory but highly reccomanded.<br/><br/>It prevents name misunderstandigs with same "
        + " city names in different countries",
    html: true,
    placement: "right",
    trigger: "hover focus"
});

// tooltip for "country" input
$("#authorInfo").popover({
    title: "The Author",
    html: true,
    content: "My name is Gianluca Baldin, I'm a Web/Java developer from Verona (Italy).<br/><br/>"
        + "One of my hobbies is to code and learn on my spare time, so after a few courses I decided to merge"
        + " what I've learnt and applyed both from work and from the online courses I took. <br/><br/>"
        + "The technologies used in this web-application are: <ol><li>Bootstrap v4</li><li>CSS3</li>"
        + "<li>jQuery v3.2.1</li><li>Ajax asyncronous calls to external site's APIs</li><li>JSON objects "
        + "manipulation</li></ol>Feel free to share the code, but please give me a credit :)",
    placement: "bottom",
//    container: "body",
    trigger: "click"
});

// when change the method, view/hide the correct inputs and reset them
$('input[name=method]').change(function(e){
    if($('input[name=method]:checked').val() == 'byCity'){
        $("#zipCodeContainer").hide();
        $("#latitudeContainer").hide();
        $("#longitudeContainer").hide();
        // the jQuery.show() function changes the element's visibility into "display: block",
        // misaligning the results outputting them in a single row per each instead of the same row
        $("#cityContainer").css("display", "flex");
        $("#contryContainer").css("display", "flex");        
    } else if($('input[name=method]:checked').val() == 'byZip'){
        $("#cityContainer").hide();
        $("#latitudeContainer").hide();
        $("#longitudeContainer").hide();
        // the jQuery.show() function changes the element's visibility into "display: block",
        // misaligning the results outputting them in a single row per each instead of the same row
        $("#zipCodeContainer").css("display", "flex");
        $("#contryContainer").css("display", "flex");
    } else if($('input[name=method]:checked').val() == 'byGeo'){
        $("#cityContainer").hide();
        $("#contryContainer").hide();
        $("#zipCodeContainer").hide();
        // the jQuery.show() function changes the element's visibility into "display: block",
        // misaligning the results outputting them in a single row per each instead of the same row
        $("#latitudeContainer").css("display", "flex");
        $("#longitudeContainer").css("display", "flex");
    }
    resetInputs();
});

// core function
function performRequest(){
    var method = chosenMethod();
    
    // if inputs not completerd, show the error and prevent submit
    if(!checkValidInputs(method)) return;

    // current/forecast based on the input selected
    if($('input[name=currentOrForecast]:checked').val() == 'current'){
        currentWeatherOWM(method);      
        currentWeatherApixu(method);
        currentWeatherWB(method);
    } else {
        forecastWeatherOWM(method);
        forecastWeatherApixu(method);
        forecastWeatherWB(method);
    }
    // the jQuery.show() function changes the element's visibility into "display: block",
    // misaligning the results outputting them in a single row per each instead of the same row
    $("#results").css("display", "flex");
}


/********************/
/* GLOBAL FUNCTIONS */
/********************/

function chosenMethod(){
    switch($('input[name=method]:checked').val()){
        case 'byCity': return 'byCity';
        case 'byZip': return 'byZip';
        case 'byGeo': return 'byGeo';
        default: return 'byCity';
    }
}

function getUnit(){
    return $('input[name=unit]:checked').val();
}

function getTempUnit(){
    switch(getUnit()){
        case "kelvin": return "°K";
        case "celsius": return "°C";
        case "fahrenheit": return "°F";
        default: return "°C";            // default Celsius
    }
}

function checkValidInputs(method){
    switch(method) {
        case 'byCity':
            if($("#city").val() == '' || $("#city").val() == 'undefined'){
                $("#errorMessage").html("<div class=\"alert alert-danger\" role=\"alert\">" 
                    + "<strong>No city inserted.</strong></div>");
                $("#errorMessage").show();
                $("#results").hide();
                return false;
            }
            break;
        case 'byGeo':
            var errorMessages = '';
            if($("#latitude").val() == '' ){
                errorMessages = "<div class=\"alert alert-danger\" role=\"alert\">" 
                    + "<strong>No latitude inserted.</strong></div>";
                
            }
            if($("#longitude").val() == ''){
                    errorMessages += "<div class=\"alert alert-danger\" role=\"alert\">" 
                        + "<strong>No longitude inserted.</strong></div>";
            }
            if(errorMessages != ''){
                $("#errorMessage").html(errorMessages);
                $("#errorMessage").show();
                $("#results").hide();
                return false;
            }
            break;
        case 'byZip':
            if($("#zipCode").val() == ''){
                $("#errorMessage").html("<div class=\"alert alert-danger\" role=\"alert\">" 
                    + "<strong>No zip code inserted.</strong></div>");
                $("#errorMessage").show();
                $("#results").hide();
                return false;
            }
            break;
    } // end- switch
    // if controls passed, hide the message in case it was shown before
    $("#errorMessage").hide();
    return true;
}

function resetInputs(){
    $("#errorMessage").hide();
    $("#results").hide();
    $("#city").val('');
    $("#country").val('');
    $("#zipCode").val('');
    $("#latitude").val('');
    $("#longitude").val('');
}

// convert from unix timestamp format in dd/mm/yyyy format
function getFullDate(unix_timestamp){
    var date = new Date(unix_timestamp * 1000); // conversion rounded at seconds
    var time = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
    return time;
}
// return time from unix timestamp format in hh:mm format
function getFullTime(unix_timestamp){
    var date = new Date(unix_timestamp * 1000); // conversion rounded at seconds
    var hours = date.getHours() < 10 ? "0"+date.getHours(): date.getHours();
    var minutes = date.getMinutes() < 10 ? "0"+ date.getMinutes(): date.getMinutes();
    return hours + ":" + minutes;
}