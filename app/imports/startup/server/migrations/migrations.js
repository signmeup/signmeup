import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

import './1-clean-up-records';

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
