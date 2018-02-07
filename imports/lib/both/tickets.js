import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

const read = (f) => {
  if (Meteor.isClient) return [];

  /* global Assets */
  const lines = Assets.getText(`${f}.txt`).split('\n');
  return _.filter(lines, (t) => {
    return t.trim() !== '';
  });
};
const adjectives = read('adjectives');
const nouns = read('nouns');

export function generateAnonymousNames(queue, count) {
  if (Meteor.isClient) return ['You should never see this'];

  const existing = _.flatten(queue.activeTickets().fetch().map((t) => {
    return t.anonymousNames;
  }));
  const combos = _.flatten(adjectives.map((a) => {
    return nouns.map((n) => {
      return `${a} ${n}`;
    });
  }));
  let available = combos.filter((c) => {
    return !_.contains(existing, c);
  });
  // if there are no available combos, just re-use
  if (available.length < count) available = combos;
  return _.sample(available, count);
}
