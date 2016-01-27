/**
 * Users
 */

Meteor.users.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Meteor.users.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
