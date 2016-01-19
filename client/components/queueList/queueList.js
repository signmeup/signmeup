// queueList

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
      _showModal(".js-join-queue-modal");
    } else {
      Meteor.loginWithSaml(function() {
        if(Meteor.user())
          _showModal(".js-join-queue-modal");
      });
    }
  },
});

// queueTicket

Template.queueTicket.helpers({
  isOwner: function() {
    return this.owner.id === Meteor.userId();
  }
});

Template.queueTicket.events({
  "click .js-edit-ticket": function(event) {
    // TODO: Implement edit functionality
    return;
  },

  "click .js-cancel-ticket": function(event) {
    Meteor.call("cancelTicket", this._id);
  }
});
