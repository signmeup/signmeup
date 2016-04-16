Courses = new Mongo.Collection("courses");

Courses.schema = new SimpleSchema({
  name: {type: String},
  description: {type: String, optional: true},
  listserv: {type: String, regEx: SimpleSchema.RegEx.Email, optional: true},
  active: {type: Boolean},

  htas: {type: [String], regEx: SimpleSchema.RegEx.Id, optional: true},
  tas: {type: [String], regEx: SimpleSchema.RegEx.Id, optional: true},

  createdAt: {type: Number}
});

Courses.attachSchema(Courses.schema);

Courses.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Courses.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
