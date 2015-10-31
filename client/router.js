FlowRouter.route("/", {
  name: "index",
  action: function() {
    BlazeLayout.render("baseLayout", {content: "index"});
  }
});

FlowRouter.route("/ta", {
  name: "ta",
  action: function() {
    BlazeLayout.render("baseLayout", {content: "ta"});
  }
});