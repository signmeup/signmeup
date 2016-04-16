Queues = new Mongo.Collection("queues");

Queues.schema = new SimpleSchema({
  name: {type: String},
  course: {type: String},
  location: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
  status: {type: String, allowedValues: ["active", "cutoff", "ended"]},

  owner: {type: Object},
  "owner.id": {type: String, regEx: SimpleSchema.RegEx.Id},
  "owner.email": {type: String, regEx: SimpleSchema.RegEx.Email},

  announcements: {type: [String], regEx: SimpleSchema.RegEx.Id, optional: true},
  tickets: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: []},

  startTime: {type: Number},
  cutoffTime: {type: Number, optional: true},
  endTime: {type: Number, optional: true},
  averageWaitTime: {type: Number, defaultValue: 0}
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
