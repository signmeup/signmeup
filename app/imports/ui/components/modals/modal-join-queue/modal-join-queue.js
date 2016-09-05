import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveArray } from 'meteor/manuel:reactivearray';

import './modal-join-queue.html';

Template.ModalJoinQueue.onCreated(function onCreated() {
  this.studentIds = new ReactiveArray([]);
  if (Meteor.user()) {
    this.studentIds.push(Meteor.userId());
  }
});

Template.ModalJoinQueue.helpers({
  showStudents() {
    return Template.instance().studentIds.array().length > 0;
  },

  students() {
    return Meteor.users.find({
      _id: { $in: Template.instance().studentIds.array() },
    });
  },
});

Template.ModalJoinQueue.events({
  'keypress .js-email-input'(event) {
    if (event.which === 13) {
      event.preventDefault();
      Template.instance().studentIds.push(event.target.value);
    }
  },

  'click .js-text-checkbox'() {
  },
});
