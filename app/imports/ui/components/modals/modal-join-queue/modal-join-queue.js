import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveArray } from 'meteor/manuel:reactivearray';
import { $ } from 'meteor/jquery';

import { createTicket } from '/imports/api/tickets/methods.js';
import { isRestrictedToDevice, getCurrentSession } from
  '/imports/ui/components/queue-alert-restricted-session/queue-alert-restricted-session.js';

import './modal-join-queue.html';

Template.ModalJoinQueue.onCreated(function onCreated() {
  this.studentEmails = new ReactiveArray([]);

  this.autorun(() => {
    if (Meteor.user() && this.studentEmails.array().length === 0) {
      this.studentEmails.push(Meteor.user().emailAddress());
    }
  });

  this.autorun(() => {
    this.subscribe('users.all');
  });
});

Template.ModalJoinQueue.onRendered(function onRendered() {
  $('.modal-join-queue').on('shown.bs.modal', () => {
    if (this.studentEmails.array().length > 0) {
      $('textarea[name=question]').focus();
    } else {
      $('input[name=student]').focus();
    }
  });
});

Template.ModalJoinQueue.helpers({
  showStudents() {
    return Template.instance().studentEmails.array().length > 0;
  },

  students() {
    const emails = Template.instance().studentEmails.array();
    return Meteor.users.find({
      $or: [
        { email: { $in: emails } },
        { 'emails.address': { $in: emails } },
      ],
    });
  },

  studentPlaceholder() {
    if (Template.instance().studentEmails.array().length > 0) {
      return 'another_student@brown.edu';
    }

    return 'email_address@brown.edu';
  },

  defaultEmail() {
    const emails = Template.instance().studentEmails.array();
    if (emails.length > 0) return emails[0];
    return '';
  },
});

Template.ModalJoinQueue.events({
  'keypress .js-email-input'(event) {
    if (event.which === 13) {
      event.preventDefault();
      const email = event.target.value;

      // TODO: make sure email is valid, and unique
      Template.instance().studentEmails.push(email);
      $('.js-email-input').val('');
    }
  },

  'click .js-email-checkbox'() {
    $('.js-notifications-email').toggleClass('hidden');
  },

  'click .js-text-checkbox'() {
    $('.js-notifications-text').toggleClass('hidden');
  },

  'submit #js-modal-join-queue-form'(event) {
    event.preventDefault();

    let data = {
      queueId: this.queue._id,
      studentEmails: Template.instance().studentEmails.array(),
      question: event.target.question.value,
      notifications: {},
    };

    if (event.target.announceCheckbox.checked) {
      data.notifications.announce = true;
    }

    if (event.target.emailCheckbox.checked) {
      data.notifications.email = event.target.email.value;
    }

    if (event.target.textCheckbox.checked) {
      data.notifications.phone = {};
      data.notifications.phone.carrier = event.target.carrier.value;
      data.notifications.phone.number = event.target.number.value;
    }

    if (this.queue.isRestricted() && isRestrictedToDevice(this.queue)) {
      data = Object.assign(data, getCurrentSession(this.queue));
    }

    createTicket.call(data, (err) => {
      if (err) {
        console.log(err);
      } else {
        $('.modal-join-queue').modal('hide');
      }
    });
  },
});
