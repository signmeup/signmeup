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
    colorScale.range(['#eee', '#5279C7']);
    const data = _.flatten(groupedTickets);

    const plot = new Plottable.Plots.Rectangle()
      .addDataset(new Plottable.Dataset(data))
      .x((d) => d.x, xScale)
      .y((d) => d.y, yScale)
      .attr('fill', (d) => d.val, colorScale)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .renderTo('#week');

    // Initializing tooltip anchor
    const tooltipAnchorSelection = plot.foreground().append('circle');
    tooltipAnchorSelection.attr({
      r: 3,
      opacity: 0,
    });
    const tooltipAnchor = $(tooltipAnchorSelection.node());
    tooltipAnchor.tooltip({
      animation: false,
      container: 'body',
      placement: 'auto',
      trigger: 'manual',
    });
    // Setup Interaction.Pointer
    const pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove((p) => {
      const closest = plot.entityNearest(p);
      if (closest) {
        tooltipAnchor.tooltip('show');
        tooltipAnchor.attr('cx', closest.position.x);
        tooltipAnchor.attr('cy', closest.position.y);
        tooltipAnchor.attr('data-original-title', closest.datum.val + ' tickets');
      }
    });

    pointer.onPointerExit(() => {
      tooltipAnchor.tooltip('hide');
    });

    pointer.attachTo(plot);

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
