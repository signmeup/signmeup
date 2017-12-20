// Config packages

import { AccountsTemplates } from 'meteor/useraccounts:core'; // eslint-disable-line import/no-unresolved, max-len
import { Accounts } from 'meteor/accounts-base';

AccountsTemplates.configure({
  enablePasswordChange: true,
  forbidClientAccountCreation: true,
});

Accounts.config({
    restrictCreationByEmailDomain: 'brown.edu'
});
