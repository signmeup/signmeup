import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

import './1-clean-up-records';
import './2-migrate-to-v3';
import './3-merge-duplicate-locations';
import './4-clean-up-user-records';

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
