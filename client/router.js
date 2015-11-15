/**
 * BlazeLayout renders layouts into a new div.
 * This setting makes it render directly into body.
 */
BlazeLayout.setRoot('body');

FlowRouter.route("/", {
  name: "index",
  action: function() {
    BlazeLayout.render("baseLayout", {content: "index"});
  }
});

FlowRouter.route("/course/:courseId", {
  name: "course",
  action: function(params, queryParams) {
    BlazeLayout.render("baseLayout", {content: "course"});
  }
});

FlowRouter.route("/ta", {
  name: "ta",
  action: function() {
    BlazeLayout.render("baseLayout", {content: "ta"});
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