import { FlowRouter } from "meteor/kadira:flow-router";
import { BlazeLayout } from "meteor/kadira:blaze-layout";

// Import layouts
import "/imports/ui/layouts/app-body/app-body";

// Import pages
import "/imports/ui/pages/index/index";
import "/imports/ui/pages/login-password/login-password";
import "/imports/ui/pages/queue/queue";
import "/imports/ui/pages/settings/settings";
import "/imports/ui/pages/404/404";
import "/imports/ui/pages/privacy/privacy";

// BlazeLayout normally renders layouts into a new div.
// This setting makes it render directly into body.
BlazeLayout.setRoot("body");

// Authentication

FlowRouter.route("/login", {
  name: "login",
  action() {
    BlazeLayout.render("AppBody", { content: "LoginPassword" });
  }
});

// Pages

FlowRouter.route("/queue/:queueId", {
  name: "queue",
  action() {
    BlazeLayout.render("AppBody", { content: "Queue" });
  }
});

FlowRouter.route("/settings", {
  name: "settings",
  action() {
    BlazeLayout.render("AppBody", { content: "Settings" });
  }
});

FlowRouter.route("/privacy", {
  name: "privacy",
  action() {
    BlazeLayout.render("AppBody", { content: "Privacy" });
  }
});

FlowRouter.route("/", {
  name: "index",
  action() {
    BlazeLayout.render("AppBody", { content: "Index" });
  }
});

// Errors

FlowRouter.notFound = {
  name: "404",
  action() {
    BlazeLayout.render("AppBody", { content: "404" });
  }
};
