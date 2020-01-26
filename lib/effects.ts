import { EventStream, Store } from './types';

type Effect<P, S, T> = (state?: S, patch?: P) => T;
type SideEffect<P, S> = Effect<P, S, void>;

export default <S>({ dispatch }: Store<S>) => <P, T>(
  { stream }: EventStream<S, P>,
  ...[targetStreamOrEffect, maybeEffect]:
    | [EventStream<S, T>, Effect<P, S, T>]
    | [SideEffect<P, S>]
) =>
  stream.subscribe(({ state, patch }) => {
    maybeEffect
      ? dispatch(
          targetStreamOrEffect as EventStream<S, T>,
          maybeEffect(state, patch)
        )
      : (targetStreamOrEffect as SideEffect<P, S>)(state, patch);
  });
