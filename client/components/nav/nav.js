Template.navAccount.onRendered(function() {
  $(this.findAll(".ui.dropdown")).dropdown();
});

Template.navAccount.helpers({
  "name": function() {
    var user = Meteor.user();
    var name = user.profile.name || user.profile.givenName;
    var email = user.emails ? user.emails[0].address : user.email;

    return name ? name : email.split("@")[0];
  }
});

Template.nav.events({
  "click .js-sign-in": function(event) {
    event.preventDefault();
    Meteor.loginWithSaml(function() {
      console.log("Welcome " + Meteor.user().profile.givenName + "!");
    });
  }
});

Template.navAccount.events({
  "click #logout": function() {
    Meteor.logout();
  }
});