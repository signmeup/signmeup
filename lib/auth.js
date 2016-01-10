// Authorization Functions and Helpers

_getUser = function(userId) {
  return Meteor.users.findOne({_id: userId});
}

authorized = {
  student: function(userId) {
    var user = _getUser(userId);
    return !!(user);
  },

  ta: function(userId, course) {
    if(authorized.admin(userId) ||
      authorized.hta(userId, course)) {
      return true;
    }

    var user = _getUser(userId);
    if(!user) return false;
    if(!user.taCourses) return false;

    if(!course) {
      return user.taCourses.length >= 0;
    } else {
      return user.taCourses.indexOf(course) != -1;
    }
  },

  hta: function(userId, course) {
    if(authorized.admin(userId)) return true;

    var user = _getUser(userId);
    if(!user) return false;
    if(!user.htaCourses) return false;

    if(!course) {
      return user.htaCourses.length >= 0;
    } else {
      return user.htaCourses.indexOf(course) != -1;
    }
  },

  admin: function(userId){
    var user = _getUser(userId);
    if(!user) return false;

    return user.admin;
  }
};

if(Meteor.isClient) {
  UI.registerHelper("userIs", function(role, course) {
    return authorized[role](Meteor.userId(), course);
  });
}
