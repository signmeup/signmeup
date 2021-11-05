import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Roles } from "meteor/alanning:roles";
import { _ } from "meteor/underscore";

import { Courses } from "/imports/api/courses/courses";
import { Tickets } from "/imports/api/tickets/tickets";

import { createUser, findUserByEmail } from "/imports/lib/both/users";

export const addRoleGivenEmail = new ValidatedMethod({
  name: "users.addRoleGivenEmail",
  validate: new SimpleSchema({
    email: { type: String, regEx: SimpleSchema.RegEx.Email },
    role: { type: String, allowedValues: ["admin", "mta", "hta", "ta"] },
    courseId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }
  }).validator(),
  run({ email, role, courseId }) {
    // If specified, check if course exists
    const course = Courses.findOne(courseId);
    if (_.contains(["hta", "ta"], role) && !course) {
      throw new Meteor.Error(
        "courses.doesNotExist",
        `No course with id ${courseId}`
      );
    }

    // Check current user is authorized to create role
    if (
      course &&
      !Roles.userIsInRole(this.userId, ["admin", "mta", "hta"], courseId)
    ) {
      throw new Meteor.Error(
        "users.addRoleGivenEmail.unauthorized",
        "Only HTAs and above can add roles to the course"
      );
    }

    // Fetch or create new user
    email = email.toLowerCase(); // eslint-disable-line no-param-reassign
    const user = findUserByEmail(email);
    const userId = user ? user._id : createUser({ email, google: true });

    // If adding TA or HTA role, make sure user isn't already a TA or HTA
    if (Roles.userIsInRole(userId, ["hta", "ta"], courseId)) {
      throw new Meteor.Error(
        "users.addRoleGivenEmail.hasConflictingRole",
        `User already has HTA or TA role for course ${courseId}`
      );
    }

    // Create role
    if (course) {
      Roles.addUsersToRoles(userId, role, courseId);
    } else {
      Roles.addUsersToRoles(userId, role);
    }
  }
});

export const removeRole = new ValidatedMethod({
  name: "users.removeRole",
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    role: { type: String, allowedValues: ["admin", "mta", "hta", "ta"] },
    courseId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }
  }).validator(),
  run({ userId, role, courseId }) {
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error(
        "users.doesNotExist",
        `No user exists with id ${userId}`
      );
    }

    const course = Courses.findOne(courseId);
    if (_.contains(["hta", "ta"], role) && !course) {
      throw new Meteor.Error(
        "courses.doesNotExist",
        `No course with id ${courseId}`
      );
    }

    if (course) {
      Roles.removeUsersFromRoles(userId, role, courseId);
    } else {
      Roles.removeUsersFromRoles(userId, role);
    }
  }
});

export const updateProfile = new ValidatedMethod({
  name: "users.updateProfile",
  validate: new SimpleSchema({
    preferredName: { type: String }
  }).validator(),
  run({ preferredName }) {
    if (!preferredName) {
      throw new Meteor.Error(
        "users.invalidName",
        `${preferredName} is an invalid name`
      );
    }

    Meteor.users.update(
      {
        _id: this.userId
      },
      {
        $set: {
          preferredName
        }
      }
    );
  }
});

export const getData = new ValidatedMethod({
  name: "users.getData",
  validate: new SimpleSchema({
    identifier: { type: String }
  }).validator(),
  run({ identifier }) {
    if (!identifier) {
      throw new Meteor.Error(
        "users.invalidID",
        `${identifier} is an invalid user id`
      );
    }

    const user = Meteor.users.findOne(this.userId);
    //const userID = Meteor.userId()

    let userData = {} //?
    //return "Hi";

    //TODO: get all data relating to the user; return as String (get indiv ones and concatenate together?):
    //db.users.find(): pref name, email, roles (TA, Student, etc.), status (logged in or not), IP addr., Browser/OS, timestamp of last activity
    
    for (let key in user) {
      if (user.hasOwnProperty(key)) {
        //*********************
          userData[key] = user[key];
      }
    }
    //userData["Name"] = user["preferredName"]
    //userData["Email"] = user.emailAddress()
    //Roles.userIsInRole(userID, ["admin", "mta"])
    //userData["stuff"] = JSON.stringify(user)

    //db.tickets.find(): all tickets submitted. Tickets include courseID, queueID, studentID, question asked, claimed/marked/deleted status(+ by who)
    const tickets = Tickets.findOne("S33hcuXMbvik83n7L")//find({studentIds: "heogg6ABgjjMd8fvs"});//this.userId});

    userData["Tickets"] = tickets

    //If the student is a TA/HTA/MTA, would need to show queues they end/create, tickets they claim/mark/delete, etc.

    //potential ones to check (time permitting):
    //db.locations.find() (courses are associated with a location. can aggregate the courses found from the tickets and get locations of them)


    return JSON.stringify(userData)


  }
});