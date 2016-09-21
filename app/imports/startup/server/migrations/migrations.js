import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

import './1-clean-up-records.js';
import './2-migrate-to-v3.js';
import './3-merge-duplicate-locations.js';

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
