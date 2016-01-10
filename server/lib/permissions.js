authorized = {
  student: function(userId) {
    var user = _getUser(userId);
    return user ? true : false;
  },

  ta: function(userId, course) {
    // TODO: Fix so that HTAs and above are allowed
    var user = _getUser(userId);
    var value = user && user.profile.ta;

    if(course) {
      value = value && _.contains(user.profile.taCourses, course);
    }

    return value;
  },

  hta: function(userId, course) {
    var user = _getUser(userId);
    var value = user && user.profile.hta;

    if(course) {
      value = value && _.contains(user.profile.htaCourses, course);
    }

    return value;
  },

  admin: function(userId){
    var user = _getUser(userId);
    return user.profile.admin;
  }
};