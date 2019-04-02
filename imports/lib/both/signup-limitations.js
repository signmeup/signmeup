import moment from "moment";

import { Courses } from "/imports/api/courses/courses";
import { Tickets } from "/imports/api/tickets/tickets";

export class SignupLimitations {
  static nextSignupTime(queue, userId) {
    const gapTime = SignupLimitations.nextSignupTimeFromGap(queue, userId);
    const limitTime = SignupLimitations.nextSignupTimeFromLimit(queue.courseId, userId);
    return gapTime >= limitTime ? gapTime : limitTime;
  }

  static nextSignupTimeFromGap(queue, userId) {
    if (!userId || queue.hasActiveTicketWithUsers([userId])) {
      return null;
    }

    // Get user's last ticket that was marked as done
    const userTickets = queue
      .tickets()
      .fetch()
      .filter(ticket => {
        return (
          ticket.status === "markedAsDone" &&
          ticket.studentIds.indexOf(userId) !== -1
        );
      });

    if (userTickets.length === 0) {
      return new Date();
    }

    const lastTicket = userTickets[userTickets.length - 1];

    // Compare to signup gap
    const nextSignupTime = moment(lastTicket.markedAsDoneAt).add(
      queue.course().settings.signupGap,
      "minutes"
    );

    return nextSignupTime.toDate();
  }

  static nextSignupTimeFromLimit(courseId, userId) {
    if (!userId) return null;

    const signupLimit = Courses.findOne(courseId).settings.signupLimit;
    // No limit set
    if (!signupLimit || signupLimit <= 0) return new Date();

    const recentTickets = Tickets.find({
      courseId: courseId,
      studentIds: {$in: [userId]},
      markedAsDoneAt: {$exists: true, $ne: null},
      createdAt: {$gt: moment().subtract(7, "days").toDate()}
    }, {sort: {createdAt: 1}}).fetch();

    // Student still under limit
    if (recentTickets.length < signupLimit) {
      return new Date();
    }

    return moment(recentTickets[recentTickets.length - 1].createdAt).add(7, "days").toDate();
  }
}
