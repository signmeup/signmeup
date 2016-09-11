import { Template } from 'meteor/templating';

import './courses-people.html';

Template.CoursesPeople.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('users.all');
  });
});
