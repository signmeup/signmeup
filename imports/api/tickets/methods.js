import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Jobs } from "meteor/msavin:sjobs";
import { Roles } from "meteor/alanning:roles";
import { _ } from "meteor/underscore";

import moment from "moment";

import { Courses } from "/imports/api/courses/courses";
import { Queues } from "/imports/api/queues/queues";
import { Sessions } from "/imports/api/sessions/sessions";
import { Tickets, NotificationsSchema } from "/imports/api/tickets/tickets";

import { SignupGap } from "/imports/lib/both/signup-gap";
import { Notifications } from "/imports/lib/both/notifications";
import { createUser, findUserByEmail } from "/imports/lib/both/users";

if (Meteor.isServer) {
  Jobs.register({
    "tickets.missingTicketExpired": function deleteTicketViaJob(ticketId) {
      Tickets.update(
        {
          _id: ticketId
        },
        {
          $set: {
            status: "deleted",
            deletedAt: new Date(),
            deletedBy: this.userId
          },
          $unset: {
            missingJobId: ""
          }
        }
      );
      this.success();
    }
  });
}

export const createTicket = new ValidatedMethod({
  name: "tickets.createTicket",
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
    studentEmails: {
      type: [String],
      regEx: SimpleSchema.RegEx.Email,
      minCount: 1
    },
    question: { type: String, optional: true },
    notifications: { type: NotificationsSchema },
    sessionId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
    secret: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
    preferredName: { type: String, optional: true }
  }).validator(),
  run({
    queueId,
    studentEmails,
    question,
    notifications,
    sessionId,
    secret,
    preferredName
  }) {
    const queue = Queues.findOne(queueId);
    if (!queue) {
      throw new Meteor.Error(
        "queues.doesNotExist",
        `No queue exists with id ${queueId}`
      );
    }

    if (sessionId && !Sessions.findOne(sessionId)) {
      throw new Meteor.Error(
        "sessions.doesNotExist",
        `No session exists with id ${sessionId}`
      );
    }

    // Check: logged in user is included in studentEmails
    if (
      this.userId &&
      !_.contains(studentEmails, Meteor.user().emailAddress())
    ) {
      throw new Meteor.Error(
        "tickets.createTicket.currentUserMissing",
        "The current user must be one of the students in the ticket"
      );
    }

    // Gather student ids
    const studentIds = studentEmails.map(email => {
      email = email.toLowerCase(); // eslint-disable-line no-param-reassign

      // Check: all emails end with @brown.edu or @signmeup.cs.brown.edu
      if (
        !(
          email.endsWith("@brown.edu") ||
          email.endsWith("@signmeup.cs.brown.edu")
        )
      ) {
        throw new Meteor.Error(
          "tickets.createTicket.NonBrownEmail",
          `Email ${email} does not end with @brown.edu`
        );
      }

      const student = findUserByEmail(email);
      if (student) return student._id;
      return createUser({ email, google: true });
    });

    // Check: duplicate signups
    if (queue.hasActiveTicketWithUsers(studentIds)) {
      throw new Meteor.Error(
        "tickets.createTicket.duplicateSignup",
        "One or more users are already signed up for this queue."
      );
    }

    // Check: signup gap
    studentIds.forEach(studentId => {
      const studentName = Meteor.users.findOne(studentId).fullName();
      const nextSignupTime = SignupGap.nextSignupTime(queue, studentId);
      const timeRemaining = moment(nextSignupTime).diff(moment());

      if (timeRemaining > 0) {
        throw new Meteor.Error(
          "tickets.createTicket.signupGap",
          `${studentName} must wait for ${moment
            .duration(timeRemaining)
            .humanize()} before signing up again.`
        );
      }
    });

    // Check: restricted sessions
    if (Meteor.isServer && queue.isRestricted()) {
      const sessionMatchesQueue = _.contains(
        queue.settings.restrictedSessionIds,
        sessionId
      );
      if (!sessionMatchesQueue) {
        throw new Meteor.Error(
          "tickets.createTicket.invalidSession",
          `Cannot signup with invalid session ${sessionId}`
        );
      }

      const secretMatchesSession =
        secret && Sessions.findOne(sessionId).secret === secret;
      if (!secretMatchesSession) {
        throw new Meteor.Error(
          "tickets.createTicket.invalidSecret",
          `Cannot signup with invalid secret ${secret}`
        );
      }
    }

    if (!queue.isRestricted()) {
      // Update preferred information of primary student
      const primaryEmail = _.find(
        studentEmails,
        email => email === Meteor.user().emailAddress()
      );
      const primaryStudent = findUserByEmail(primaryEmail);
      Meteor.users.update(
        {
          _id: primaryStudent._id
        },
        {
          $set: {
            preferredName
          }
        }
      );
    }

    // Create ticket
    const ticketId = Tickets.insert({
      courseId: queue.courseId,
      queueId,

      studentIds,
      question,

      notifications,

      createdAt: new Date(),
      createdBy: this.userId || studentIds[0]
    });

    // Add ticket to queue
    Queues.update(
      {
        _id: queueId
      },
      {
        $push: {
          ticketIds: ticketId
        }
      }
    );
  }
});

export const claimTicket = new ValidatedMethod({
  name: "tickets.claimTicket",
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket || ticket.status === "deleted") {
      throw new Meteor.Error(
        "tickets.doesNotExist"`No ticket exists with id ${ticketId}`
      );
    }

    if (
      !Roles.userIsInRole(
        this.userId,
        ["admin", "mta", "hta", "ta"],
        ticket.courseId
      )
    ) {
      throw new Meteor.Error(
        "tickets.claimTicket.unauthorized",
        "Only TAs and above can claim tickets."
      );
    }

    if (Meteor.isServer && ticket.missingJobId) {
      Jobs.cancel(ticket.missingJobId);
    }

    Tickets.update(
      {
        _id: ticketId
      },
      {
        $set: {
          status: "claimed",
          claimedAt: new Date(),
          claimedBy: this.userId
        },
        $unset: {
          missingJobId: ""
        }
      }
    );
  }
});

export const releaseTicket = new ValidatedMethod({
  name: "tickets.releaseTicket",
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket || ticket.status === "deleted") {
      throw new Meteor.Error(
        "tickets.doesNotExist"`No ticket exists with id ${ticketId}`
      );
    }

    if (
      !Roles.userIsInRole(
        this.userId,
        ["admin", "mta", "hta", "ta"],
        ticket.courseId
      )
    ) {
      throw new Meteor.Error(
        "tickets.releaseTicket.unauthorized",
        "Only TAs and above can release tickets."
      );
    }

    if (Meteor.isServer && ticket.missingJobId) {
      Jobs.cancel(ticket.missingJobId);
    }

    Tickets.update(
      {
        _id: ticketId
      },
      {
        $set: {
          status: "open"
        },

        $unset: {
          claimedAt: "",
          claimedBy: "",
          missingJobId: ""
        }
      }
    );
  }
});

export const markTicketAsMissing = new ValidatedMethod({
  name: "tickets.markTicketAsMissing",
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket || ticket.status === "deleted") {
      throw new Meteor.Error(
        "tickets.doesNotExist"`No ticket exists with id ${ticketId}`
      );
    }

    if (
      !Roles.userIsInRole(
        this.userId,
        ["admin", "mta", "hta", "ta"],
        ticket.courseId
      )
    ) {
      throw new Meteor.Error(
        "tickets.markTicketAsMissing.unauthorized",
        "Only TAs and above can mark tickets as missing."
      );
    }

    if (Meteor.isServer) {
      const course = Courses.findOne(ticket.courseId);
      if (course.settings.missingWindow > 0) {
        const deletionDate = new Date(
          new Date().getTime() + course.settings.missingWindow * 60000
        );

        const job = Jobs.run("tickets.missingTicketExpired", ticketId, {
          date: deletionDate
        });

        Tickets.update({ _id: ticketId }, { $set: { missingJobId: job._id } });
      }
    }

    Tickets.update(
      {
        _id: ticketId
      },
      {
        $set: {
          status: "markedAsMissing",
          markedAsMissingAt: new Date(),
          markedAsMissingBy: this.userId
        },

        $unset: {
          claimedAt: "",
          claimedBy: ""
        }
      }
    );
  }
});

export const markTicketAsDone = new ValidatedMethod({
  name: "tickets.markTicketAsDone",
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket || ticket.status === "deleted") {
      throw new Meteor.Error(
        "tickets.doesNotExist"`No ticket exists with id ${ticketId}`
      );
    }

    if (
      !Roles.userIsInRole(
        this.userId,
        ["admin", "mta", "hta", "ta"],
        ticket.courseId
      )
    ) {
      throw new Meteor.Error(
        "tickets.markTicketAsDone.unauthorized",
        "Only TAs and above can mark tickets as done."
      );
    }

    if (Meteor.isServer && ticket.missingJobId) {
      Jobs.cancel(ticket.missingJobId);
    }

    Tickets.update(
      {
        _id: ticketId
      },
      {
        $set: {
          status: "markedAsDone",
          markedAsDoneAt: new Date(),
          markedAsDoneBy: this.userId
        },
        $unset: {
          missingJobId: ""
        }
      }
    );
  }
});

export const deleteTicket = new ValidatedMethod({
  name: "tickets.deleteTicket",
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket) {
      throw new Meteor.Error(
        "tickets.doesNotExist"`No ticket exists with id ${ticketId}`
      );
    }

    const taOrAbove = Roles.userIsInRole(
      this.userId,
      ["admin", "mta", "hta", "ta"],
      ticket.courseId
    );
    if (!(ticket.belongsToUser(this.userId) || taOrAbove)) {
      throw new Meteor.Error(
        "tickets.deleteTicket.unauthorized",
        "Only ticket owners or TAs and above can delete tickets."
      );
    }

    if (Meteor.isServer && ticket.missingJobId) {
      Jobs.cancel(ticket.missingJobId);
    }

    Tickets.update(
      {
        _id: ticketId
      },
      {
        $set: {
          status: "deleted",
          deletedAt: new Date(),
          deletedBy: this.userId
        },
        $unset: {
          missingJobId: ""
        }
      }
    );
  }
});

export const notifyTicketByEmail = new ValidatedMethod({
  name: "tickets.notifyTicketByEmail",
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket) {
      throw new Meteor.Error(
        "tickets.doesNotExist",
        `No ticket exists with id ${ticketId}`
      );
    }

    if (Meteor.isServer) {
      Notifications.sendEmailNotification(ticket);
    }
  }
});

export const notifyTicketByText = new ValidatedMethod({
  name: "tickets.notifyTicketByText",
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id }
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket) {
      throw new Meteor.Error(
        "tickets.doesNotExist",
        `No ticket exists with id ${ticketId}`
      );
    }

    if (Meteor.isServer) {
      Notifications.sendTextNotification(ticket);
    }
  }
});
