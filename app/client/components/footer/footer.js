Template.footer.helpers({
  versionNumber: function() {
    if (Meteor.settings && Meteor.settings.public.version) {
      return "v" + Meteor.settings.public.version;
    } else {
      return "";
    }
  }
});