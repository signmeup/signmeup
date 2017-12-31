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

// When users login via Google migrate their roles
Accounts.onLogin((sess) => {
  const user = sess.user;
  if (user.services && user.services.google) {
    const oldUser = Meteor.users.findOne({
      'emails.address': user.services.google.email,
      'services.google': { $exists: false },
    });

    if (oldUser) {
      const oldId = oldUser._id;
      const newId = user._id;

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
  }
});
