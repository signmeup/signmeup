window.authorized = {
  student: function(){
    return Meteor.userId() ? true : false;
  },

  ta: function(course){
    var user = Meteor.user();
    var value = user && user.profile.ta;

    if(course) {
      value = value && _.contains(user.profile.taCourses, course);
    }

    return value;
  },

  hta: function(course) {
    var user = Meteor.user();
    var value = user && user.profile.hta;

    if(course) {
      value = value && _.contains(user.profile.htaCourses, course);
    }

    return value;
  },

  admin: function(){
    return Meteor.user() && Meteor.user().profile.admin;
  }
};

UI.registerHelper('userIs', function(role, course){
  return authorized[role](course);
});