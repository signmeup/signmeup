/**
 * Courses
 *
 * Course: {
 *    name: STRING,
 *    description: STRING,
 *    listserv: STRING,
 *    active: BOOLEAN,
 *
 *    htas: [userId],
 *    tas: [userId],
 *
 *    settings: {
 *      
 *    },
 *    createdAt: Number (Milliseconds)
 * }
 */
Courses = new Mongo.Collection("courses");

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

/**
 * Locations
 *
 * Location:  {
 *    name: STRING,
 *    active: BOOLEAN,
 *    
 *    ips: [STRING],
 *    geo: {
 *      root: GeoJSON,
 *      radius: Number (Meters)
 *    }
 * }
 */
Locations = new Mongo.Collection("locations");

var testLocation = Locations.findOne({name: "Test Location"});
if(!testLocation) {
  Locations.insert({
    name: "Test Location",
    active: true,

    ips: [],
    geo: {}
  });
}

/**
 * Queues
 *
 * Queue: {
 *    name: STRING,
 *    course: STRING,
 *    room: STRING,
 *
 *    status: STRING ("active", "cutoff", "ended"),
 *    
 *    owner: {
 *      id: userId,
 *      email: STRING
 *    },
 *    startTime: Number (Milliseconds),
 *    endTime: Number (Milliseconds),
 *
 *    localSettings: {
 *      property: value (Overrides from Course)
 *    },
 *    announcements: [{
 *      owner: {
 *        id: userId,
 *        name: STRING,
 *      },
 *      header: STRING,
 *      content: STRING,
 *      createdAt: Number (Milliseconds)
 *    }],
 *
 *    tickets: [{
 *      
 *    }]
 * }
 */
Queues = new Mongo.Collection("queues");

/**
 * Users
 */