import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveArray } from 'meteor/manuel:reactivearray';
import { $ } from 'meteor/jquery';

import { createTicket } from '/imports/api/tickets/methods.js';

import { carriers } from '/imports/lib/both/carriers.js';
import { RestrictedSessions } from '/imports/lib/client/restricted-sessions.js';

import './modal-join-queue.html';

Template.ModalJoinQueue.onCreated(function onCreated() {
  this.studentEmails = new ReactiveArray([]);
  this.addStudentEmail = (email, callback) => {
    // TODO: make sure email is valid, and unique
    this.studentEmails.push(email);
    callback();
  };

  this.autorun(() => {
    this.subscribe('users.all');
  });
});

Template.ModalJoinQueue.onRendered(function onRendered() {
  if (Meteor.user() && this.studentEmails.array().length === 0) {
    this.studentEmails.push(Meteor.user().emailAddress());
  }

  $('.modal-join-queue').on('shown.bs.modal', () => {
    if (this.studentEmails.array().length > 0) {
      $('textarea[name=question]').focus();
    } else {
      $('input[name=student]').focus();
    }
  });

  $('input[name=number]').mask('(000) 000-0000');
});

Template.ModalJoinQueue.helpers({
  showStudents() {
    return Template.instance().studentEmails.array().length > 0;
  },

  students() {
    const emails = Template.instance().studentEmails.array();
    const students = emails.map((email) => {
      const student = Meteor.users.findOne({
        $or: [
          { email: email }, // eslint-disable-line object-shorthand
          { 'emails.address': email },
        ],
      });

      if (student) return student;
      return {
        emailAddress: email,
        fullName: email.split('@')[0],
      };
    });

    return students;
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

  carriers() {
    return ['AT&T', 'Sprint', 'T-Mobile', 'Verizon'].map((carrierName) => {
      return {
        name: carrierName,
        domain: carriers[carrierName],
      };
    });
  },
});

Template.ModalJoinQueue.events({
  'keypress .js-email-input'(event) {
    if (event.which === 13) {
      event.preventDefault();
      const email = event.target.value;

      Template.instance().addStudentEmail(email, () => {
        $('.js-email-input').val('');
      });
    }
  },

  'blur .js-email-input'(event) {
    const email = event.target.value;
    if (email.length > 0) {
      Template.instance().addStudentEmail(email, () => {
        $('.js-email-input').val('');
      });
    }
  },

  'click .js-add-email'() {
    const email = $('.js-add-email').val();
    if (email.length > 0) {
      Template.instance().addStudentEmail(email, () => {
        $('.js-email-input').val('').focus();
      });
    }
  },

  'click .js-remove-student'(event) {
    const email = $(event.target).closest('.student-item').data('email');
    Template.instance().studentEmails.remove(email);
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

    if (this.queue.isRestricted() && RestrictedSessions.isRestrictedToDevice(this.queue)) {
      data = Object.assign(data, RestrictedSessions.getCurrentSession(this.queue));
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
