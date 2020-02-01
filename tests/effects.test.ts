import Effect from '../lib/effects';
import EventStream from '../lib/events';
import Store from '../lib/store';

test('commands are executed', () => {
  const out: any[] = [];
  const eventStream = EventStream('some-event', {
    select: x => x,
    xf: x => x,
    write: x => x
  });
  const store = Store({}, eventStream);
  const makeEffect = Effect(store);

  makeEffect(eventStream, (state, patch) => {
    out.push(state, patch);
  });

  store.dispatch(eventStream, 42);

  expect(out).toStrictEqual([{}, 42]);
});

test('effects also update target stream', () => {
  const sourceEventStream = EventStream('some-event', {
    select: x => x,
    xf: x => x,
    write: x => x
  });
  const targetEventStream = EventStream('target-event', {
    select: x => x,
    xf: x => x,
    write: x => x
  });
  const store = Store({}, sourceEventStream);
  const makeEffect = Effect(store);

  makeEffect(sourceEventStream, targetEventStream, (_, patch) => patch);

  store.dispatch(sourceEventStream, 42);

  targetEventStream.stream.subscribe(x => {
    expect(x).toStrictEqual(42);
  });
});
