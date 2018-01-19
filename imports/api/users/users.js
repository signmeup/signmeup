import { Meteor } from 'meteor/meteor';

// Note: we don't specify a schema for users because that would force us to
// account for every possible field. This is dangerous and hard to maintain
// as we add more packages or as Meteor changes. Best to stay away for now.

// Visible to everyone
Meteor.users.publicFields = {
  roles: true,
};

// Visible to everyone for TAs, visible to TAs for everyone
Meteor.users.protectedFields = Object.assign({}, Meteor.users.publicFields, {
  preferredName: true,
  'emails.address': true,
  'services.google.name': true,
  'services.google.given_name': true,
  'services.google.family_name': true,
});

// Only visible to oneself
Meteor.users.privateFields = Object.assign({}, Meteor.users.publicFields, {
  preferredName: true,
  'emails.address': true,
  'services.google': true,
});

Meteor.users.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; },
});

Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
