let toMapPicker, fromMapPicker;

window.initMap = function() {
  
  const coimbatore = { lat: 11.0168, lng: 76.9558 };

  const tomap = new google.maps.Map(document.getElementById("tomap"), {
    center: coimbatore,
    zoom: 8,
  });

  const frommap = new google.maps.Map(document.getElementById("frommap"), {
    center: coimbatore,
    zoom: 8,
  });

  // const tomarker = new google.maps.Marker({
  //   positon: coimbatore,
  //   map: tomap
  // });

  // const frommarker = new google.maps.Marker({
  //   positon: coimbatore,
  //   map: frommap
  // });
  toMapPicker = new locationPicker('tomap', {
    lat: coimbatore.lat,
    lng: coimbatore.lng
  }, {
    zoom: 15 // You can set any google map options here, zoom defaults to 15
  });

  fromMapPicker = new locationPicker('frommap', {
    lat: coimbatore.lat,
    lng: coimbatore.lng
  }, {
    zoom: 15 // You can set any google map options here, zoom defaults to 15
  });
}

$('#toBtn').click( () => {
  let location = toMapPicker.getMarkerPosition();
  $('#toLatitude').val(location.lat);
  $('#toLongitude').val(location.lng);
});

$('#fromBtn').click( () => {
  let location = fromMapPicker.getMarkerPosition();
  $('#fromLatitude').val(location.lat);
  $('#fromLongitude').val(location.lng);
  console.log($('#fromLatitude'));
});