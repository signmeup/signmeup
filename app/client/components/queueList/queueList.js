// queueList

Template.queueList.onRendered(function() {
  var self = this;

  // Reactively set the cutoff marker. This runs each
  // time the status or activeTickets changes.
  this.autorun(function() {
    _setCutoffMarker(self, Template.currentData(), 3);
  });
});

Template.queueList.helpers({
  disableJoin: function() {
    var ended = (this.status === "ended");

    var activeTickets = _activeTickets(this.tickets);
    var ownerIds = _.map(activeTickets, function(t) {
      return t.owner.id;
    })
    var alreadySignedUp = _.contains(ownerIds, Meteor.userId());

    return (ended || alreadySignedUp) ? "disabled" : "";
  }
});

Template.queueList.events({
  "click .js-show-join-queue": function(event) {
    if(Meteor.user()) {
      _showModal(".js-join-queue-modal", "textarea[name='question']");
    } else {
      Meteor.loginWithSaml(function() {
        if(Meteor.user())
          _showModal(".js-join-queue-modal", "textarea[name='question']");
      });
    }
  },
});

// Sets or removes the cutoff marker appropriately.
// Call from within a this.autorun within the onRendered
// function of a template.
_setCutoffMarker = function(instance, data, colspan) {
  // Remove any existing markers
  instance.$(".cutoff-marker").remove();

  if (data.status === "cutoff") {
    var activeTickets = _activeTickets(data.tickets);

    // If no active tickets, let the template
    // show a message about being cutoff. We only show the 
    // cutoff marker when there is at least one active ticket.
    if (activeTickets.length == 0)
      return;

    var activeTimes = _.map(activeTickets, function(t) {
      return t.createdAt;
    });
    activeTimes.push(data.cutoffTime);
    activeTimes.sort();

    // Calculate where to insert the cutoff marker
    var cutoffIndex = activeTimes.indexOf(data.cutoffTime);

    var cutoffMarker = $("<tr class='cutoff-marker'><td colspan='" + colspan + "'>Cutoff</td></tr>")

    // Insert into DOM
    if (cutoffIndex === 0) {
      instance.$("tbody").prepend(cutoffMarker);
    } else {
      var precedingTicket = instance.$("tr:eq(" + (cutoffIndex - 1) + ")");
      cutoffMarker.insertAfter(precedingTicket);
    }
  }
}

// queueTicket

Template.queueTicket.helpers({
  isOwner: function() {
    return this.owner.id === Meteor.userId();
  },

  waitTime: function() {
    var queue = Queues.findOne(this.queueId);
    var timeSoFar = Date.now() - this.createdAt;
    var timeRemaining = queue.averageWaitTime - timeSoFar;

    if (timeRemaining < 0) {
      // Student has waited longer than average
      return "—";
    } else {
      return Math.ceil(timeRemaining / (60 * 1000)) + " minutes";
    }
  }
});

Template.queueTicket.events({
  "click .js-edit-ticket": function(event) {
    // TODO: Implement edit functionality
    return;
  },

  "click .js-cancel-ticket": function(event) {
    var ok = confirm("Are you sure you want to cancel your signup?");
    if (ok)
      Meteor.call("cancelTicket", this._id);
  }
});
