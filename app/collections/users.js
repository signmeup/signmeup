// Note: we don't specify a schema for users because that would force us to
// account for every possible field. This is dangerous and hard to maintain
// as we add more packages or as Meteor changes. Best to stay away for now.

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
