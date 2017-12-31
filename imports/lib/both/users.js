import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

export function createUser(options) {
  let userId = null;
  options.email = options.email.toLowerCase(); // eslint-disable-line no-param-reassign

  if (options.google) {
    const user = Meteor.users.findOne({ 'emails.address': options.email });
    userId = user ? user._id : Meteor.users.insert({
      emails: [{
        address: options.email,
        verified: false,
      }],
      profile: {},
    });
  } else {
    const user = Meteor.users.findOne({ 'emails.address': options.email });
    if (user) {
      return user._id;
    }

    userId = Accounts.createUser({
      email: options.email,
      password: options.password,
      profile: { name: options.name },
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
  return Meteor.users.findOne({
    $or: [
      { email: email }, // eslint-disable-line object-shorthand
      { 'emails.address': email },
      { 'services.google.email': email },
    ],
  });
}
