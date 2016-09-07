import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import { Courses } from '/imports/api/courses/courses';
import { Locations } from '/imports/api/locations/locations';

import { authorized } from '/imports/lib/both/auth';
import { _activeTickets } from '/imports/lib/both/filters';

import { _formatTime, _timeInMinutes, _showModal } from '/imports/lib/client/helpers';

import './queueCard.html';

Template.queueCardLink.helpers({
  queueLink() {
    return FlowRouter.path('queue', { courseId: this.course, queueId: this._id }, {});
  },
});

Template.queueCardContent.onRendered(function queueCardContentOnRendered() {
  $(this.findAll('.js-status-dropdown')).dropdown();
});

Template.queueCardContent.helpers({
  // Basic Helpers
  course() {
    return Courses.findOne({ name: this.course });
  },

  locationName() {
    return Locations.findOne({ _id: this.location }).name;
  },

  activeTicketCountText() {
    const count = _activeTickets(this.tickets).length;
    return (count === 1) ?
      `${count} student in line` :
      `${count} students in line`;
  },

  waitTimeInMinutes() {
    return _timeInMinutes(this.averageWaitTime);
  },

  // End Time
  showEndTime() {
    return (this.endTime && this.status !== 'ended');
  },

  readableEndTime() {
    return _formatTime(this.endTime, 'h:mm A');
  },

  // Status
  readableStatus() {
    const statuses = {
      active: 'Active',
      cutoff: 'Cutoff',
      ended: `Ended at ${_formatTime(this.endTime, 'h:mm A on MMMM DD')}`,
    };

    return statuses[this.status];
  },

  statusColor() {
    const colors = {
      active: 'blue',
      cutoff: 'yellow',
      ended: 'red',
    };

    return colors[this.status];
  },

  showActions() {
    return (authorized.ta(Meteor.userId, this.course) && this.status !== 'ended');
  },

  isActive() {
    return this.status === 'active';
  },
});

Template.queueCardContent.events({
  'click .js-edit-queue': (event) => {
    event.preventDefault();
    _showModal('.js-edit-queue-modal');
  },

  'click .js-activate': (event) => {
    event.preventDefault();
    Meteor.call('activateQueue', this._id, (err) => {
      if (err) console.log(err);
    });
  },

  'click .js-cutoff'(event) {
    event.preventDefault();
    Meteor.call('cutoffQueue', this._id, (err) => {
      if (err) console.log(err);
    });
  },

  'click .js-end-now': (event) => {
    event.preventDefault();
    const ok = confirm('Are you sure you want to end this queue?');
    if (ok) {
      Meteor.call('endQueue', this._id, (err) => {
        if (err) console.log(err);
      });
    }
  },
});
