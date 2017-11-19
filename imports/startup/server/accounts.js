import { ServiceConfiguration } from 'meteor/service-configuration';

ServiceConfiguration.configurations.upsert({
  service: 'google'
}, {
  $set: {
    clientId: Meteor.settings.google.clientId,
    secret: Meteor.settings.google.secret,
    loginStyle: 'popup'
  }
});
