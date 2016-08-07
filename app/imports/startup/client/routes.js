import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import layouts
import '/imports/ui/layouts/baseLayout.js';

// Import pages
import '/imports/ui/pages/404/404.js';
import '/imports/ui/pages/admin/admin.js';
import '/imports/ui/pages/index/index.js';
import '/imports/ui/pages/queue/queue.js';

// BlazeLayout normally renders layouts into a new div.
// This setting makes it render directly into body.
BlazeLayout.setRoot('body');

// Authentication

FlowRouter.route('/login-password', {
  name: 'loginPassword',
  action() {
    BlazeLayout.render('baseLayout', { content: 'loginPassword' });
  },
});

// Pages

FlowRouter.route('/', {
  name: 'index',
  action() {
    BlazeLayout.render('baseLayout', { content: 'index' });
  },
});

FlowRouter.route('/:courseId/:queueId', {
  name: 'queue',
  action() {
    BlazeLayout.render('baseLayout', { content: 'queue' });
  },
});

FlowRouter.route('/admin', {
  name: 'admin',
  action() {
    BlazeLayout.render('baseLayout', { content: 'admin' });
  },
});

FlowRouter.route('/hta', {
  name: 'hta',
  action() {
    BlazeLayout.render('baseLayout', { content: 'admin' });
  },
});

// Errors

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('baseLayout', { content: '404' });
  },
};
