import { Subject } from 'rxjs';
import { EventStream, Event } from './types';

export default <S, P = S, F = P>(
  kind: string,
  effectful?: {
    select: (state: S) => F;
    xf: (focus: F, patch: P) => F;
    write: (state: S, focus: F) => S;
  }
): EventStream<S, P> => {
  const stream = new Subject<Event<S, P>>();
  const xf = effectful
    ? (state: S, patch: P) => {
        const { select, write, xf } = effectful;
        return write(state, xf(select(state), patch));
      }
    : undefined;

  return { kind, stream, xf };
};
