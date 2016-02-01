// taQueueList

Template.taQueueList.onCreated(function() {
  var self = this;
  this.timeRemaining = new ReactiveVar(0);

  this.autorun(function() {
    if(this.interval)
      Meteor.clearInterval(this.interval);

    var endTime = Template.currentData().endTime;

    this.interval = Meteor.setInterval(function() {
      self.timeRemaining.set(endTime - Date.now());
    }, 1000);
  });
});

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
    var ok = confirm("Are you sure you want to shuffle all active tickets?");
    if (ok) {
      Meteor.call("shuffleQueue", this._id, function(err) {
        if(err)
          console.log(err);
      });
    }
  },

  "click .js-clear-all": function() {
    var ok = confirm("Are you sure you want to cancel all active tickets?");
    if (ok) {
      Meteor.call("clearQueue", this._id, function(err) {
        if(err)
          console.error(err);
      });
    }
  }
});

// taQueueTicket

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