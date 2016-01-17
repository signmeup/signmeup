Template.nav.events({
  "click .js-sign-in": function(event) {
    event.preventDefault();
    Meteor.loginWithSaml(function() {
      console.log("Welcome " + Meteor.user().profile.givenName + "!");
    });
  },

  "click .js-sign-out": function(event) {
    event.preventDefault();
    Meteor.logout();
  }
});
