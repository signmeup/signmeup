import { Template } from 'meteor/templating';

import '/imports/lib/both/auth';

import '/imports/ui/components/nav/nav';
import '/imports/ui/components/footer/footer';

import './baseLayout.html';

Template.baseLayout.onCreated(function baseLayoutOnCreated() {
  this.autorun(() => {
    this.subscribe('userData');
    this.subscribe('locations');
  });
});
