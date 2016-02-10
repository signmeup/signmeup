// Users Publications

Meteor.publish("userData", function() {
  if(this.userId) {
    return Meteor.users.find({
      _id: this.userId
    }, {
      fields: {
        email: true,
        admin: true,
        htaCourses: true,
        taCourses: true
      }
    });
  }
});

Meteor.publish("allUsers", function() {
  if(!this.userId)
    throw new Meteor.Error("no-user");

  if (authorized.admin(this.userId)) {
    return Meteor.users.find({});
  } else if (authorized.hta(this.userId)) {
    return Meteor.users.find({}, {
      fields: {
        email: true,
        emails: true,
        admin: true,
        htaCourses: true,
        taCourses: true,
        "profile.displayName": true,
        "profile.name": true
      }
    });
  } else {    
    throw new Meteor.Error("not-allowed");
  }
});