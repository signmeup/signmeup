import moment from 'moment';

export class SignupGap {
  static nextSignupTime(queue, userId) {
    if (!userId || queue.hasActiveTicketWithUsers([userId])) {
      return null;
    }

    // Get user's last ticket that was marked as done
    const userTickets = queue.tickets().fetch().filter((ticket) => {
      return ticket.status === 'markedAsDone' && ticket.studentIds.indexOf(userId) !== -1;
    });

    if (userTickets.length === 0) {
      return new Date();
    }

    const lastTicket = userTickets[userTickets.length - 1];

    // Compare to signup gap
    const nextSignupTime = moment(lastTicket.markedAsDoneAt).add(queue.course().settings.signupGap, 'minutes');

    return nextSignupTime.toDate();
  }
}
