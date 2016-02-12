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

Template.taQueueTicket.helpers({
  showNotifyButton: function(type) {
    return (this.notify && this.notify.types && _.contains(this.notify.types, type));
  },

  notifyButtonColor: function(type) {
    return notificationSent(this, type) ? "green" : "";
  },

  notificationSent: function(type) {
    return notificationSent(this, type);
  },
});

Template.taQueueTicket.events({
  "click .js-email-student": function() {
    var $icon = $(".js-email-student .mail.icon");
    var iconClasses = $icon.attr("class");

    $icon.removeClass().addClass("notched circle loading icon");

    Meteor.call("notifyTicketOwner", this._id, "email", function(err) {
      if(err)
        console.log(err);
      $icon.removeClass().addClass(iconClasses);
    })
  },

  "click .js-text-student": function() {
    var $icon = $(".js-text-student .comment.icon");
    var iconClasses = $icon.attr("class");

    $icon.removeClass().addClass("notched circle loading icon");

    Meteor.call("notifyTicketOwner", this._id, "text", function(err) {
      if(err)
        console.log(err);
      $icon.removeClass().addClass(iconClasses);
    })
  },

  "click .js-mark-as-done": function() {
    Meteor.call("markTicketAsDone", this._id, function(err) {
      if(err)
        console.log(err);
    })
  },

  "click .js-cancel-ticket": function() {
    var ok = confirm("Are you sure you want to cancel this signup?");
    if (ok)
      Meteor.call("cancelTicket", this._id);
  }
});

function notificationSent(ticket, type) {
  return (ticket.notify && ticket.notify.sent && _.contains(ticket.notify.sent, type));
}