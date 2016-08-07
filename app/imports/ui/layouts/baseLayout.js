import './baseLayout.html';

import { Template } from 'meteor/templating';

import '/imports/lib/both/auth.js';

import '/imports/ui/components/nav/nav.js';
import '/imports/ui/components/footer/footer.js';

Template.baseLayout.onCreated(function baseLayoutOnCreated() {
  this.subscribe('userData');
  this.subscribe('locations');
});
