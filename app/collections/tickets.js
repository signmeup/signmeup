/**
 * Tickets
 *
 * Ticket: {
 *    queueId: STRING,
 *    course: STRING,
 *    owner: {
 *      id: userId,
 *      name: STRING,
 *    },
 *    status: ("open", "missing", "done", "cancelled"),
 *
 *    createdAt: Number (Milliseconds),
 *    missedAt: Number (Milliseconds),
 *    doneAt: Number (Milliseconds),
 *    cancelledAt: Number (Milliseconds),
 *
 *    question: STRING,
 *
 *    notify: {
 *      types: ["announce", "email", "text"],
 *      email: STRING,
 *      phone: STRING,
 *      carrier: STRING
 *    },
 *
 *    ta: {
 *      id: userId, // The TA who set the last status
 *      email: STRING
 *    }
 *
 *    flag: {
 *      flagged: Boolean,
 *      message: STRING,
 *      ta: {
 *        id: userId,
 *        email: STRING
 *      }
 *    }
 *  }
 */

Tickets = new Mongo.Collection("tickets");

Tickets.schema = new SimpleSchema({
  course: {
    type: Object
  },
  "course.id": {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  "course.name": {
    type: String
  },

  queueId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },

  status: {
    type: String,
    allowedValues: ["open", "missing", "done", "cancelled"]
  },

  question: {
    type: String
  },

  notify: {
    type: Object,
    optional: true
  },
  "notify.types": {
    type: [String],
    allowedValues: ["announce", "email", "text"],
    minLength: 1
  },
  "notify.email": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  "notify.phone": {
    type: String,
    optional: true
  },
  "notify.carrier": {
    type: String,
    regEx: SimpleSchema.RegEx.Domain,
    optional: true
  },

  createTime: {
    type: Date
  },
  markedAsMissingTime: {
    type: Date,
    optional: true
  },
  markedAsDoneTime: {
    type: Date,
    optional: true
  },
  cancelTime: {
    type: Date,
    optional: true
  }
});

Tickets.attachSchema(Tickets.schema);

Tickets.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Tickets.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
