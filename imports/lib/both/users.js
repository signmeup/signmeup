import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

export function findUserByEmail(email) {
  if (Meteor.isServer) return Accounts.findUserByEmail(email);

  return Meteor.users.findOne({ 'emails.address': email });
}

export function createUser(options) {
  let userId = null;
  options.email = options.email.toLowerCase(); // eslint-disable-line no-param-reassign

  // If user with email exists, return
  const user = findUserByEmail(options.email);
  if (user) return user._id;

  // Else, create user...
  if (options.google) {
    userId = Accounts.createUser({
      email: options.email,
      profile: {},
    });
  } else {
    userId = Accounts.createUser({
      email: options.email,
      password: options.password,
      preferredName: options.preferredName,
      profile: {},
    });
  }

  // Add roles to new user
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
