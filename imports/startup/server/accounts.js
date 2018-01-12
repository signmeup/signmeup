import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';

ServiceConfiguration.configurations.upsert({
  service: 'google',
}, {
  $set: {
    clientId: Meteor.settings.google.clientId,
    secret: Meteor.settings.google.secret,
    loginStyle: 'popup',
  },
});

// Allow custom fields to be set on user creation
Accounts.onCreateUser((options, user) => {
  const newUser = _.extend({}, user);
  newUser.preferredName = options.preferredName;
  return newUser;
});

// When new Google users are created copy their emails and migrate their roles
Meteor.users.after.insert((inserter, user) => {
  if (user.services && user.services.google) {
    const newId = user._id;
    const email = user.services.google.email;

    const oldUser = Accounts.findUserByEmail(email);
    if (oldUser) {
      const oldId = oldUser._id;

      // copy global roles
      const globalRoles = Roles.getRolesForUser(oldId, Roles.GLOBAL_GROUP);
      Roles.addUsersToRoles(newId, globalRoles, Roles.GLOBAL_GROUP);

      // copy per-group roles
      _.each(Roles.getGroupsForUser(oldId), (group) => {
        const roles = Roles.getRolesForUser(oldId, group);
        Roles.addUsersToRoles(newId, roles, group);
      });

      Meteor.users.remove({ _id: oldId });
    }

    Accounts.addEmail(newId, email, true);
  }
});
