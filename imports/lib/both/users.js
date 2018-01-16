import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

export function findUserByEmail(email) {
  if (Meteor.isServer) return Accounts.findUserByEmail(email);

  return Meteor.users.findOne({ 'emails.address': email });
}

export function createUser(options) {
  let userId;
  const email = options.email.toLowerCase();

  // If user with email exists, return
  const user = findUserByEmail(email);
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

  return userId;
}
