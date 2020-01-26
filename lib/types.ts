import { Observable, Subject } from 'rxjs';

export type Event<S, P> = {
  kind: string;
  status: 'failed' | 'ok';
  state?: S;
  patch?: P;
};

export type EventStream<S, P> = {
  kind: string;
  stream: Subject<Event<S, P | undefined>>;
  xf?: (state: S, patch: P) => S;
};

export type Store<S> = {
  dispatch: <P>(stream: EventStream<S, P>, patch?: P) => void;
  valueOf: () => S;
  allEvents: Observable<Event<S, unknown>>;
  state: Observable<S>;
};
