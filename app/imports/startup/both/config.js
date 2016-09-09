// Config packages

import { AccountsTemplates } from 'meteor/useraccounts:core'; // eslint-disable-line

AccountsTemplates.configure({
  enablePasswordChange: true,
  forbidClientAccountCreation: true,
});
