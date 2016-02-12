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
