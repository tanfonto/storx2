import Effect from '../lib/effects';
import Hub from '../lib/events';
import Store from '../lib/store';

test('commands are executed', () => {
  const out: any[] = [];
  const hub = Hub('some-event', {
    select: x => x,
    xf: x => x,
    write: x => x
  });
  const store = Store({}, hub);
  const makeEffect = Effect(store);

  makeEffect(hub, (state, patch) => {
    out.push(state, patch);
  });

  store.dispatch(hub, 42);

  expect(out).toStrictEqual([{}, 42]);
});

test('effects also update target stream', () => {
  const sourceHub = Hub('some-event', {
    select: x => x,
    xf: x => x,
    write: x => x
  });
  const targetHub = Hub('target-event', {
    select: x => x,
    xf: x => x,
    write: x => x
  });
  const store = Store({}, sourceHub);
  const makeEffect = Effect(store);

  makeEffect(sourceHub, targetHub, (_, patch) => patch);

  store.dispatch(sourceHub, 42);

  targetHub.stream.subscribe(x => {
    expect(x).toStrictEqual(42);
  });
});
