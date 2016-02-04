// Functions to initialize collections

createTestUsers = function() {
  var settings = Meteor.settings;
  createUser("Admin", settings.admin.email, settings.admin.password, "admin");
  createUser("Test HTA", settings.hta.email, settings.hta.password, "hta", "cs00");
  createUser("Test TA", settings.ta.email, settings.ta.password, "ta", "cs00");
  createUser("Test Student", settings.student.email, settings.student.password);
}

function createUser(name, email, password, type, course) {
  var user = Meteor.users.findOne({
    "emails.address": email
  });

  if(!user) {
    console.log("Creating " + email + "...");
    Accounts.createUser({
      email: email,
      password: password,
      profile: {
        name: name
      }
    });
  }

  // Set admin
  if(type === "admin") {
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
  var testHTA = Meteor.users.findOne({"emails.address": Meteor.settings.hta.email});
  var testTA = Meteor.users.findOne({"emails.address": Meteor.settings.ta.email});

  // Courses
  var testCourse = Courses.findOne({name: "cs00"});
  if(!testCourse) {
    Courses.insert({
      name: "cs00",
      description: "Test Course",
      listserv: "cs00tas@cs.brown.edu",
      active: true,

      htas: [testHTA._id],
      tas: [testTA._id],

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
    Queues.insert({
      name: "Test Queue",
      course: "cs00",
      location: testLocationId,
      mode: "universal",

      status: "active",
      owner: {
        id: testTA._id,
        email: testTA.emails[0].address
      },

      startTime: Date.now(),
      endTime: Date.now() + 3 * (60 * 60 * 1000), // Add 3 hours
      averageWaitTime: 0,

      localSettings: {},

      announcements: [],
      tickets: [],
    });
  }
}
