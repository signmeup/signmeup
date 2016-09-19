import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveArray } from 'meteor/manuel:reactivearray';
import { ReactiveDict } from 'meteor/reactive-dict';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { $ } from 'meteor/jquery';

import { createTicket } from '/imports/api/tickets/methods.js';

import { carriers } from '/imports/lib/both/carriers.js';
import { RestrictedSessions } from '/imports/lib/client/restricted-sessions.js';

import './modal-join-queue.html';

Template.ModalJoinQueue.onCreated(function onCreated() {
  this.errors = new ReactiveDict();

  this.studentEmails = new ReactiveArray([]);
  this.addStudentEmail = (email, callback) => {
    try {
      new SimpleSchema({
        email: {
          type: String,
          regEx: SimpleSchema.RegEx.Email,
        },
      }).validate({ email });

      // TODO: make sure email is unique
      // TODO: make sure email ends with @brown.edu
    } catch (err) {
      this.errors.set('student', 'Please enter a valid email address.');
      return;
    }

    this.studentEmails.push(email);
    callback();
  };

  this.showNotifications = new ReactiveDict({
    email: false,
    text: false,
  });

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
  errors(target) {
    return Template.instance().errors.get(target);
  },

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

  showNotifications(type) {
    return Template.instance().showNotifications.get(type);
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
  'input .js-email-input'() {
    Template.instance().errors.set('student', null);
  },

  'keypress .js-email-input'(event) {
    if (event.which === 13) {
      event.preventDefault();
      const email = event.target.value;

      if (email.length > 0) {
        Template.instance().addStudentEmail(email, () => {
          $('.js-email-input').val('');
        });
      }
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

  'input .js-question'() {
    Template.instance().errors.set('question', null);
  },

  'click .js-email-checkbox'(event) {
    Template.instance().showNotifications.set('email', event.target.checked);
  },

  'click .js-text-checkbox'(event) {
    Template.instance().showNotifications.set('text', event.target.checked);
  },

  'input .js-email'() {
    Template.instance().errors.set('email', null);
  },

  'change .js-carrier'() {
    Template.instance().errors.set('carrier', null);
  },

  'input .js-number'() {
    Template.instance().errors.set('number', null);
  },

  'submit #js-modal-join-queue-form'(event, templateInstance) {
    event.preventDefault();
    let errors = false;

    let data = {
      queueId: this.queue._id,
      studentEmails: Template.instance().studentEmails.array(),
      notifications: {},
    };

    const question = event.target.question.value;
    if (!question) {
      Template.instance().errors.set('question', 'Please enter a question.');
      errors = true;
    } else {
      data.question = question;
    }

    if (event.target.announceCheckbox.checked) {
      data.notifications.announce = true;
    }

    if (event.target.emailCheckbox.checked) {
      const email = event.target.email.value;
      if (!email) {
        Template.instance().errors.set('email', 'Please enter a valid email.');
        errors = true;
      }

      data.notifications.email = email;
    }

    if (event.target.textCheckbox.checked) {
      const carrier = event.target.carrier.value;
      const number = event.target.number.value;

      if (!carrier) {
        Template.instance().errors.set('carrier', 'Please select a carrier.');
        errors = true;
      }

      if (!number) {
        Template.instance().errors.set('number', 'Please enter a valid phone number.');
        errors = true;
      }

      data.notifications.phone = {
        carrier,
        number,
      };
    }

    if (this.queue.isRestricted() && RestrictedSessions.isRestrictedToDevice(this.queue)) {
      data = Object.assign(data, RestrictedSessions.getCurrentSession(this.queue));
    }

    if (!errors) {
      createTicket.call(data, (err) => {
        if (err) {
          console.error(err);
          templateInstance.errors.set('server', err.reason);
        } else {
          templateInstance.errors.set('server', null);
          $('.modal-join-queue').modal('hide');
        }
      });
    }
  },
});
