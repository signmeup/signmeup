// Config packages

import { AccountsTemplates } from 'meteor/useraccounts:core'; // eslint-disable-line import/no-unresolved, max-len

AccountsTemplates.configure({
  enablePasswordChange: true,
  forbidClientAccountCreation: true,
});
