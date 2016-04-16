// Startup

Meteor.startup(function() {
  console.log("Running SignMeUp");

  // Update schemas
  Migrations.migrateTo("latest");

  // Initialize Data
  createTestUsers();
  initializeCollections();

  // Run cron jobs
  SyncedCron.start();
});
