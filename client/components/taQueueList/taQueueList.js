/* taQueueList */

Template.taQueueList.onRendered(function() {
  var self = this;

  // Reactively update the cutoff marker.
  // Function defined in queueList.js.
  this.autorun(function() {
    _setCutoffMarker(self, Template.currentData(), 6);
  });
});

Template.taQueueList.helpers({
  disableActions: function() {
    var ended = (this.status === "ended");
    var activeTicketsExist = _activeTickets(this.tickets).length;
    return (!ended && activeTicketsExist) ? "" : "disabled";
  }
});

Template.taQueueList.events({
  "click .js-shuffle-queue": function() {
    Meteor.call("shuffleQueue", this._id, function(err) {
      if(err)
        console.log(err);
    });
  }
});

/* taQueueTicket */

Template.taQueueTicket.onRendered(function() {
  $(this.findAll(".js-ticket-actions")).dropdown();
});

Template.taQueueTicket.events({
  "click .js-mark-as-done": function(event) {
    Meteor.call("markTicketAsDone", this._id, function(err) {
      if(err)
        console.log(err);
    })
  },
});