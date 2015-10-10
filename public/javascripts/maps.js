var infowindowStart;
var markerStart;
var autocompleteStart;

var infowindowEnd;
var markerEnd;
var autocompleteEnd;
var map;

function setBounds() {
    var bounds = new google.maps.LatLngBounds();
    if (markerStart.getPosition() !== undefined) {
        bounds.extend(markerStart.getPosition());
    }
    if (markerEnd.getPosition() !== undefined) {
        bounds.extend(markerEnd.getPosition());
    }
    map.fitBounds(bounds);
}

function autocompleteListnerStart() {
    infowindowStart.close();
    markerStart.setVisible(false);
    place = autocompleteStart.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
        // map.fitBounds(place.geometry.viewport);
    } else {
        // map.setCenter(place.geometry.location);
        // map.setZoom(17);  // Why 17? Because it looks good.
    }
    markerStart.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
//                anchor: new google.maps.Point(17, 34),
//                scaledSize: new google.maps.Size(35, 35)
    }));
    markerStart.setPosition(place.geometry.location);
    markerStart.setVisible(true);

    var address = '';
    if (place.address_components) {
        address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
    }


    setBounds();

    infowindowStart.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindowStart.open(map, markerStart);
}


function autocompleteListnerEnd() {
    infowindowEnd.close();
    markerEnd.setVisible(false);
    var place = autocompleteEnd.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
        // map.fitBounds(place.geometry.viewport);
    } else {
        // map.setCenter(place.geometry.location);
        // map.setZoom(17);  // Why 17? Because it looks good.
    }
    markerEnd.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
//                anchor: new google.maps.Point(17, 34),
//                scaledSize: new google.maps.Size(35, 35)
    }));
    markerEnd.setPosition(place.geometry.location);
    markerEnd.setVisible(true);

    var address = '';
    if (place.address_components) {
        address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
    }


    setBounds();

    infowindowEnd.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindowEnd.open(map, markerEnd);
}




function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    // Get a map.
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: 41.85, lng: -87.65},
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    directionsDisplay.setMap(map);

//            getEstimatesForUserLocation(userLatitude, userLongitude, partyLatitude, partyLongitude);
//            return;

    // On change handler for directions.
    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('calculate_directions').addEventListener("click", onChangeHandler);

    // Place autocomplete.
    var input = (document.getElementById('start'));
    autocompleteStart = new google.maps.places.Autocomplete(input);
    autocompleteStart.bindTo('bounds', map);
    infowindowStart = new google.maps.InfoWindow();
    markerStart = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });
    autocompleteStart.addListener('place_changed', autocompleteListnerStart);

    var inputEnd = (document.getElementById('end'));
    autocompleteEnd = new google.maps.places.Autocomplete(inputEnd);
    autocompleteEnd.bindTo('bounds', map);
    infowindowEnd = new google.maps.InfoWindow();
    markerEnd = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });
    autocompleteEnd.addListener('place_changed', autocompleteListnerEnd);

    google.maps.event.addListener(markerStart, 'click', function() {
        map.setZoom(22);
        map.panTo(this.getPosition());
    });

    google.maps.event.addListener(markerEnd, 'click', function() {
        map.setZoom(22);
        map.panTo(this.getPosition());
    });

}

var uber_average = 0;
var uber_time = 0;

function getUberEstimate(startLatitude,startLongitude,endLatitude,endLongitude, callback)
{
    var myURL = "/uberprice";

    $.ajax({
        type: 'GET',
        url: myURL,
        header: {

        },
        data: {
            start_latitude : startLatitude ,
            start_longitude: startLongitude,
            end_latitude: endLatitude,
            end_longitude: endLongitude
        },
        async: false,
        dataType: 'json',
        crossDomain: true,
        success: function( response , textStatus, xhr) {
            callback(response.avg_price, response.duration);

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown); }

    });
}

function calculateCost(response) {
    var start_location = response.routes[0].legs[0].start_location;
    var end_location = response.routes[0].legs[0].end_location;

    getUberEstimate(start_location.J, start_location.M,
        end_location.J, end_location.M, function (average, duration) {
            uber_average = average;
            uber_time = duration;
            console.log(uber_time);
        });

    var total_time_U = uber_time;
    var price_U = uber_average;

    console.log('Total time U ' + uber_time.toString());
    console.log( 'Price U ' + uber_average.toString());

    //Perform a error handling. In case the two distances are too far then routes is undefined
    steps = response.routes[0].legs[0].steps;
    // Instantiate an info window to hold step text.
    var stepDisplay = new google.maps.InfoWindow;
    showSteps(response, stepDisplay);


    var price_P = response.routes[0].fare.value;
    var price_M = response.routes[0].fare.value;
    var uber_time_save = 0;


    var total_time_P = response.routes[0].legs[0].duration.value;
    console.log('Total time P ' + total_time_P.toString());
    console.log( 'Price P ' + price_P.toString());

    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        var instructions = step.instructions;
        var travel_mode = "";
        if (step.travel_mode == "WALKING") {
            if (step.duration.value >= 200) {
                getUberEstimate(step.start_location.J, step.start_location.M,
                    step.end_location.J, step.end_location.M, function (average, duration) {
                        uber_average = average;
                        uber_time = duration;
                        //console.log(uber_time);
                    });
                price_M += uber_average;
                uber_time_save += step.duration.value - uber_time;
                travel_mode = "UBER";

            }
            else {
                travel_mode = "WALKING";
            }
        }
        else {
            travel_mode = "TRANSIT";

        }

        var table = document.getElementById("instruction-table");
        var row = table.insertRow(-1);

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        if(travel_mode==="WALKING"){
            row.className = "success";
        }
        if(travel_mode==="UBER"){
            row.className = "info";
        }
        if(travel_mode==="TRANSIT"){
            row.className ="warning";

        }
        cell1.innerHTML = travel_mode;
        cell2.innerHTML = instructions;



    }
    var total_time_M = total_time_P - uber_time_save;
    console.log('Total time M ' + getTimeString(total_time_M));
    console.log('Price M ' + price_M.toString());

    addElementTime('time-all', getTimeString(total_time_M));
    addElementTime('time-uber-only', getTimeString(total_time_U));
    addElementTime('time-public-only', getTimeString(total_time_P));

    addElementMoney('cost-all', price_M);
    addElementMoney('cost-uber-only', price_U);
    addElementMoney('cost-public-only', price_P);
    return price_M;
}


function getTimeString(time) {
    var mins = ~~(time / 60);
    var secs = time % 60;

// Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;

// Output like "1:01" or "4:03:59" or "123:03:59"
    ret = "";

    if (hrs > 0)
        ret += "" + hrs + " hr, " + (mins < 10 ? "0" : "");

    ret += "" + mins + " min, " + (secs < 10 ? "0" : "");
    ret += "" + secs+" sec (approx.)";
    return ret;
}

function addElementMoney(id, value) {
    var element = document.getElementById(id);
    element.innerHTML = "$ " + value.toString();
}

function addElementTime(id, value) {
    var element = document.getElementById(id);
    element.innerHTML =  value.toString();
}

function showSteps(directionResult, stepDisplay) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    var myRoute = directionResult.routes[0].legs[0];
    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker =  new google.maps.Marker;

        google.maps.event.addListener(marker, 'click', function() {
            map.setZoom(22);
            map.panTo(this.getPosition());
        });

        marker.setMap(map);
        marker.setPosition(myRoute.steps[i].start_location);
        attachInstructionText(stepDisplay, marker, myRoute.steps[i].instructions);
    }
}

function attachInstructionText(stepDisplay, marker, text) {
    google.maps.event.addListener(marker, 'click', function() {
        // Open an info window when the marker is clicked on, containing the text
        // of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: google.maps.TravelMode.TRANSIT
    }, function(response, status) {
        console.log(response);
        final_price = calculateCost(response);
        var element = document.getElementById("result");
        element.innerHTML = "The cheapest and fastest route costs $ " + final_price.toString();

        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
