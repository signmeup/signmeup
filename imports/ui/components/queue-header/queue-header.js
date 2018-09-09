import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";

import "/imports/ui/components/profile-pic/profile-pic";

import "./queue-header.html";

Template.QueueHeader.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe("courses.byId", Template.currentData().queue.courseId);
    this.subscribe("locations.byId", Template.currentData().queue.locationId);
    this.subscribe(
      "users.onlineStaffByCourseId",
      Template.currentData().queue.courseId
    );
  });
});

Template.QueueHeader.helpers({
  onlineStaff(queue) {
    const staff = queue
      .course()
      .staff()
      .fetch();
    const onlineStaff = Meteor.users.find({
      _id: {
        $in: staff.map(user => {
          return user._id;
        })
      },
      "status.online": true
    });

    const online = [];
    const idle = [];
    onlineStaff.forEach(user => {
      if (user.status.idle) {
        idle.push(user);
      } else {
        online.push(user);
      }
    });

    return online.concat(idle);
  }
});

Template.QueueHeader.events({
  "click .js-show-modal-queue-edit"() {
    $(".modal-queue-edit").modal();
  }
});
