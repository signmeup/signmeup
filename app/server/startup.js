// Startup

Meteor.startup(function() {
  console.log("Running SignMeUp");

  // Initialize Data
  createTestUsers();
  initializeCollections();

  // Run cron jobs
  SyncedCron.start();
});
