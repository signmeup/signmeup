// Courses Methods

// TODO: Replace input error checks with check()
// TODO: Replace "not-allowed" errors with 403 errors

Meteor.methods({
  createCourse: function(name, description, listserv) {
    if(!authorized.admin(Meteor.userId))
      throw new Meteor.Error("not-allowed");

    if(Courses.findOne({name: name}))
      throw new Meteor.Error("course-exists");

    Courses.insert({
      name: name,
      description: description,
      listserv: listserv,
      active: false,
      createdAt: Date.now()
    });
  },

  updateCourse: function(course, options) {
    // Update name, description, listserv, or active
    if(!authorized.hta(Meteor.userId, course))
      throw new Meteor.Error("not-allowed");

    var validFields = ["name", "description", "listserv", "active"];
    var validOptions = _.pick(options, validFields);

    console.log("Updating " + course + " with " + JSON.stringify(validOptions));
    Courses.update({name: course}, {
      $set: validOptions
    });
  },

  addTA: function(course, email) {
    if(!authorized.hta(Meteor.userId, course))
      throw new Meteor.Error("not-allowed");

    var userId;
    var user = _getUserFromEmail(email);
    if(user) {
      // Find the TA
      userId = user._id;
    } else {
      // Or, create a new user for the TA
      userId = Meteor.users.insert({
        email: email,
      });
    }

    if (authorized.ta(userId, course))
      throw new Meteor.Error("already-a-ta");

    // Update the course
    Courses.update({name: course}, {
      $push: {tas: userId}
    });

    // Update the user
    Meteor.users.update(userId, {
      $push: {taCourses: course}
    });
  },

  deleteTA: function(course, userId) {
    if(!authorized.hta(Meteor.userId, course))
      throw new Meteor.Error("not-allowed");

    Courses.update({name: course}, {
      $pull: {tas: userId, htas: userId}
    });

    Meteor.users.update(userId, {
      $pull: {taCourses: course, htaCourses: course}
    });
  },

  switchToTA: function(course, userId) {
    if(!authorized.hta(Meteor.userId, course))
      throw new Meteor.Error("not-allowed");

    Courses.update({name: course}, {
      $pull: {htas: userId},
      $push: {tas: userId}
    });

    Meteor.users.update(userId, {
      $pull: {htaCourses: course},
      $push: {taCourses: course}
    });
  },

  switchToHTA: function(course, userId) {
    if(!authorized.hta(Meteor.userId, course))
      throw new Meteor.Error("not-allowed");

    Courses.update({name: course}, {
      $pull: {tas: userId},
      $push: {htas: userId}
    });

    Meteor.users.update(userId, {
      $pull: {taCourses: course},
      $push: {htaCourses: course}
    });
  },

  updateCourseSettings: function(courseName, settings) {
    // Update signupGap and other (future) settings
    if(!authorized.hta(Meteor.userId, courseName))
      throw new Meteor.Error("not-allowed");

    var validFields = ["signupGap"];
    var validSettings = _.pick(settings, validFields);

    var course = Courses.findOne({name: courseName});
    var currentSettings = course.settings || {};
    var newSettings = _.extend(currentSettings, validSettings);

    console.log("Updating " + courseName + " settings with " + JSON.stringify(validSettings));
    Courses.update({name: courseName}, {
      $set: {"settings": newSettings}
    });
  },

  deleteCourse: function(course) {
    if(!authorized.hta(Meteor.userId, course))
      throw new Meteor.Error("not-allowed");

    var course = Courses.findOne({name: course});
    if(!course)
      throw new Meteor.Error("invalid-course-name");

    var htas = course.htas;
    var tas = course.tas;

    _.each(htas, function(hta) {
      Meteor.users.update(hta, {
        $pull: {htaCourses: course.name}
      });
    });

    _.each(tas, function(ta) {
      Meteor.users.update(ta, {
        $pull: {taCourses: course.name}
      });
    });

    Courses.remove(course._id);
  }
});
