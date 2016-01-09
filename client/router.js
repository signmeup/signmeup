/**
 * BlazeLayout normally renders layouts into a new div.
 * This setting makes it render directly into body.
 */
BlazeLayout.setRoot('body');

FlowRouter.route("/passwordLogin", {
  name: "passwordLogin",
  action: function() {
    BlazeLayout.render("baseLayout", {content: "passwordLogin"});
  }
});

FlowRouter.route("/", {
  name: "index",
  action: function() {
    BlazeLayout.render("baseLayout", {content: "index"});
  }
});

FlowRouter.route("/:courseId/:queueId", {
  name: "queue",
  action: function(params, queryParams) {
    BlazeLayout.render("baseLayout", {content: "queue"});
  }
});

FlowRouter.route("/admin", {
  name: "admin",
  action: function() {
    BlazeLayout.render("baseLayout", {content: "admin"});
  }
});

FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render("baseLayout", {content: "notFound"})
  }
};