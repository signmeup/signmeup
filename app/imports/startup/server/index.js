import { Meteor } from 'meteor/meteor';

// Read app version and log it
const version = process.env.VERSION || '';
Meteor.settings.public.version = version;
console.log(`Running SignMeUp ${version}`); // eslint-disable-line no-console

// Register API
import './register-api';

// Run migrations
import './migrations/migrations';

// Initialize test data
import './fixtures';

// Run cron jobs
import './cron-jobs';
