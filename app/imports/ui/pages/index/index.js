import './index.html';

import { Template } from 'meteor/templating';

import Queues from '/imports/api/queues/queues';

import { _getUserCourseNames } from '/imports/lib/both/users';

import { _showModal } from '/imports/lib/client/helpers';

Template.index.onCreated(function indexOnCreated() {
  this.autorun(() => {
    this.subscribe('courses');
    this.subscribe('activeQueues');
    this.subscribe('allActiveTickets');
  });
});

Template.taIndex.helpers({
  taQueues() {
    // Note: Queues only has activeQueues, based on the subscription above
    return Queues.find({ course: { $in: _getUserCourseNames() } }).fetch();
  },

  otherQueues() {
    // Note: Queues only has activeQueues, based on the subscription above
    return Queues.find({ course: { $nin: _getUserCourseNames() } }).fetch();
  },
});

Template.taIndex.events({
  'click .js-show-create-modal': () => {
    _showModal('.js-create-queue-modal');
  },
});
