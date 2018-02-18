import { Meteor } from 'meteor/meteor';

import moment from 'moment';
import Plottable from 'plottable';

import { Tickets } from '/imports/api/tickets/tickets';

import './analytics-graphs.html';

Template.AnalyticsGraphs.onCreated(function onCreated() {
  this.autorun(() => {
    const end = moment().subtract(1, 'day').endOf('day');
    const start = end.clone().subtract(1, 'week').startOf('day');
    this.subscribe('tickets.inRange', Template.currentData().course._id, start.toDate(), end.toDate());
  });
});

Template.AnalyticsGraphs.onRendered(function onRendered() {
  this.autorun(() => {
    if (!this.subscriptionsReady()) return;

    const end = moment().subtract(1, 'day').endOf('day');
    const start = end.clone().subtract(1, 'week').startOf('day');
    const tickets = Tickets.find({
      courseId: Template.currentData().course._id,
      createdAt: {
        $gte: start.toDate(),
        $lte: end.toDate(),
      },
    }).fetch();
    const ticketsByWeekday = _.groupBy(tickets, (ticket) => {
      return moment(ticket.createdAt).weekday();
    });
    const groupedTickets = _.map(_.range(7), (weekday) => {
      const ticketGroup = ticketsByWeekday[weekday] || [];
      const ticketsByHour = _.groupBy(ticketGroup, (ticket) => {
        return moment(ticket.createdAt).hour();
      });
      return _.map(_.range(24), (hour) => {
        return {
          x: hour,
          y: weekday,
          val: (ticketsByHour[hour] || []).length,
        };
      });
    });

    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Category();
    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(["#BDCEF0", "#5279C7"]);
    const data = _.flatten(groupedTickets);

    const plot = new Plottable.Plots.Rectangle()
      .addDataset(new Plottable.Dataset(data))
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .attr("fill", function(d) { return d.val; }, colorScale)
      .renderTo("#week");

    // The plottable library sets fixed sizes via JavaScript, so we must
    // manually tell it whenever the graph needs to be re-drawn
    $('#js-show-analytics').on('shown.bs.tab', () => {
      // Sizes are not set until the tab is shown
      plot.redraw();
    });
    window.addEventListener('resize', () => {
      // We must also re-draw whenever the window changes size
      plot.redraw();
    });
  });
});
