import { Meteor } from 'meteor/meteor';

// Read app version and log it
const version = process.env.VERSION || '';
Meteor.settings.public.version = version;
console.log(`Running SignMeUp ${version}`); // eslint-disable-line no-console

// Set config
import '/imports/lib/both/config.js';

// Register API
import '../both/register-api.js';

// Run migrations
// TODO: review migrations given new schemas
// import './migrations/migrations.js';

// Initialize test data
import './fixtures.js';

// Run cron jobs
import './cron-jobs.js';
