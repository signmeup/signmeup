_getUserFromEmail = function(email) {
  return Meteor.users.findOne({email: email});
}

_getUserEmail = function() {
  if (Meteor.user()) {
    var user = Meteor.user();
    if (user.email) {
      return user.email
    } else if (user.emails) {
      return user.emails[0].address;
    } else if (user.profile.email) {
      return user.profile.email;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

_getUserName = function() {
  if(Meteor.user()) {
    var p = Meteor.user().profile;
    var emailName = _getUserEmail().split("@")[0];
    return (p.displayName || p.name) || emailName;
  } else {
    return null;
  }
}

_getUserCourses = function() {
  if(Meteor.user()) {
    var u = Meteor.user();

    if(u.admin) {
      return _.map(Courses.find({}).fetch(), function(c) {
        return c.name;
      });
    } else {
      var courses = [];
      if(u.htaCourses)
        courses = _.union(courses, u.htaCourses)
      if(u.taCourses)
        courses = _.union(courses, u.taCourses)

      return courses;
    }
  } else {
    return null;
  }
}

UI.registerHelper("userFromEmail", _getUserFromEmail);
UI.registerHelper("userName", _getUserName);
UI.registerHelper("userEmail", _getUserEmail);
UI.registerHelper("userCourses", _getUserCourses);