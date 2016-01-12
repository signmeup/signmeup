Template.queueList.helpers({
  isOwner: function() {
    return this.owner.id === Meteor.userId();
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

  "click .js-edit-ticket": function(event) {
    // TODO: Implement edit functionality
    return;
  },

  "click .js-cancel-ticket": function(event) {
    Meteor.call("cancelTicket", this._id);
  }
});
