import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './modal-join-queue.html';

Template.ModalJoinQueue.onCreated(function onCreated() {
  this.studentIds = new ReactiveVar([]);
  if (Meteor.user()) {
    this.studentIds.set(this.studentIds.get().concat(Meteor.userId()));
  }
});

Template.ModalJoinQueue.helpers({
  showStudents() {
    return Template.instance().studentIds.get().length > 0;
  },

  students() {
    return Meteor.users.find({
      _id: { $in: Template.instance().studentIds.get() },
    });
  },
});

Template.ModalJoinQueue.events({
  'click .js-text-checkbox'() {
  },
});
