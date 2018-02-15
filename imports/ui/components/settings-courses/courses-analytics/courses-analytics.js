import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { $ } from "meteor/jquery";

import moment from 'moment';

import { LocalFiles } from '/imports/lib/client/local-files';

import "./courses-analytics.html";

Template.CoursesAnalytics.onCreated(function onCreated() {
  this.downloadUrl = new ReactiveVar('');
  this.fileName = new ReactiveVar('');
});

Template.CoursesAnalytics.onRendered(() => {
  $(".js-logs-datepicker").datepicker();
});

Template.CoursesAnalytics.helpers({
  isDownloadReady() {
    const dUrl = Template.instance().downloadUrl.get();
    return dUrl !== '' && dUrl !== 'Preparing';
  },

  isPreparing() {
    return Template.instance().downloadUrl.get() === 'Preparing';
  },

  downloadUrl() {
    return Template.instance().downloadUrl.get();
  },

  fileName() {
    return Template.instance().fileName.get() + '.csv';
  },
});

Template.CoursesAnalytics.events({
  'focus .js-logs-datepicker-start, focus .js-logs-datepicker-end'(event, templateInstance) {
    templateInstance.downloadUrl.set('');
  },

  'click .js-logs-prepare'(event, templateInstance) {
    event.preventDefault();

    templateInstance.downloadUrl.set('Preparing');

    const courseId = this.course._id;
    const type = $('#js-log-type').val();
    const startTime = $('.js-logs-datepicker-start').datepicker('getDate');
    const endTime = $('.js-logs-datepicker-end').datepicker('getDate');
    endTime.setHours(23, 59, 59);

    Meteor.call(type + '.inRange', {
      courseId,
      startTime,
      endTime,
    }, (err, result) => {
      if (err) {
        console.log('err', err);
        return;
      }

      const start = moment(startTime).format('YYYY-MM-DD');
      const end = moment(endTime).format('YYYY-MM-DD');
      templateInstance.fileName.set([this.course.name, type, start, end].join('_'));
      templateInstance.downloadUrl.set(LocalFiles.getURL(result));
    });
  },
});
