// Startup

Meteor.startup(function() {
  // Initialize Data
  createTestUsers();
  initializeCollections();

  // Run cron jobs
  SyncedCron.start();
});
