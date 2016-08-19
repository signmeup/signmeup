import { Template } from 'meteor/templating';

import '/imports/ui/components/queue-card/queue-card.js';

import './index.html';

Template.Index.onRendered(() => {
  document.title = 'SignMeUp';
});
