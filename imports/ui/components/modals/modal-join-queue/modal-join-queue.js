import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveArray } from 'meteor/manuel:reactivearray';
import { ReactiveDict } from 'meteor/reactive-dict';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';

import { createTicket } from '/imports/api/tickets/methods';

import { carriers } from '/imports/lib/both/carriers';
import { RestrictedSessions } from '/imports/lib/client/restricted-sessions';

import './modal-join-queue.html';

Template.ModalJoinQueue.onCreated(function onCreated() {
  this.errors = new ReactiveDict();

  this.studentEmails = new ReactiveArray([]);
  this.addStudentEmail = (email, callback) => {
    email = email.toLowerCase(); // eslint-disable-line no-param-reassign
    try {
      new SimpleSchema({
        email: {
          type: String,
          regEx: SimpleSchema.RegEx.Email,
        },
      }).validate({ email });
    } catch (err) {
      this.errors.set('student', 'Please enter a valid email address.');
      return;
    }

    if (_.contains(this.studentEmails, email)) {
      this.errors.set('student', 'Email address already added.');
      return;
    }

    if (!(email.endsWith('@brown.edu') || email.endsWith('@signmeup.cs.brown.edu'))) {
      this.errors.set('student', 'Email must end with @brown.edu.');
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
    this.subscribe('users.byEmails', this.studentEmails.array());
  });
});

Template.ModalJoinQueue.onRendered(function onRendered() {
  const templateInstance = this;
  $('.modal-join-queue').on('shown.bs.modal', () => {
    if (Meteor.user() && templateInstance.studentEmails.array().length === 0) {
      templateInstance.studentEmails.push(Meteor.user().emailAddress());
    }

    if (templateInstance.studentEmails.array().length > 0) {
      $('textarea[name=question]').focus();
    } else {
      $('input[name=student]').focus();
    }
  });

  $('.modal-join-queue').on('hidden.bs.modal', () => {
    $('#js-modal-join-queue-form')[0].reset();

    templateInstance.errors.clear();
    templateInstance.studentEmails.clear();
    templateInstance.showNotifications.clear();
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

      return student || {
        emailAddress: () => { return email; },
        fullName: () => { return email.split('@')[0]; },
      };
    });

    return students;
  },

  currentStudent(student) {
    return Meteor.user() && (Meteor.user().emailAddress() === student.emailAddress());
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
    Template.instance().errors.delete('student');
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
    Template.instance().errors.delete('question');
  },

  'change .js-email-checkbox'(event) {
    Template.instance().showNotifications.set('email', event.target.checked);
  },

  'change .js-text-checkbox'(event) {
    Template.instance().showNotifications.set('text', event.target.checked);
  },

  'input .js-email'() {
    Template.instance().errors.delete('email');
  },

  'change .js-carrier'() {
    Template.instance().errors.delete('carrier');
  },

  'input .js-number'() {
    Template.instance().errors.delete('number');
  },

  'submit #js-modal-join-queue-form'(event, templateInstance) {
    event.preventDefault();
    let errors = false;

    let data = {
      queueId: this.queue._id,
      notifications: {},
    };

    const studentEmails = Template.instance().studentEmails.array();
    if (studentEmails.length === 0) {
      Template.instance().errors.set('student', 'Please enter your email address.');
      errors = true;
    } else {
      data.studentEmails = studentEmails;
    }

    const question = event.target.question.value;
    if (!$.trim(question)) {
      Template.instance().errors.set('question', 'Please enter a question.');
      errors = true;
    } else {
      data.question = question;
    }

    if (event.target.announceCheckbox.checked) {
      data.notifications.announce = true;
    }

    if (event.target.emailCheckbox.checked) {
      const email = event.target.email.value.toLowerCase();
      if (!email) {
        Template.instance().errors.set('email', 'Please enter a valid email.');
        errors = true;
      }

      data.notifications.email = email;
    }

    if (event.target.textCheckbox.checked) {
      const carrier = event.target.carrier.value;
      const number = event.target.number.value.replace(/\D+/g, '');

      if (!carrier) {
        Template.instance().errors.set('carrier', 'Please select a carrier.');
        errors = true;
      }

      if (!(number.length === 10)) {
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
          templateInstance.errors.set('server', err.reason);
        } else {
          templateInstance.errors.delete('server');
          $('.modal-join-queue').modal('hide');
        }
      });
    }
  },
});
