import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

export function createUser(options) {
  let userId = null;
  options.email = options.email.toLowerCase(); // eslint-disable-line no-param-reassign

  const user = findUserByEmail(options.email);
  if (options.google) {
    userId = user ? user._id : Accounts.createUser({
      email: options.email,
      profile: {},
    });
  } else {
    if (user) {
      return user._id;
    }

    userId = Accounts.createUser({
      email: options.email,
      password: options.password,
      preferredName: options.name || options.preferredName,
      profile: {},
    });
  }

  switch (options.type) {
    case 'admin':
      Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP);
      break;
    case 'mta':
      Roles.addUsersToRoles(userId, 'mta', Roles.GLOBAL_GROUP);
      break;
    case 'hta':
      Roles.addUsersToRoles(userId, 'hta', options.testCourseId);
      break;
    case 'ta':
      Roles.addUsersToRoles(userId, 'ta', options.testCourseId);
      break;
    default:
      break;
  }

  return userId;
}

export function findUserByEmail(email) {
  if (Meteor.isServer) {
    return Accounts.findUserByEmail(email);
  } else {
    return Meteor.users.findOne({ 'emails.address': email });
  }
}
