import { Meteor } from "meteor/meteor";

// Note: we don't specify a schema for users because that would force us to
// account for every possible field. This is dangerous and hard to maintain
// as we add more packages or as Meteor changes. Best to stay away for now.

Meteor.users.publicFields = {
  "emails.address": true,
  preferredName: true,
  "services.google": true,
  "services.saml": true,
  roles: true
};

Meteor.users.allow({
  insert() {
    return false;
  },
  update() {
    return false;
  },
  remove() {
    return false;
  }
});

Meteor.users.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  }
});
