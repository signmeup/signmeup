// TODO: Block access to non-admins.

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Courses from '/imports/api/courses/courses';

import { authorized } from '/imports/lib/both/auth';

import './admin.html';

Template.admin.onCreated(() => {
  const self = this;
  self.autorun(() => {
    self.subscribe('courses');
    self.subscribe('locations');
    self.subscribe('queues');
    self.subscribe('allUsers');
  });
});

Template.admin.helpers({
  showAdmin() {
    return (authorized.admin(Meteor.userId) || authorized.hta(Meteor.userId));
  },

  courses() {
    return Courses.find({});
  },
});
