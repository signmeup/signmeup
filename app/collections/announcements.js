Announcements = new Mongo.Collection("announcements");

Announcements.schema = new SimpleSchema({
  owner: {type: Object},
  "owner.id": {type: String, regEx: SimpleSchema.RegEx.Id},
  "owner.email": {type: String, regEx: SimpleSchema.RegEx.Email},

  type: {type: String, allowedValues: ["info", "success", "warning", "danger"]},
  header: {type: String, optional: true},
  content: {type: String},

  createdAt: {type: Date}
});

Announcements.attachSchema(Announcements.schema);

Announcements.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Announcements.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
