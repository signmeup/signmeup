// courseSettings

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { saveAs } from 'meteor/pfafman:filesaver';
import { $ } from 'meteor/jquery';

import Queues from '/imports/api/queues/queues';
import Tickets from '/imports/api/tickets/tickets';

import { authorized } from '/imports/lib/both/auth';
import { _getUserFromEmail } from '/imports/lib/both/users';

import './courseSettings.html';

Template.courseSettings.onRendered(() => {
  // Active State
  const activeCheckbox = this.$('.js-active-checkbox').checkbox();
  activeCheckbox.checkbox(`set ${Template.currentData().active ? 'checked' : 'unchecked'}`);
});

Template.courseSettings.events({
  'change .ui.checkbox': (event) => {
    const checked = event.target.checked;
    const active = this.active;

    if (active !== checked) {
      Meteor.call('updateCourse', this.name, { active: checked });
    }
  },

  'submit .js-ta-input': (event) => {
    const email = $(event.target).find('input[type=email]').val();
    const user = _getUserFromEmail(email);

    if (user && authorized.ta(user._id, this.name)) {
      // TODO: Show proper error message.
      console.log('Already a TA!');
      return false;
    }

    Meteor.call('addTA', this.name, email, (err) => {
      if (err) console.log(err);
    });

    return false;
  },

  'click .js-delete-course': () => {
    const sure = confirm(`Are you sure you want to delete ${this.name}?\nTHIS IS IRREVERSIBLE.`);
    if (sure) {
      Meteor.call('deleteCourse', this.name, (err) => {
        if (err) console.log(err);
      });
    }
  },
});

Template.courseSettingsTAs.helpers({
  tasExist() {
    const htas = this.htas ? this.htas.length : 0;
    const tas = this.tas ? this.tas.length : 0;
    return htas + tas > 0;
  },
});

// taItem

Template.taItem.onRendered(() => {
  $(this.findAll('.js-ta-dropdown')).dropdown();
});

Template.taItem.events({
  'click .js-change-role': () => {
    const methodName = this.hta ? 'switchToTA' : 'switchToHTA';
    Meteor.call(methodName, this.course, this.userId, (err) => {
      if (err) console.log(err);
    });
  },

  'click .js-delete': () => {
    Meteor.call('deleteTA', this.course, this.userId, (err) => {
      if (err) console.log(err);
    });
  },
});

// courseSettingsLogs

Template.courseSettingsLogs.onRendered(() => {
  const startTime = moment().subtract(7, 'days').startOf('day');
  const endTime = moment().startOf('day');

  this.$('.js-start-time-picker').datetimepicker({
    format: 'MM/DD/YYYY',
    defaultDate: startTime,
    maxDate: endTime,
    viewMode: 'days',
  }).on('dp.change', (e) => {
    $('.js-end-time-picker').data('DateTimePicker').minDate(e.date);
  });

  this.$('.js-end-time-picker').datetimepicker({
    format: 'MM/DD/YYYY',
    useCurrent: false, // See issue #1075
    defaultDate: endTime,
    minDate: startTime,
    maxDate: endTime,
    viewMode: 'days',
  }).on('dp.change', (e) => {
    $('.js-start-time-picker').data('DateTimePicker').maxDate(e.date);
  });
});

function downloadLogFile(contents, course, startMoment, endMoment, type) {
  const blob = new Blob([contents], { type: 'application/json;charset=utf-8' });
  const startString = startMoment.format('YYYY-MM-DD');
  const endString = endMoment.format('YYYY-MM-DD');

  saveAs(blob, `${course}-${startString}-to-${endString}-${type}.json`);
}

Template.courseSettingsLogs.events({
  'submit .js-logs-form': (event) => {
    event.preventDefault();

    const course = this.name;
    const type = event.target.type.value;

    const startMoment = $(event.target.startTime).data('DateTimePicker').date();
    const startTime = startMoment.valueOf();
    const endMoment = $(event.target.endTime).data('DateTimePicker').date().endOf('day');
    const endTime = endMoment.valueOf();

    if (type === 'queues') {
      Meteor.subscribe('allQueuesInRange', course, startTime, endTime, () => {
        const queues = Queues.find({
          course,
          startTime: { $gte: startTime, $lte: endTime },
        }).fetch();
        const jsonString = JSON.stringify(queues, null, 2);
        downloadLogFile(jsonString, course, startMoment, endMoment, 'queues');
      });
    } else if (type === 'tickets') {
      Meteor.subscribe('allTicketsInRange', course, startTime, endTime, () => {
        const tickets = Tickets.find({
          course,
          createdAt: { $gte: startTime, $lte: endTime },
        }, {
          fields: {
            'notify.email': false,
            'notify.phone': false,
            'notify.carrier': false,
          },
        }).fetch();
        const jsonString = JSON.stringify(tickets, null, 2);
        downloadLogFile(jsonString, course, startMoment, endMoment, 'tickets');
      });
    }

    return false;
  },
});

// courseSettingsSettings

Template.courseSettingsSettings.helpers({
  isCurrentGap(minutes) {
    const signupGap = this.settings ? (this.settings.signupGap || 0) : 0;
    const signupGapMinutes = parseInt(signupGap / (60 * 1000)) || 0;
    return (minutes === signupGapMinutes) ? 'selected' : '';
  },
});

Template.courseSettingsSettings.events({
  'change .js-signup-gap-select': () => {
    const ms = event.target.value * 60 * 1000;
    Meteor.call('updateCourseSettings', this.name, { signupGap: ms });
  },
});
