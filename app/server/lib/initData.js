// Functions to initialize collections

var testAdminId, testHTAId, testTAId;

createTestUsers = function() {
  var users = Meteor.settings.users;
  _.each(users, function(u) {
    if (u.saml) {
      var user = Meteor.users.findOne({email: u.email});
      if (!user) {
        var userId = Meteor.users.insert({email: u.email, profile: {}});
        if (u.type === "admin") {
          Meteor.users.update(userId, {$set: {admin: true}});
        }

        // TODO: Support other types of SAML users,
        // by simply merging this logic into createTestUser()
      }
    } else {
      createTestUser(u.name, u.email, u.password, u.type, "cs00");
    }
  });
}

function createTestUser(name, email, password, type, course) {
  var user, userId;

  user = Meteor.users.findOne({
    "emails.address": email
  });

  if(!user) {
    console.log("Creating " + email + "...");
    userId = Accounts.createUser({
      email: email,
      password: password,
      profile: {
        name: name
      }
    });
  }

  // Set admin
  if(type === "admin") {
    testAdminId = userId;
    Meteor.users.update({
      "emails.address": email
    }, {
      $set: {
        "admin": true
      }
    });
  }

  // Set HTA
  if(type === "hta") {
    testHTAId = userId;
    Meteor.users.update({
      "emails.address": email
    }, {
      $set: {
        "htaCourses": [course]
      }
    });
  }

  // Set TA
  if(type === "ta") {
    testTAId = userId;
    Meteor.users.update({
      "emails.address": email
    }, {
      $set: {
        "taCourses": [course]
      }
    });
  }
}

initializeCollections = function() {
  // Courses
  var testCourse = Courses.findOne({name: "cs00"});
  if(!testCourse) {
    Courses.insert({
      name: "cs00",
      description: "Test Course",
      listserv: "cs00tas@cs.brown.edu",
      active: true,

      htas: [testHTAId],
      tas: [testTAId],

      settings: {},
      createdAt: Date.now()
    });
  }

  // Locations
  var testLocationId;
  var testLocation = Locations.findOne({name: "Test Location"});
  if(!testLocation) {
    testLocationId = Locations.insert({
      name: "Test Location",

      ips: [],
      geo: {}
    });
  } else {
    testLocationId = testLocation._id;
  }

  // Queues
  var testQueue = Queues.findOne({name: "Test Queue", course: "cs00"});
  if(!testQueue) {
    var endTime = Date.now() + 3 * (60 * 60 * 1000);
    Meteor.call("createQueue", "cs00", "Test Queue", "Test Location", endTime, testTAId);
  }
}
