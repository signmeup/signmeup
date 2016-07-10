import { Meteor } from 'meteor/meteor';

// Read app version and log it
const version = process.env.VERSION || '';
Meteor.settings.public.version = version;
console.log(`Running SignMeUp ${version}`); // eslint-disable-line no-console

// Run migrations
import './migrations.js';

// Initialize test data
import './fixtures.js';

// Run cron jobs
import './cron-jobs.js';
