/*

PARAMS

CURRENT JSON     http://api.apixu.com/v1/current.json?key=2e8771adcf8f432bbed201707172407&q=London
FORECAST JSON    http://api.apixu.com/v1/forecast.json?key==7d65c99d534b30bf36d19145d91fbf37&q=London

CURRENT XML     http://api.apixu.com/v1/current.xml?key=2e8771adcf8f432bbed201707172407&q=London
FORECAST XML    http://api.apixu.com/v1/forecast.xml?key==7d65c99d534b30bf36d19145d91fbf37&q=London

*/


function getApixuParameters(chosenMethod){
    switch(chosenMethod){
        case 'byCity': 
            searchParameters = $("#city").val();
            var country = $("#country").val();
            if(country != undefined && country != ""){
                country.replace(" ", "+");
                searchParameters += ","  + country;
            } 
            return searchParameters;
            
        case 'byZip': 
            searchParameters = $("#zipCode").val();
            var country = $("#country").val().replace(" ", "+");
            if(country != undefined && country != ""){
                searchParameters += ","  + country;
            }
            return searchParameters;
            
        case 'byGeo': 
            return $("#latitude").val() + "," +$("#longitude").val();
            
        default:
            searchParameters = $("#city").val();
            var country = $("#country").val();
            if(country != undefined && country != ""){
                country.replace(" ", "+");
                searchParameters += ","  + country;
            } 
            return searchParameters;
    }
}

// just the current weather
function currentWeatherApixu(chosenMethod){
    
    var weatherUrl = "http://api.apixu.com/v1/current.json?key=2e8771adcf8f432bbed201707172407&q=" 
        + getApixuParameters(chosenMethod);
    
    // api call to Apixu
    $.ajax({
        url: weatherUrl
    }).done(function(data) {
        var city = data.location.name;
        var lat = data.location.lat;
        var lon = data.location.lon;
        var country = data.location.country;
        var tempC = data.current.temp_c;
        var tempF = data.current.temp_f;
        var weatherDescr = data.current.condition.text;
        var weatherIcon = data.current.condition.icon;
        var fullTimeDate = getFullDate(data.location.localtime_epoch);
        var tempUnit = getTempUnit();
        
        // starting building the final html table - kept multiple lines to be readeable for developers
        resultTableApixu =
            "<table class=\"table table-hover table-bordered\">" +
                "<caption>Apixu.com</caption>" +
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
                        "<td>" + country + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>City</td>" +
                        "<td>" + city + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>Coordinates</td>" +
                        "<td>Lat: " + lat + "°, Lon: " + lon + "°</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>Temp:</td>";

        switch(getUnit()){
            case "kelvin": resultTableApixu += 
                    "<td>" + tempC + "°C <span style=\"font-size: 10px;\">(no °K available)</span></td></tr>";
                break;
            case "celsius": resultTableApixu +=
                    "<td>" + tempC + "°C</td></tr>";
                break;
            case "fahrenheit": resultTableApixu +=
                    "<td>" + tempF + "°F</td></tr>";
                break;
        }

        resultTableApixu +=
                "<tr>" +
                    "<td>Weather:</td>" +
                    "<td><img id=\"weatherIcon\" src= \"" + weatherIcon + "\"/>" + weatherDescr + "</td>" +
                "</tr>" +
            "</tbody>" +
        "</table>";
        $("#resultTableApixu").html(resultTableApixu);
    })
    
    .fail(function( xhr, status, errorThrown ) {
        // parse the json response
        var JSONerror = JSON.parse(xhr.responseText)
        $("#resultTableApixu").html(
            "<div class=\"alert alert-danger\" role=\"alert\">" +
                "<strong>There's been a problem</strong> calling the Apixu.com Api's " +
                "because of \"" + errorThrown + "\", code = " + JSONerror.error.code + 
                "<br/><br/><strong>The error message:</strong><br/>" + JSONerror.error.message + 
            "</div>");   
    });
}


// param forecast --> next 5 days forecast weather
function forecastWeatherApixu(chosenMethod){
    
    var forecastUrl = "http://api.apixu.com/v1/forecast.json?key=2e8771adcf8f432bbed201707172407&q=" 
        + getApixuParameters(chosenMethod) + "&days=5";
    
    $.ajax({
        url: forecastUrl
    }).done(function(data) {
        
        // hide (eventually) showed before during the call, after it will be re-show undated
        $(".results").hide();
        var city = data.location.name;
        var lat = data.location.lat;
        var lon = data.location.lon;
        var country = data.location.country;
        // starting building the final html table - kept multiple lines to be readeable for developers
        var resultTableApixu = 
            "<table class=\"table table-hover table-bordered\">" +
                "<caption>Apixu.com</caption>" +
                "<thead>" +
                    "<tr>" +
                        "<th>Date</th>" +
                        "<th>Hour</th>" +
                        "<th>Temp</th>" +
                        "<th>Weather</th>" +
                    "</tr>" +
                "</thead>" +
                "<tbody>";
        
        var now = new Date().getTime()/1000;
        // for-cycle for every entry (day)
        $.each(data.forecast.forecastday, function(dayIndex, dayEntry){

            // for-cycle for every entry (our/day)
            $.each(dayEntry.hour, function(hourIndex, hourEntry){
                
                var fullDate = getFullDate(hourEntry.time_epoch);   
                var hour = getFullTime(hourEntry.time_epoch);    
                var tempC = hourEntry.temp_c;
                var tempF = hourEntry.temp_f;
                var weatherText = hourEntry.condition.text;
                var weatherIcon = hourEntry.condition.icon;
                
                // consider just 3 timings per day (8am, 2pm, 8pm)
                // Apixu return the current day event in the forecast call, even before the time request
                // so it has to be checked (and not evaluated)
                if((hour == '08:00' || hour == '14:00' || hour == '20:00') && (hourEntry.time_epoch > now)) {
                    resultTableApixu += 
                        "<tr>"
                            + "<td>" + fullDate + "</td>"
                            + "<td>" + hour + "</td>";
                        switch(getUnit()){
                            case "kelvin": resultTableApixu += 
                                "<td>" + tempC + "°C <br/><span style=\"font-size: 10px;\">(no °K available)</span></td>";
                                break;
                            case "celsius": resultTableApixu +=
                                "<td>" + tempC + "°C</td>";
                                break;
                            case "fahrenheit": resultTableApixu +=
                                "<td>" + tempF + "°F</td>";
                                break;
                        }
                
                    resultTableApixu +=
                        "<td><img id=\"weatherIcon\" src= \"" + weatherIcon + "\"/>" + weatherText + "</td></tr>";
                }
            });     // end inner each-cycle
        });         // end outer each-cycle
        
        // close the html table
        resultTableApixu += "</tbody></table>";
        // fill the result manipulating the DOM
        $("#resultTableApixu").html(resultTableApixu);
    })
    
    .fail(function( xhr, status, errorThrown ) {
        // parse the json response
        var JSONerror = JSON.parse(xhr.responseText)
        $("#resultTableApixu").html(
            "<div class=\"alert alert-danger\" role=\"alert\">" +
                "<strong>There's been a problem</strong> calling the Apixu.com Api's " +
                "because of \"" + errorThrown + "\", code = " + JSONerror.error.code + 
                "<br/><br/><strong>The error message:</strong><br/>" + JSONerror.error.message + 
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