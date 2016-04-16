Queues = new Mongo.Collection("queues");

Queues.schema = new SimpleSchema({
  name: {
    type: String
  },

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

  location: {
    type: Object,
    optional: true
  },
  "location.id": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  "location.name": {
    type: String,
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

  owner: {
    type: Object
  },
  "owner.id": {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  "owner.email": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
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
  },

  averageWaitTime: {
    type: Number,
    defaultValue: 0
  },

  startTime: {
    type: Date
  },
  cutoffTime: {
    type: Date,
    optional: true
  },
  scheduledEndTime: {
    type: Date,
    optional: true
  },
  endTime: {
    type: Date,
    optional: true
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
