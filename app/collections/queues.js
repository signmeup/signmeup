/**
 * Queues
 *
 * Queue: {
 *    name: STRING,
 *    course: STRING,
 *    location: ObjectId,
 *    mode: ("universal", "location", "device") // TODO: Expand this
 *
 *    status: STRING ("active", "cutoff", "ended"),
 *    owner: {
 *      id: userId,
 *      email: STRING
 *    },
 *    
 *    startTime: Number (Milliseconds),
 *    cutoffTime: Number (Milliseconds),
 *    endTime: Number (Milliseconds),
 *    averageWaitTime: Number (Milliseconds),
 *
 *    localSettings: {
 *      property: value (Overrides from Course)
 *    },
 *    
 *    announcements: [],
 *    tickets: []
 * }
 */

Queues = new Mongo.Collection("queues");

Queues.schema = new SimpleSchema({
  name: {
    type: String
  },
  course: {
    type: String
  },
  location: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  mode: {
    type: String,
    allowedValues: ["universal", "location", "device"]
  },

  status: {
    type: String,
    allowedValues: ["active", "cutoff", "ended"]
  },
  "owner.id": {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  "owner.email": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },

  startedAt: {
    type: Date
  },
  cutoffAt: {
    type: Date,
    optional: true
  },
  endedAt: {
    type: Date,
    optional: true
  },
  averageWaitTime: {
    type: Number,
    defaultValue: 0
  },

  announcements: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  tickets: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    defaultValue: []
  }
});

Queues.attachSchema(Queues.schema);

Queues.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Queues.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
