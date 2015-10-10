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


function getUberEstimate(startLatitude,startLongitude,endLatitude,endLongitude, callback)
{
    var uberServerToken = "rQNg72K512hx6HNGC6a6YR3b4ehRjgCrfjtA2XPx";
    var myURL = "https://api.uber.com/v1/estimates/price";

    $.ajax({
        type: 'GET',
        url: myURL,
        header: {

        },
        data: {
            server_token: uberServerToken,
            start_latitude : startLatitude ,
            start_longitude: startLongitude,
            end_latitude: endLatitude,
            end_longitude: endLongitude
        },
        async: false,
        dataType: 'json',
        crossDomain: true,
        success: function( response , textStatus, xhr) {
            console.log(response);
            var average = (response.prices[0].low_estimate + response.prices[0].high_estimate)/2;
//                    console.log(average);
            callback(average);

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown); }

    });
}

function calculateCost(response) {
    steps = response.routes[0].legs[0].steps;
    // Instantiate an info window to hold step text.
    var stepDisplay = new google.maps.InfoWindow;
    showSteps(response, stepDisplay);

    console.log( 'Public transport cost ' + response.routes[0].fare.value.toString());
    var price = response.routes[0].fare.value;

    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        if (step.travel_mode == "WALKING") {
            if (step.duration.value >= 300) {
                getUberEstimate(step.start_location.J, step.start_location.M,
                        step.end_location.J, step.end_location.M, function(average) {
                            uber_average = average;
                        });
                console.log(uber_average);
                price += uber_average;
            }
        }
        console.log(steps[i].travel_mode);
    }
    console.log('Final price ' + price.toString());

    return price;
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
