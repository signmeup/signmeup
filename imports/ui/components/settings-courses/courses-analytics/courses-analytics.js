import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './courses-analytics.html';

Template.CoursesAnalytics.onRendered(() => {
  $('.js-logs-datepicker').datepicker();
});
