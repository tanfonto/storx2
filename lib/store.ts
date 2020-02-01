import {
  BehaviorSubject,
  combineLatest,
  merge,
  pipe,
  OperatorFunction
} from 'rxjs';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';
import { Event, EventStream, Store } from './types';
import eq from 'deep-is';

export default <S>(
  initialState: S,
  ...knownEvents: EventStream<S, unknown>[]
): Store<S> => {
  const state = new BehaviorSubject<S>(initialState);
  const allEvents = merge(...knownEvents.map(x => x.stream));

  return {
    dispatch: <P>({ stream, xf, kind }: EventStream<S, P>, patch?: P) => {
      if (knownEvents.some(x => x.kind === kind)) {
        const event = { kind };
        try {
          const success: Event<S | undefined, P> = { ...event, status: 'ok' };
          if (!xf) stream.next({ ...success });
          else {
            state.next(xf(state.getValue(), patch!));
            stream.next({ ...success, state: state.getValue(), patch });
          }
        } catch (error) {
          stream.next({ status: 'failed', ...event, patch, state: error });
        }
      }
    },
    valueOf: state.getValue.bind(state),
    allEvents,
    state: state.asObservable()
  };
};

export const withReason = <S>(store: Store<S>) =>
  combineLatest(
    store.state,
    store.allEvents.pipe(filter(x => x.status === 'ok'))
  );

export const select = <T, R>(
  project: (state: T) => R
): OperatorFunction<T, R> =>
  pipe(
    distinctUntilChanged(eq),
    map(project)
  );
