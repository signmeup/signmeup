import { Template } from 'meteor/templating';

import '/imports/ui/components/queue-header/queue-header.js';
import '/imports/ui/components/queue-actions/queue-actions.js';
import '/imports/ui/components/queue-devices/queue-devices.js';
import '/imports/ui/components/queue-body/queue-body.js';

import './queue.html';

Template.Queue.onRendered(() => {
  document.title = 'cs15 · TA Hours · SignMeUp';
});
