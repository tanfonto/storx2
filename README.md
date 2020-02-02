[![MIT
license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
[![Build
Status](https://travis-ci.com/tanfonto/storx2.svg?branch=master)](https://travis-ci.com/tanfonto/storx2) [![Coverage Status](https://coveralls.io/repos/github/tanfonto/storx2/badge.svg?branch=master)](https://coveralls.io/github/tanfonto/storx2?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/tanfonto/storx2/badge)](https://www.codefactor.io/repository/github/tanfonto/storx2)
[![dependencies
Status](https://david-dm.org/tanfonto/storx2/status.svg)](https://david-dm.org/tanfonto/storx2) [![devDependencies Status](https://david-dm.org/tanfonto/storx2/dev-status.svg)](https://david-dm.org/tanfonto/storx2?type=dev)
[![Built with Spacemacs](https://cdn.rawgit.com/syl20bnr/spacemacs/442d025779da2f62fc86c2082703697714db6514/assets/spacemacs-badge.svg)](http://spacemacs.org)

# Storx(2)

[Rxjs](https://github.com/ReactiveX/RxJS)-based state management. Borrows concepts from [Redux](https://github.com/reduxjs/redux), [Effector](https://github.com/zerobias/effector) and few others
but targets minimalism and strong RxJS reliance rather than custom internals.

This is a revamped version of [Storx](https://github.com/tanfonto/storx). Differs from its predecessor in both implementation and dsl but persists the core ideas of simplicity and RxJS dependency.

### Core artifacts

- `Store (known events[])` - an object that relies on variable-size set of events (provided via constructor function) that it then triggers when `dispatch` is called. Stores the state object and - depending on an event type definition (effectful or effectless) - may also perform updates.

- `Events (effectful | effectless)` - tuples of `Subject` and nullable transformation function, discriminated with `kind` property. Created via 2-ary constructor function that allows strict, granular control over the transformation function definition.

- `Effects` - given `Store` and `Event`(s) references `Effect` will listen on event emissions and trigger side effects. If a tuple of event and transformation function is provided as a 2-nd argument effect will also run the transformation on source event payload and dispatch the result to the target event stream (second element of the aforementioned tuple).

- `Selectors` - Store projections created with custom RxJS `select` operator. Selectors are memoized, values are compared using [deep-is](https://www.npmjs.com/package/deep-is) algorithm. 

### Installation

```
npm i @tanfonto/storx2
```

or

```
yarn add @tanfonto/storx2
```

### API

- `Store` creation

```typescript
import { Store, EventStream, Effect, select } from '@tanfonto/storx2';
import { skip } from 'rxjs/operators';

const eventStream = EventStream('some-event');
const otherEventStream = EventStream('other-event');

const store = Store({ prop: 42 }, eventStream, otherEventStream);
```

- Dispatching events

```typescript
store.allEvents.subscribe(ev => {
  console.log(ev);
  // { kind: 'some-event',  status: 'successful' }
});

store.dispatch(eventStream);
```

- Dispatching state updates

```typescript
const effectfulEventStream = EventStream('update-prop', {
  //where to find state slice to transform
  select: state => state.prop,
  //how to update the state
  write: (state, patch) => ({ ...state, prop: patch }),
  //how to transform previous value
  xf: (value, patch) => value + patch
});

store.state.subscribe(state => {
  console.log(state.prop);
  // 50
});

store.dispatch(effectfulEventStream, 8);
```

- Reading current state

```typescript
console.log(store.valueOf());
// { prop: 50 }
```

- Reading current state and last update-causing event

```typescript
import { withReason } from '@tanfonto/storx';

withReason(store).subscribe([ state, event ] => {
  console.log(state, event);
  // { prop: 50 } { kind: 'update-prop',  status: 'successful', patch: 8 }
}) 

```

- `Effects` creation

```typescript
const makeEffect = Effect(store);
makeEffect(eventStream, (state, patch) => {
  console.log(state, patch);
  // { prop: 50 } 42
});

store.dispatch(eventStream, 42);
```

- Chained `Effects` creation

```typescript
const makeEffect = Effect(store);
makeEffect(eventStream, [otherEventStream, (_state, patch) => patch]);

store.allEvents.pipe(skip(1)).subscribe(ev => {
  console.log(ev);
  // { kind: 'other-event', status: 'successful', patch: 42 }
});

store.dispatch(eventStream, 42);
```

- Selectors (`select` operator)

```typescript
  store.state.pipe(select(x => x.prop))
    .subscribe(x => {
      console.log(x)
      //42, 9001 [selectors are memoized therefore second dispatch will not emit] 
    });

  store.dispatch(eventStream, 42);
  store.dispatch(eventStream, 42);
  store.dispatch(eventStream, 9001);
});

store.dispatch(eventStream, 42);
```

### Examples

- Using with `Angular`: check [this stackblitz](https://stackblitz.com/edit/angular-gh6ps3) 

### License

MIT
    
