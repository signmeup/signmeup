Template.queueList.helpers({
  activeTickets: function() {
    console.log("tickets", this.tickets);

    /* Filter out active tickets */
    var activeTickets = this.tickets.filter(function(e) {
      return e.status != "done";
    });

    /* TODO: Extend tickets with position
     * Fails right now because tickets aren't loaded.
     */
    // for(var i = 1; i <= activeTickets.length; i++) {
    //   activeTickets[i]["position"] = i;
    // }

    console.log("activeTickets", activeTickets);
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