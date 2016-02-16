// Startup

Meteor.startup(function() {
  var versionNumber = (Meteor.settings && Meteor.settings.public.version) ? ("v" + Meteor.settings.public.version) : "";
  console.log("Running SignMeUp " + versionNumber);

  // Initialize Data
  createTestUsers();
  initializeCollections();

  // Run cron jobs
  SyncedCron.start();
});
