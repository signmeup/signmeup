FlowRouter.route("/", {
  name: "index",
  action: function(params, queryParams) {
    console.log("Rendering index.html");

  }
});