// Functions

_formatTime = function(milliseconds, format) {
  if(!format) format = "h:mm A, MMMM DD";
  return moment(milliseconds).format(format);
}

_showModal = function(selector) {
  $(selector)
    .modal({
      "transition": "fade up",
      "duration": 200,
      "detachable": false // Needed to maintain Blaze events
    })
    .modal("show");
}

_getLocations = function () {
  return Locations.find({});
}

_timeInMinutes = function(milliseconds) {
  var d = moment.duration(milliseconds, "milliseconds");
  return Math.floor(d.asMinutes());
}

// UI Helpers

UI.registerHelper("locations", _getLocations);
