import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import layouts
// import '/imports/ui/layouts/baseLayout';
import '/imports/ui/layouts/app-body/app-body.js';

// Import pages
import '/imports/ui/pages/index/index.js';
import '/imports/ui/pages/login-password/login-password.js';
import '/imports/ui/pages/queue/queue.js';

// BlazeLayout normally renders layouts into a new div.
// This setting makes it render directly into body.
BlazeLayout.setRoot('body');

// Authentication

FlowRouter.route('/login-password', {
  name: 'login-password',
  action() {
    BlazeLayout.render('AppBody', { content: 'LoginPassword' });
  },
});

// Pages

FlowRouter.route('/:queueId/:queueTag', {
  name: 'queue',
  action() {
    BlazeLayout.render('AppBody', { content: 'Queue' });
  },
});

FlowRouter.route('/', {
  name: 'index',
  action() {
    BlazeLayout.render('AppBody', { content: 'Index' });
  },
});

// // Errors
//
// FlowRouter.notFound = {
//   action() {
//     BlazeLayout.render('baseLayout', { content: '404' });
//   },
// };
