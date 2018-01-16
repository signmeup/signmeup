import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';

// Configure Google login
ServiceConfiguration.configurations.upsert({
  service: 'google',
}, {
  $set: {
    clientId: Meteor.settings.google.clientId,
    secret: Meteor.settings.google.secret,
    loginStyle: 'popup',
  },
});

// Merge users with same email on login
Accounts.onCreateUser((options, newUser) => {
  let service;
  let email;
  let verified = false;

  // Get service (if user is being created server-side, service will be undefined)
  if (newUser.services) {
    service = Object.keys(newUser.services)[0];
  }

  // Get email
  if (service === 'google') {
    email = newUser.services.google.email;
    verified = true;
  } else {
    email = newUser.emails[0].address;
  }
  if (!email) {
    // User doesn't have email?! This should not happen.
    throw new Error('Cannot create user without email.');
  }

  // Check if user exists with same email...
  const existingUser = Accounts.findUserByEmail(email);
  if (!existingUser) {
    // If no existing user, return the new user
    if (!newUser.emails) {
      // If new user does not have 'emails' field (as in the case of Google
      // login), add the field and set verified.
      newUser.emails = [{ address: email, verified }];
    }

    // Set any additional fields
    if (options.preferredName) newUser.preferredName = options.preferredName;

    return newUser;
  }

  // If user exists, merge the accounts, maintaining original ID

  // 1. Initialize `services` object for existing user
  existingUser.services = Object.assign({
    resume: { loginTokens: [] },
  }, existingUser.services);

  if (newUser.services) {
    // 2. Merge new service
    existingUser.services[service] = newUser.services[service];

    // 3. Merge login tokens
    if (newUser.services.resume && newUser.services.resume.loginTokens) {
      existingUser.services.resume.loginTokens =
        existingUser.services.resume.loginTokens.concat(newUser.services.resume.loginTokens);
    }
  }

  // Set any additional fields
  if (options.preferredName) existingUser.preferredName = options.preferredName;

  // Delete existing user
  Meteor.users.remove({ _id: existingUser._id });

  // Return merged user to be reinserted into the database
  return existingUser;
});
