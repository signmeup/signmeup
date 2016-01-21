// Users Publications

Meteor.publish("userData", function() {
  if(this.userId) {
    return Meteor.users.find({
      _id: this.userId
    }, {
      email: true,
      admin: true,
      htaCourses: true,
      taCourses: true
    });
  }
});

Meteor.publish("allUsers", function() {
  if(!this.userId)
    throw new Meteor.Error("no-user");

  if(!authorized.admin(this.userId))
    throw new Meteor.Error("not-allowed");

  return Meteor.users.find({});
});