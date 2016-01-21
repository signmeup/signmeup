// Startup

Meteor.startup(function() {
  // Setup SSL
  var keyPath = Meteor.settings.ssl.absolutePathToKey;
  var certPath = Meteor.settings.ssl.absolutePathToCert;
  SSL(keyPath, certPath, 3000);

  // Initialize Data
  _createTestUsers();
  _initializeCollections();

  // Run cron jobs
  SyncedCron.start();
});
