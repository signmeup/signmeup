// Startup

Meteor.startup(function() {
  // Setup SSL
  var keyPath = Meteor.settings.ssl.absolutePathToKey;
  var certPath = Meteor.settings.ssl.absolutePathToCert;
  SSL(keyPath, certPath, 3000);

  createTestUsers();
  initializeCollections();
});


// Test Data

function createTestUsers() {
  var settings = Meteor.settings;
  createUser("Admin", settings.admin.email, settings.admin.password, true);
  createUser("Test TA", settings.ta.email, settings.ta.password, false, true, "cs00");
  createUser("Test Student", settings.student.email, settings.student.password);
}

function createUser(name, email, password, admin, ta, course) {
  var user = Meteor.users.findOne({
    "emails.address": email
  });

  if(!user) {
    console.log("Creating account...");
    Accounts.createUser({
      email: email,
      password: password,
      profile: {
        name: name
      }
    });
  }

  // Set admin
  if(admin) {
    Meteor.users.update({
      "emails.address": email
    }, {
      $set: {
        "profile.admin": true
      }
    });
  }

  // Set TA
  if(ta) {
    Meteor.users.update({
      "emails.address": email
    }, {
      $set: {
        "profile.ta": true,
        "profile.taCourses": [course]
      }
    });
  }
}

function initializeCollections() {
  // Courses
  var testCourse = Courses.findOne({name: "cs00"});
  if(!testCourse) {
    Courses.insert({
      name: "cs00",
      description: "Test Course",
      listserv: "cs00tas@cs.brown.edu",
      active: true,

      htas: [],
      tas: [],

      settings: {},
      createdAt: Date.now()
    });
  }

  // Locations
  var testLocation = Locations.findOne({name: "Test Location"});
  if(!testLocation) {
    Locations.insert({
      name: "Test Location",
      active: true,

      ips: [],
      geo: {}
    });
  }

  // Queues
  var testQueue = Queues.findOne({name: "Test Queue", course: "cs00"});
  if(!testQueue) {
    Queues.insert({
      name: "Test Queue",
      course: "cs00",
      location: "CIT 227",

      status: "active",

      owner: {},

      startTime: Date.now(),
      endTime: null,

      localSettings: {},
      announcements: [],

      tickets: [],
      averageWaitTime: 0
    });
  }
}
