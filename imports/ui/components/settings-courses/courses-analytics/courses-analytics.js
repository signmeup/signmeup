import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { $ } from "meteor/jquery";

import "./courses-analytics.html";

Template.CoursesAnalytics.onRendered(() => {
  $(".js-logs-datepicker").datepicker();

  const tabId = FlowRouter.getQueryParam("tab");
  if (tabId) {
    $('a[href="#' + tabId + '"]').tab("show");
  }
});
