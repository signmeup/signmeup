// Config packages

import { AccountsTemplates } from 'meteor/useraccounts:core'; // eslint-disable-line import/no-unresolved, max-len
import { Accounts } from 'meteor/accounts-base';

AccountsTemplates.configure({
  enablePasswordChange: true,
  forbidClientAccountCreation: true,
});

Accounts.config({
  restrictCreationByEmailDomain: (email) => {
    const domain = email.slice(email.lastIndexOf('@') + 1);
    const allowed = ['brown.edu', 'cs.brown.edu', 'signmeup.cs.brown.edu'];
    return allowed.includes(domain);
  },
});
