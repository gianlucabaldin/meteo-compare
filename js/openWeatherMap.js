/*

PARAMS

BASE CURRENT     http://api.openweathermap.org/data/2.5/weather?&appid=7d65c99d534b30bf36d19145d91fbf37&q=London
BASE FORECAST    http://api.openweathermap.org/data/2.5/forecast?&appid=7d65c99d534b30bf36d19145d91fbf37&q=London

RETURN TYPE JSON    (no querystring, default)
RETURN TYPE XML     &mode=xml

RETURN TYPE UNIT
"fahrenheit"    &units=imperial;
"celsius"       &units=metric";
"kelvin"        (no querystring, default)

*/

function getOWMParameters(chosenMethod){
    switch(chosenMethod){
        case 'byCity': 
            searchParameters = "&q=" + $("#city").val();
            var country = $("#country").val();
            if(country != undefined && country != ""){
                country.replace(" ", "+");
                searchParameters += ","  + country;
            } 
            return searchParameters;
        case 'byZip': 
            searchParameters = "&zip=" + $("#zipCode").val();
            // in case method=byZip, OWM accepts only two-char country (es 'IT')
            var country = $("#country").val().replace(" ", "+").substr(0,2);
            if(country != undefined && country != ""){
                searchParameters += ","  + country;
            } 
            return searchParameters;
        case 'byGeo': 
            return "&lat=" +$("#latitude").val() + "&lon=" +$("#longitude").val();
        default:
            searchParameters = "&q=" + $("#city").val();
            var country = $("#country").val();
            if(country != undefined && country != ""){
                country.replace(" ", "+");
                searchParameters += ","  + country;
            } 
            return searchParameters;
    }
}

// param weather --> just the current weather
function currentWeatherOWM(chosenMethod){
    
    var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?' + getOWMParameters(chosenMethod) 
        + '&appid=7d65c99d534b30bf36d19145d91fbf37' + getUnitString();
   
    var tempUnit = getTempUnit();
    
    // api call to OWM
    $.ajax({
        url: weatherUrl
    }).done(function(data) {
        
        var city = data.name;
        var lat = data.coord.lat;
        var lon = data.coord.lon;
        var country = data.sys.country;
        var sunrise = getFullTime(data.sys.sunrise);
        var sunset = getFullTime(data.sys.sunset);
        var temp = data.main.temp;
        var weatherMain = data.weather[0].main;
        var weatherDescr = data.weather[0].description;
        var weatherIcon = data.weather[0].icon;
        var fullTimeDate = getFullDate(data.dt);
        
        // starting building the final html table - kept multiple lines to be readeable for developers
        var resultTableOWM =
            "<table class=\"table table-hover table-bordered\">" +
                "<caption>OperWeatherMaps.org</caption>" +
                "<thead>" +
                    "<tr>" +
                        "<th>Feature</th>" +
                        "<th>Value</th>" +
                    "</tr>" +
                "</thead>" +
                "<tbody>" +
                    "<tr>" +
                        "<td>Date</td>" +
                        "<td>" + fullTimeDate + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>Country</td>" +
                        "<td>" + country +"</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>City</td>" +
                        "<td>" + city +"</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>Coordinates</td>" +
                        "<td>Lat: " + lat + "°, Lon: " + lon + "°</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>Temp:</td>" +
                        "<td>" + temp + tempUnit + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>Weather:</td>" +
                        "<td><img id=\"weatherIcon\" src= \"http://openweathermap.org/img/w/"
                            + weatherIcon + ".png\" alt=\"" + weatherMain + "\"/>" + weatherDescr + "</td>" +
                    "</tr>" +
                "</tbody>" +
            "</table>";
        
        $("#resultTableOWM").html(resultTableOWM);
    })
    .fail(function( xhr, status, errorThrown ) {
        // parse the json response
        var JSONerror = JSON.parse(xhr.responseText)
        $("#resultTableOWM").html(
            "<div class=\"alert alert-danger\" role=\"alert\">" +
                "<strong>There's been a problem</strong> calling the OpenWeatheMap.org Api's " +
                "because of \"" + errorThrown + "\", code = " + JSONerror.cod + 
                "<br/><br/><strong>The error message:</strong><br/>" + JSONerror.message + 
            "</div>");   
    });
}


// param forecast --> next 5 days forecast weather
function forecastWeatherOWM(chosenMethod){
    
    var forecastUrl = 'http://api.openweathermap.org/data/2.5/forecast?' + getOWMParameters(chosenMethod) 
        + '&appid=7d65c99d534b30bf36d19145d91fbf37' + getUnitString();
    
    $.ajax({
        url: forecastUrl
        
    }).done(function(data) {
        
        var city = data.city.name;
        var lat = data.city.coord.lat;
        var lon = data.city.coord.lon;
        var country = data.country;

        var tempUnit = getTempUnit();
        
        // starting building the final html table - kept multiple lines to be readeable for developers
        var resultTableHtml = 
            "<table class=\"table table-hover table-bordered\">" +
                "<caption>OperWeatherMaps.org</caption>" +
                "<thead>" +
                    "<tr>" +
                        "<th>Date</th>" +
                        "<th>Hour</th>" +
                        "<th>Temp</th>" +
                        "<th>Weather</th>" +
                    "</tr>" +
                "</thead>" +
                "<tbody>";
        
        // for-cycle for every entry (our/day)
        $.each(data.list, function(index, singleData){
            var temp = singleData.main.temp;
            var weatherMain = singleData.weather[0].main;
            var weatherDescr = singleData.weather[0].description;
            var weatherIcon = singleData.weather[0].icon;
            var fullDate = getFullDate(singleData.dt);
            var fullTime = getFullTime(singleData.dt);
            
            // just three item per day            
            if(fullTime == '08:00' || fullTime == '14:00' || fullTime == '20:00' ) {
                resultTableHtml += "<tr><td>" + fullDate + "</td>" +
                    "<td>" + fullTime + "</td>" +
                    "<td>" + temp + tempUnit +"</td>" +
                    "<td>&nbsp;<img id=\"weatherIcon\" src= \"http://openweathermap.org/img/w/"
                        + weatherIcon + ".png\" alt=\"" + weatherMain + "\"/>" + weatherDescr + "</td>" +
                    "</tr>";
            }
        }); // end each-cycle
        
        // close the html table
        resultTableHtml += "</tbody></table>";
        
        // fill the <div> result element with the table just built
        $("#resultTableOWM").html(resultTableHtml);
    })
    
    .fail(function( xhr, status, errorThrown ) {
        // parse the json response
        var JSONerror = JSON.parse(xhr.responseText)
        $("#resultTableOWM").html(
            "<div class=\"alert alert-danger\" role=\"alert\">" +
                "<strong>There's been a problem</strong> calling the OpenWeatheMap.org Api's " +
                "because of \"" + errorThrown + "\", code = " + JSONerror.cod + 
                "<br/><br/><strong>The error message:</strong><br/>" + JSONerror.message + 
            "</div>");   
    });
}

function getUnitString(){
    switch (getUnit()){
        case "fahrenheit": return "&units=imperial";    // Farheneit
        case "celsius": return "&units=metric";         // Celsius
        case "kelvin": return "";                       // Kelvin
        default: return "&units=metric";                // default : Celsius
    }
}
