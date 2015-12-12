Template.navAccount.onRendered(function() {
  $(this.findAll(".ui.dropdown")).dropdown();
});

Template.navAccount.helpers({
  "name": function() {
    var name = Meteor.user().profile.name;
    var email = Meteor.user().emails[0].address;
    return name ? name : email.split("@")[0];
  }
});

Template.navAccount.events({
  "click #logout": function() {
    Meteor.logout();
  }
});