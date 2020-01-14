/*
  Converts events with a probability defined in percentage to ranges.

  For example event1: 20%, event2: 40%, event3: 40% will result in:

  event3: 40
  event2: 80
  event1: 100

  This makes it easier to use in decision tree when matching on random number.

  For example: random number 10 is < 40 so event 3.
*/
export default function (events) {
    const sorted = events
        .sort((a, b) => (a.prob < b.prob) ? 1 : ((b.prob < a.prob) ? -1 : 0));

    return sorted.map((e, i) => {
        var range = sorted.slice(0, i + 1)
            .map(t => t.prob)
            .reduce((a, b) => Math.round((a + b) * 100) / 100, 0);

        return {
            data: e.data,
            range: range
        };
    });
}
