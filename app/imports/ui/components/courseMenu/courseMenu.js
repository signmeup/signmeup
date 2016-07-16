import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { _showModal } from '/imports/lib/client/helpers';

import './courseMenu.html';

function setCourse(name) {
  // Make menu item active
  $('.courseMenu .item').removeClass('active');
  $(`.courseMenu .item[data-course='${name}']`).addClass('active');

  // Make course settings active
  $('.courseSettings').removeClass('active');
  $(`.courseSettings[data-course='${name}']`).addClass('active');
}

Template.courseMenu.onRendered(() => {
  const firstCourse = Template.currentData().courses.fetch()[0].name;
  setCourse(firstCourse);
});

Template.courseMenu.events({
  'click .item:not(.header)': (event) => {
    setCourse(event.target.dataset.course);
  },

  'click .js-add-course': () => {
    _showModal('.js-create-course-modal');
  },
});
