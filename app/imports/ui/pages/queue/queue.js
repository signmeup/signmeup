import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import Queues from '/imports/api/queues/queues.js';

import '/imports/ui/components/queue-header/queue-header.js';
import '/imports/ui/components/queue-actions/queue-actions.js';
import '/imports/ui/components/queue-devices/queue-devices.js';
import '/imports/ui/components/queue-table/queue-table.js';

import './queue.html';

Template.Queue.onCreated(function onCreated() {
  this.getQueueId = () => { return FlowRouter.getParam('queueId'); };

  this.autorun(() => {
    this.subscribe('queues.byId', this.getQueueId());

    const queue = Queues.findOne(this.getQueueId());
    if (queue) this.subscribe('courses.byId', queue.courseId);
  });
});

Template.Queue.onRendered(function onRendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      const queue = Queues.findOne(this.getQueueId());
      document.title = `(${queue.activeTickets().count()}) ${queue.course().name} · ${queue.name} · SignMeUp`; // eslint-disable-line max-len
    }
  });
});

Template.Queue.helpers({
  queue() {
    return Queues.findOne(Template.instance().getQueueId());
  },
});
