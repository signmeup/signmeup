import { Template } from 'meteor/templating';

import '/imports/lib/both/auth';

import '/imports/ui/components/nav/nav';
import '/imports/ui/components/footer/footer';

import './baseLayout.html';

Template.baseLayout.onCreated(function baseLayoutOnCreated() {
  const self = this;
  self.autorun(() => {
    self.subscribe('userData');
    self.subscribe('locations');
  });
});
