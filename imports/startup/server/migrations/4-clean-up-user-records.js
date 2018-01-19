import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

Migrations.add({
  version: 4,

  up() {
    // Password users:
    // - Delete 'email' if exists
    // - Move 'profile.name' to 'user.preferredName', empty profile
    Meteor.users.find({ 'services.password': { $exists: true } }).forEach((user) => {
      const set = { profile: {} };
      if (user.profile && user.profile.name) set.preferredName = user.profile.name;

      Meteor.users.update(user._id, {
        $unset: { email: true },
        $set: set,
      });
    });

    // Ghost SAML users:
    // - Move 'email' to 'emails', unverified
    // - Empty profile
    Meteor.users.find({
      email: { $exists: true },
      services: { $exists: false },
    }).forEach((user) => {
      Meteor.users.update(user._id, {
        $unset: { email: true },
        $set: {
          emails: [{ address: user.email, verified: false }],
          profile: {},
        },
      });
    });

    // Active SAML users:
    // - Move 'email' to 'emails', verified
    // - Move 'profile' to 'services.saml'
    Meteor.users.find({ email: { $exists: true }, services: { $exists: true } }).forEach((user) => {
      Meteor.users.update(user._id, {
        $unset: { email: true },
        $set: {
          emails: [{ address: user.email, verified: true }],
          profile: {},
          'services.saml': user.profile,
        },
      });
    });
  },

  down() {
    Meteor.users.find({ 'services.password': { $exists: true } }).forEach((user) => {
      const profile = {};
      if (user.preferredName) profile.name = user.preferredName;

      Meteor.users.update(user._id, {
        $unset: { preferredName: true },
        $set: { email: user.emails[0].address, profile: profile },
      });
    });

    Meteor.users.find({
      emails: { $exists: true },
      services: { $exists: false },
    }).forEach((user) => {
      Meteor.users.update(user._id, {
        $unset: { emails: true },
        $set: {
          email: user.emails[0].address,
        },
      });
    });

    Meteor.users.find({
      emails: { $exists: true },
      services: { $exists: true },
    }).forEach((user) => {
      Meteor.users.update(user._id, {
        $unset: { emails: true, 'services.saml': true },
        $set: {
          email: user.emails[0].address,
          profile: user.services.saml,
        },
      });
    });
  },
});
