/**
 * Tickets
 *
 * Ticket: {
 *    createdAt: Number (Milliseconds),
 *    queueId: STRING,
 *    course: STRING,
 *    owner: {
 *      id: userId,
 *      name: STRING,
 *    },
 *    status: ("open", "missing", "done", "expired", "cancelled")
 *
 *    question: STRING,
 *      
 *    notify: {
 *      types: ["announce", "email", "text"],
 *      email: STRING,
 *      phone: STRING
 *    },
 *
 *    ta: {
 *      id: userId,
 *      email: STRING,
 *      time: Number (Milliseconds)
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
