import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '/imports/ui/components/modals/modal-course-create/modal-course-create.js';

import './settings-courses.html';

Template.SettingsCourses.events({
  'change .js-select-course'(event) {
    const value = event.target.value;
    if (value === 'new-course') {
      $('.modal-course-create').modal();
    }
  },
});
