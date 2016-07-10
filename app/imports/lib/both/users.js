_getUser = function(userId) {
  if (typeof userId === "string")
    return Meteor.users.findOne({_id: userId});
  else
    return Meteor.user();
}

_getUserFromEmail = function(email) {
  return Meteor.users.findOne({
    $or: [
      {"email": email},
      {"emails.address": email}
    ]
  });
}

_getUserEmail = function(userId) {
  var user = _getUser(userId);

  if (user) {
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

_getUserName = function(userId) {
  var user = _getUser(userId);

  if(user) {
    var emailName = _getUserEmail(userId).split("@")[0];
    if (user.profile) {
      var p = user.profile;
      return p.displayName || p.name || emailName
    } else {
      return emailName;
    }
  } else {
    return null;
  }
}

_getUserShortName = function(userId) {
  var user = _getUser(userId);

  if(user && user.profile && user.profile.givenName) {
    return user.profile.givenName;
  } else {
    return _getUserName(userId);
  }
}

_getUserCourseNames = function(userId) {
  var user = _getUser(userId);

  if(user) {
    if(user.admin) {
      return _.map(Courses.find({}).fetch(), function(c) {
        return c.name;
      });
    } else {
      var courses = [];
      if(user.htaCourses)
        courses = _.union(courses, user.htaCourses)
      if(user.taCourses)
        courses = _.union(courses, user.taCourses)

      return courses;
    }
  } else {
    return null;
  }
}

_getActiveUserCourseNames = function(userId) {
  var userCourses = _getUserCourseNames(userId);
  if(!userCourses) return;

  return _.filter(userCourses, function(c) {
    return Courses.findOne({name: c}).active;
  });
}

_getUserCourses = function(userId) {
  var userCourses = _getUserCourseNames(userId);
  if(!userCourses) return;

  return Courses.find({name: {$in: userCourses}});
}

_getActiveUserCourses = function(userId) {
  var userCourses = _getActiveUserCourseNames(userId);
  if(!userCourses) return;

  return Courses.find({name: {$in: userCourses}});
}

UI.registerHelper("getUser", _getUser);
UI.registerHelper("userFromEmail", _getUserFromEmail);
UI.registerHelper("userName", _getUserName);
UI.registerHelper("userShortName", _getUserShortName);
UI.registerHelper("userEmail", _getUserEmail);
UI.registerHelper("userCourseNames", _getUserCourseNames);
UI.registerHelper("activeUserCourseNames", _getActiveUserCourseNames);
UI.registerHelper("userCourses", _getUserCourses);
UI.registerHelper("activeUserCourses", _getActiveUserCourses);
