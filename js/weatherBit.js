/* 

CURRENT - https://www.weatherbit.io/api#!/Current32Weather32Data/get_current_geosearch

https://api.weatherbit.io/v1.0/current/geosearch?key=df65841386bd4a1c8ef7d71b28abee73&city=Venice

FORECAST 5 days
https://api.weatherbit.io/v1.0/forecast/3hourly/geosearch?key=df65841386bd4a1c8ef7d71b28abee73&days=5&city=Venice

*/

function getWBParameters(chosenMethod){
    
    switch(chosenMethod){
        case 'byCity':
            
            searchParameters = "&city=" + $("#city").val();
            var country = $("#country").val();
            if(country != undefined && country != ""){
                country.replace(" ", "+");
                searchParameters += "&country="  + country;
            } 
            return searchParameters;
        case 'byZip': 
            return "&postal_code=" + $("#zipCode").val();
        case 'byGeo': 
            return "&lat=" +$("#latitude").val() + "&lon=" +$("#longitude").val();
        default:
            searchParameters = "&city=" + $("#city").val();
            var country = $("#country").val();
            if(country != undefined && country != ""){
                country.replace(" ", "+");
                searchParameters += "&country="  + country;
            } 
            return searchParameters;
    }
}

// param weather --> just the current weather
function currentWeatherWB(chosenMethod){
    
    var weatherUrl = "https://api.weatherbit.io/v1.0/current/geosearch?key=df65841386bd4a1c8ef7d71b28abee73" 
        + getWBParameters(chosenMethod) + getUnitWBParameters();
    
    var tempUnit = getTempUnit();

    // api call to Apixu
    $.ajax({
        url: weatherUrl
    }).then(function(data) {
        
        var city = data.data[0].city_name;
        var lat = data.data[0].lat;
        var lon = data.data[0].lon;
        var country = data.data[0].country_code;
        var temp = data.data[0].temp;
        var weatherDescr = data.data[0].weather.description;
        var weatherIcon = "https://www.weatherbit.io/static/img/icons/" + data.data[0].weather.icon + ".png";
        var fullTimeDate = getFullDate(data.data[0].ts);

        // starting building the final html table - kept multiple lines to be readeable for developers
        resultTableWeatherBit =
            "<table class=\"table table-hover table-bordered\">" +
                "<caption>WeatherBit.io</caption>" +
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
                     "<td>Temp:</td>" +
                        "<td>" + temp + tempUnit + "</td>" +
                    "</tr>" +
                "<tr>" +
                    "<td>Weather:</td>" +
                    "<td><img id=\"weatherIcon\" src= \"" + weatherIcon + "\"/>" + weatherDescr + "</td>"
                "</tr>" +
            "</tbody>" +
        "</table>";
        
        $("#resultTableWeatherBit").html(resultTableWeatherBit);
    })
    
    .fail(function( xhr, status, errorThrown ) {
        try {
        // parse the json response
        var JSONerror = JSON.parse(xhr.responseText);
            $("#resultTableWeatherBit").html(
            "<div class=\"alert alert-danger\" role=\"alert\">" +
                "<strong>There's been a problem</strong> calling the WeatherBit.io Api's " +
                "because of \"" + errorThrown + "\"<br/><br/>" +
                "<strong>The error message:</strong><br/>" + JSONerror.error + 
            "</div>");  
        } catch(e){
            console.log("e = " + e);
        $("#resultTableWeatherBit").html(
            "<div class=\"alert alert-danger\" role=\"alert\">" +
                "<strong>There's been a problem</strong> calling the WeatherBit.io Api's<br/><br/>" +
                "No reponse with these inputs</div>");   
        }
    });
}


// param forecast --> next 5 days forecast weather
function forecastWeatherWB(chosenMethod){
    
    var forecastUrl = "https://api.weatherbit.io/v1.0/forecast/3hourly/geosearch?key=df65841386bd4a1c8ef7d71b28abee73&days=5"
         + getWBParameters(chosenMethod) + getUnitWBParameters();
    
    $.ajax({
        url: forecastUrl
    }).then(function(data) {
        
        var tempUnit = getTempUnit();
        
        $(".results").hide();   // hide (eventually) showed before during the call, after it will be re-show undated
        var city = data.city_name;
        var lat = data.lat;
        var lon = data.lon;
        var country = data.country_code;
        
        // starting building the final html table - kept multiple lines to be readeable for developers
        var resultTableWeatherBit = 
            "<table class=\"table table-hover table-bordered\">" +
                "<caption>WeatherBit.io</caption>" +
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
        $.each(data.data, function(dayIndex, dayEntry){

            var fullDate = getFullDate(dayEntry.ts);    
            var hour = getFullTime(dayEntry.ts);
            
            if(hour == '08:00' || hour == '14:00' || hour == '20:00' ) {
                var temp = dayEntry.temp;
                var weatherIcon = "https://www.weatherbit.io/static/img/icons/" + dayEntry.weather.icon + ".png";
                var weatherDescr = dayEntry.weather.description;
                resultTableWeatherBit += 
                    "<tr>"
                        + "<td>" + fullDate + "</td>"
                        + "<td>" + hour + "</td>"
                        + "<td>" + temp + tempUnit + "</td>" 
                        + "<td><img id=\"weatherIcon\" src= \"" + weatherIcon + "\"/>" + weatherDescr + "</td>"
                    + "</tr>";
            }
        });     // end inner each-cycle
            

        // close the html table
        resultTableWeatherBit += "</tbody></table>";
        // fill the <div> result element with the table just built
        $("#resultTableWeatherBit").html(resultTableWeatherBit);
    })
    
    .fail(function( xhr, status, errorThrown ) {
        // parse the json response
        var JSONerror = JSON.parse(xhr.responseText)
        $("#resultTableWeatherBit").html(
            "<div class=\"alert alert-danger\" role=\"alert\">" +
                "<strong>There's been a problem</strong> calling the WeatherBit.io Api's " +
                "because of \"" + errorThrown + "\"<br/><br/>" +
                "<strong>The error message:</strong><br/>" + JSONerror.error + 
            "</div>");   
    });
}

/* Units management for WeatherBit --> see https://www.weatherbit.io/api/requests
M - [DEFAULT] Metric (Celcius, m/s, mm)
S - Scientific (Kelvin, m/s, mm)
I - Fahrenheit (F, mph, in) */
function getUnitWBParameters(){
    switch (getUnit()){
        case "celsius": return "";
        case "kelvin": return "&units=S";
        case "fahrenheit": return "&units=I";
        default: return "";         // default : Celsius
    }
}
