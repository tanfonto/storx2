import EventStream from '../lib/events';
import Store from '../lib/store';

test('effectless events do not trigger store update', () => {
  const state = {};
  const eventStream = EventStream('some-event');
  const store = Store(state, eventStream);

  store.dispatch(eventStream);

  expect(store.valueOf()).toBe(state);
});

test('effectless events trigger subscribers notifications', () => {
  const state = {};
  const eventStream = EventStream('some-event', {
    select: x => x,
    xf: (_, p) => p,
    write: (s, _) => s
  });
  const store = Store(state, eventStream);

  eventStream.stream.subscribe(x => {
    expect(x).toBeDefined();
  });

  store.dispatch(eventStream);
});
