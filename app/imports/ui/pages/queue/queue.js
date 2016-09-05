import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Roles } from 'meteor/alanning:roles';

import Queues from '/imports/api/queues/queues.js';

import '/imports/ui/components/queue-header/queue-header.js';
import '/imports/ui/components/queue-actions/queue-actions.js';
import '/imports/ui/components/queue-alert-restricted-session/queue-alert-restricted-session.js';
import '/imports/ui/components/queue-table/queue-table.js';
import '/imports/ui/components/modals/modal-join-queue/modal-join-queue.js';

import './queue.html';

Template.Queue.onCreated(function onCreated() {
  this.getQueueId = () => { return FlowRouter.getParam('queueId'); };
  this.getView = () => { return FlowRouter.getQueryParam('view'); };
  this.getQueue = () => { return Queues.findOne(this.getQueueId()); };

  this.autorun(() => {
    this.subscribe('queues.byId', this.getQueueId());

    const queue = this.getQueue();
    if (queue) this.subscribe('courses.byId', queue.courseId);
  });
});

Template.Queue.onRendered(function onRendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      const queue = this.getQueue();
      document.title = `(${queue.activeTickets().count()}) ${queue.course().name} · ${queue.name} · SignMeUp`; // eslint-disable-line max-len
    }
  });
});

Template.Queue.helpers({
  queue() {
    return Template.instance().getQueue();
  },

  taView() {
    if (Template.instance().getView() === 'student') {
      return false;
    }

    const courseId = Template.instance().getQueue().courseId;
    if (Roles.userIsInRole(Meteor.user(), ['admin', 'mta', 'hta', 'ta'], courseId)) {
      return true;
    }

    return false;
  },

  showRestrictedSessionAlert() {
    return Template.instance().getQueue().settings.restrictedSessionIds.length > 0;
  },
});
