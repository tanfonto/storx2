import { skip } from 'rxjs/operators';
import EventStream from '../lib/events';
import Store, { withReason } from '../lib/store';

test('event messages are dispatched to stream', done => {
  const eventStream = EventStream('some-event');
  const store = Store({}, eventStream);

  eventStream.stream.subscribe(x => {
    expect(x.kind).toBe('some-event');
    done();
  });

  store.dispatch(eventStream);
});

test('effectful events result in state update', done => {
  const eventStream = EventStream<{ prop: number }, number, number>(
    'some-event',
    {
      select: state => state.prop,
      write: (state, focus) => ({ ...state, prop: focus }),
      xf: (focus, patch) => focus + patch
    }
  );
  const store = Store({ prop: 0 }, eventStream);

  store.state.pipe(skip(1)).subscribe(state => {
    expect(state.prop).toBe(5);
    done();
  });

  store.dispatch(eventStream, 5);
});

test("all events are streamed through 'events' property", done => {
  const eventStream = EventStream('some-event');
  const store = Store({ prop: 0 }, eventStream);

  store.allEvents.subscribe(x => {
    expect(x.kind).toBe('some-event');
    done();
  });

  store.dispatch(eventStream);
});

test('current state is accessible via valueOf()', () => {
  const eventStream = EventStream<{ prop: number }, number, number>(
    'some-event',
    {
      select: state => state.prop,
      write: (slice, patch) => ({ ...slice, prop: patch }),
      xf: (focus, patch) => focus + patch
    }
  );
  const store = Store({ prop: 0 }, eventStream);

  store.dispatch(eventStream, 5);

  expect(store.valueOf()).toStrictEqual({ prop: 5 });
});

test('effectless events do not trigger store update', () => {
  const eventStream = EventStream<{ prop: number }, number, number>(
    'some-event'
  );
  const store = Store({ prop: 0 }, eventStream);

  store.dispatch(eventStream, 42);

  expect(store.valueOf()).toStrictEqual({ prop: 0 });
});

test('failing dispatch calls trigger relevant failure events', done => {
  const eventStream = EventStream<{ prop: number }, number, number>(
    'some-event',
    {
      select: state => state.prop,
      write: (state, patch) => ({ ...state, prop: patch }),
      xf: (_, __) => {
        throw Error('42');
      }
    }
  );
  const store = Store({ prop: 0 }, eventStream);

  eventStream.stream.subscribe(({ status }) => {
    expect(status).toBe('failed');
    done();
  });

  store.dispatch(eventStream, 0);
});

test('withReason emits current state with latest ok event available', done => {
  const eventStream = EventStream<{ prop: number }, number, number>(
    'some-event',
    {
      select: state => state.prop,
      write: (state, patch) => ({ ...state, prop: patch }),
      xf: (focus, patch) => focus + patch
    }
  );
  const store = Store({ prop: 0 }, eventStream);

  withReason(store).subscribe(([state, reason]) => {
    expect(state).toStrictEqual({ prop: 42 });
    expect(reason).toMatchObject({ patch: 42, kind: 'some-event' });
    done();
  });

  store.dispatch(eventStream, 42);
});

test('unknown events are ignored', () => {
  const eventStream = EventStream<{ prop: number }, number, number>(
    'some-event'
  );
  const store = Store({ prop: 0 });

  const spy = jest.spyOn(eventStream.stream, 'next');

  store.dispatch(eventStream, 42);

  expect(spy).not.toHaveBeenCalled();
});
