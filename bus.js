var selectedNaptan = "";
var selectedName = "";
var firstPageLoad = true;

var myIconnew = L.icon(
{
    iconUrl: 'busstopnew.png',
    iconSize: [32, 51],
    iconAnchor: [16, 51],
    popupAnchor: [-3, -76],
});
var myIcon = L.icon(
{
    iconUrl: 'busstopicon.png',
    iconSize: [32, 51],
    iconAnchor: [16, 51],
    popupAnchor: [-3, -76],
});
var myIcon2 = L.icon(
{
    iconUrl: 'busstopicon2.png',
    iconSize: [32, 51],
    iconAnchor: [16, 51],
    popupAnchor: [-3, -76],
});
var mapMarkers = [];

$(function ()
{
    $("#accordion").accordion(
    {
        active: false,
        collapsible: true,
        heightStyle: "content"
    });
});
$(function ()
{
    $("#bstop").selectmenu();
});

function changeBackgroundStatusA()
{
    document.body.style.background = "#e6ffe6";
}

function changeBackgroundStatusB()
{
    document.body.style.background = "#ffddcc";
}

function refreshBusses()
{
    changeBackgroundStatusA();
    var j;
    for (j = 0; j < 21; j++)
    {
        document.getElementById("bus_" + j + "_title").style.visibility = 'hidden';
        document.getElementById("bus_" + j + "_p").style.visibility = 'hidden';
    }
    if (selectedNaptan < 3)
    {
        changeBackgroundStatusB();
        return;
    }


    $.getJSON("https://api.tfl.gov.uk/StopPoint/" + selectedNaptan + "/arrivals", function (data)
    {
        document.getElementById("bus_selected").innerHTML = selectedName;
        var busses_due = data.length;
        document.getElementById("bus_summary").innerHTML = "Busses found: " + busses_due;

        //sort by arrival time
        data.sort(function (a, b)
        {
            return (a["timeToStation"] > b["timeToStation"]) ? 1 : ((a["timeToStation"] < b["timeToStation"]) ? -1 : 0);
        });

        var i;
        for (i = 0; i < busses_due; i++)
        {
		
		document.getElementById("bus_"+i+"_title").style.visibility = 'visible';
		document.getElementById("bus_"+i+"_p").style.visibility = 'visible';
		
		var mins =  Math.round(parseInt(data[i]["timeToStation"]) / 60) ;
		document.getElementById("bus_"+i+"_title").innerHTML="<span style='color:red;'>" +data[i]["lineName"] + "</span> to <i>" + data[i]["destinationName"] + "</i> <b>" + mins + "</b> mins";
		document.getElementById("bus_"+i+"_p").innerHTML= "This bus stop: <b>" + data[i]["stationName"] +
												"<br> </b> Number Plate:  <b><span style='background-color:yellow'>" + data[i]["vehicleId"] + 
												"</span><br></b>Bus Stop Code:  <b>" +data[i]["platformName"] + "</b>" + 
												"<br></b> Going to:  <b>" +data[i]["destinationName"] +"</b>";
												
        }
        changeBackgroundStatusB();
    })

}

window.onload = function ()
{
    changeBackgroundStatusB();
    getLocation();
    changeBackgroundStatusB();
    refreshBusses();

};
window.setInterval(function ()
{
    refreshBusses();
}, 9000);


function getLocation()
{
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else
    {
    }
}

function showPosition(position)
{

    var mymap = L.map('mapid').setView([position.coords.latitude, position.coords.longitude], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {

    }).addTo(mymap);

    var circle = L.circle([position.coords.latitude, position.coords.longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: position.coords.accuracy
    }).addTo(mymap);
    $.getJSON("getbusstop.php?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude, function (data)
    {

        var i;
        for (i = 0; i < 45; i++)
        {
            var marker = L.marker([data[i]["lat"], data[i]["lon"]], {
                icon: myIcon
            }).addTo(mymap);

            mapMarkers[mapMarkers.length] = marker;
            marker.naptan = data[i]["naptan"];
            marker.bname = data[i]["name"];
            marker.bindPopup(data[i]["name"]);

            function onMapClick(e)
            {
                selectedNaptan = e.sourceTarget.naptan;
                selectedName = e.sourceTarget.bname;
                for (var j = 0; j < mapMarkers.length; j++)
                {
                    mapMarkers[j].setIcon(myIcon);
                }
                document.getElementById("bus_selected").innerHTML = "Loading";
                document.getElementById("bus_summary").innerHTML = "Loading";

                e.sourceTarget.setIcon(myIcon2);
                refreshBusses();
            }
            marker.on('click', onMapClick);
        }

        if (firstPageLoad)
        {
            selectedNaptan = mapMarkers[0].naptan;
            selectedName = mapMarkers[0].bname;
            for (var j = 0; j < mapMarkers.length; j++)
            {
                mapMarkers[j].setIcon(myIcon);

            }
            mapMarkers[0].setIcon(myIcon2);
            refreshBusses();
            firstPageLoad = false;
        }
        changeBackgroundStatusB();


    });

}