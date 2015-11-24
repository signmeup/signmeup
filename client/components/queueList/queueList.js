Template.queueList.helpers({
  activeTickets: function() {
    /* Filter out active tickets */
    var activeTickets = this.tickets.filter(function(e) {
      return e.status != "done";
    });

    /* Extend tickets with position */
    for(var i = 0; i < activeTickets.length; i++) {
      activeTickets[i]["position"] = i + 1;
    }

    return activeTickets;
  }
});

Template.queueList.events({
  "click .js-show-join-queue": function(event) {
    $(".js-join-queue-modal")
      .modal({
        "transition": "fade up",
        "duration": 200,
        "detachable": false // Needed to maintain Blaze events
      })
      .modal("show");
  }
});