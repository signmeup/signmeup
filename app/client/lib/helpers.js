// Functions

_formatTime = function(milliseconds, format) {
  if(!format) format = "h:mm A, MMMM DD";
  return moment(milliseconds).format(format);
}

_showModal = function(selector, focusElement) {
  $(selector)
    .modal({
      "transition": "fade up",
      "duration": 200,
      "detachable": false, // Needed to maintain Blaze events
      "autofocus": !(focusElement)
    })
    .modal("show");

  if (focusElement) {
    // Semantic UI removes focus from all fields if `autofocus`
    // above is set to false. We wait for it to do that, then set
    // focus on the element we want.
    setTimeout(function() {
      $(selector).find(focusElement).focus();
    }, 300);
  }
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
