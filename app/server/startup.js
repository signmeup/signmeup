// Startup

Meteor.startup(function() {
  // Read settings.json
  // 
  // We don't use the standard `--settings settings.json` command
  // for good reason: when deploying on Docker, we need to specify
  // all of settings.json as an environment variable. Using env_file
  // in docker-compose lets us read from files, but specifying a multi-line
  // env variable is pretty hard. Much easier to have settings.json be a part
  // of the app.
  // 
  // JK! accounts-saml2 is loaded before this, so it can't access
  // settings.json. So either we load it as an env variable, or we
  // rewrite accounts-saml2 to be configured from the app.
  // 
  // I think generally it's better to be able to use settings.json
  // since other packages depend on it too.
  // Meteor.settings = JSON.parse(Assets.getText("settings.json"));

  // Setup SSL
  // var keyPath = process.env.PWD + "/private/ssl/key.pem";
  // var certPath = process.env.PWD + "/private/ssl/cert.pem";
  // SSL(keyPath, certPath, 3000);

  // Initialize Data
  _createTestUsers();
  _initializeCollections();

  // Run cron jobs
  SyncedCron.start();
});
