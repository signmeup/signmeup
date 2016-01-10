Template.queueList.helpers({
  isOwner: function() {
    return this.owner.id === Meteor.userId();
  }
});

Template.queueList.events({
  "click .js-show-join-queue": function(event) {
    if(Meteor.user()) {
      showModal();
    } else {
      Meteor.loginWithSaml(function() {
        if(Meteor.user())
          showModal();
      });
    }
  },

  "click .js-edit-ticket": function(event) {

  },

  "click .js-cancel-ticket": function(event) {
    Meteor.call("cancelTicket", this._id);
  }
});
