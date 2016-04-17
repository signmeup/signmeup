// Startup

Meteor.startup(function() {
  // Set version so client-side app can access it
  var version = process.env.VERSION || "";
  Meteor.settings.public.version = version
  console.log("Running SignMeUp " + version);

  // Update schemas
  Migrations.migrateTo("latest");

  // Initialize data
  createTestUsers();
  initializeCollections();

  // Run cron jobs
  SyncedCron.start();
});
