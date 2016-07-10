import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

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
