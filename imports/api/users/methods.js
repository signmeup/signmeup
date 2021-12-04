import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Roles } from "meteor/alanning:roles";
import { _ } from "meteor/underscore";

import { Courses } from "/imports/api/courses/courses";
import { Tickets } from "/imports/api/tickets/tickets";
import { Queues } from "/imports/api/queues/queues";

import { createUser, findUserByEmail } from "/imports/lib/both/users";
import { endQueue } from "/imports/api/queues/methods";
import { deleteTicket } from "/imports/api/tickets/methods";
import { Jobs } from "meteor/msavin:sjobs";

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


    let userData = {} 

    //Get all personal, ticket, and queue data relating to the user, and return relevant fields

    const user = Meteor.users.findOne(this.userId);
    console.log("Fetched data associated with this user.")

    userData["Name"] = user["preferredName"]

    userEmails = []

    emailData = user["emails"]

    if(emailData != null){
      for(let userEmail of emailData){
        userEmails.push(userEmail["address"])
      }
    }
    
    userData["Emails"] = userEmails
    
    userData["TA or Above?"] = user.isTAOrAbove()
    
    

    const tickets = Tickets.find(
      {$or: [{createdBy: this.userId},{studentIds: this.userId}]}).fetch();
    console.log("Fetched tickets created by this user.")

    ticketsCreated = [];

    for(let ticket of tickets){
      
      let ticketObj = {}

      let courseOfTicket = Courses.findOne({_id : ticket["courseId"]})
      if(courseOfTicket != null){
        ticketObj["Course"] = courseOfTicket["name"]
      }
      ticketObj["Question Asked"] = ticket["question"];
      ticketObj["Created At"] = ticket["createdAt"];
      ticketObj["Status"] = ticket["status"];

      ticketsCreated.push(ticketObj); 

    }

    userData["Tickets You Created"] = ticketsCreated


    
    const ticketsClaimedMarkedDeleted = Tickets.find(
      {$or: [{claimedBy: this.userId},{deletedBy: this.userId},{markedAsDoneBy: this.userId}]}).fetch();
    console.log("Fetched tickets claimed, marked, or deleted by this user.")

    ticketsCMD = [];

    for(let ticket of ticketsClaimedMarkedDeleted){
      
      let ticketObj = {}

      let courseOfTicket = Courses.findOne({_id : ticket["courseId"]})
      if(courseOfTicket != null){
        ticketObj["Course"] = courseOfTicket["name"]
      }

      ticketObj["Question Asked"] = ticket["question"];
      ticketObj["Created At"] = ticket["createdAt"];
      ticketObj["Status"] = ticket["status"];

      ticketsCMD.push(ticketObj); 

    }

    userData["Tickets You Claimed, Marked, Or Deleted"] = ticketsCMD


    
    const queuesCreatedOrEnded = Queues.find({$or: [{createdBy: this.userId},{endedBy: this.userId}]}).fetch();
    console.log("Fetched queues created or ended by this user.")

    queuesCreatedOrEndedByUser = [];

    for(let queue of queuesCreatedOrEnded){
      
      let queueObj = {}

      let courseOfQueue = Courses.findOne({_id : queue["courseId"]})
      if(courseOfQueue != null){
        queueObj["Course"] = courseOfQueue["name"]
      }

      queueObj["Queue Name"] = queue["name"];
      queueObj["Created At"] = queue["createdAt"];
      queueObj["Status"] = queue["status"];

      queuesCreatedOrEndedByUser.push(queueObj); 

    }

    userData["Queues You Created Or Ended"] = queuesCreatedOrEndedByUser


    return "\n" + JSON.stringify(userData, null, 4)


  }
});

export const deleteData = new ValidatedMethod({
  name: "users.deleteData",
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

    

    console.log("Delete call received");

    //Extra check: (safely) delete tickets whose queues have ended or been deleted (no longer exist)
    //otherwise, tickets will remain in the "open" status and no longer be deleteable
    const tickets = Tickets.find(
      {$or: [ 
              {createdBy: this.userId},
              {studentIds: this.userId},
              {claimedBy: this.userId},
              {deletedBy: this.userId},
              {markedAsDoneBy: this.userId}
             ]}).fetch();

    console.log("Fetched all existing tickets associated with this user.")


    for(let ticket of tickets){

      let parentQueue = Queues.findOne({_id : ticket["queueId"]})

      if(parentQueue == null || parentQueue["status"] == "ended"){

        let ticketId = ticket["_id"]

        deleteTicket.call(
          {
            ticketId: ticketId
          },
          err => {
            if (err) console.error(err);
          }
        );
        
      }

    }


    Tickets.remove( {
      $and : [
               { 
                 $or : [ 
                         {createdBy: this.userId},
                         {studentIds: this.userId},
                         {claimedBy: this.userId},
                         {deletedBy: this.userId},
                         {markedAsDoneBy: this.userId}
                       ]
               },
               { 
                 $or : [ 
                         {status: "markedAsDone"},
                         {status: "deleted"}
                       ]
               }
             ]
    } )

    console.log("Deleted tickets associated with this user.")
    console.log("Deleted tickets claimed, marked, or deleted by this user.") //only non active tickets are deleted

    
    Queues.remove( {
      $and : [
               { 
                 $or : [ 
                         {createdBy: this.userId},
                         {endedBy: this.userId}
                       ]
               },
               { 
                 status:"ended"
               }
             ]
    } )

    console.log("Deleted queues created or ended by this user.") //only ended queues are deleted


  }
});
