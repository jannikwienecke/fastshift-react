import { createFileRoute } from '@tanstack/react-router';

import { observable } from '@legendapp/state';
import { observer, reactive, useObservable } from '@legendapp/state/react';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import React from 'react';
import { convexQuery, ConvexQueryClient } from '@convex-dev/react-query';
import { api } from '@apps-next/convex';
import { useQuery } from '@tanstack/react-query';
import { syncedQuery } from '@legendapp/state/sync-plugins/tanstack-query';
// import { state$ } from '../main';

// Type your Store interface
interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

interface Store {
  user: {
    name: string;
  };
  todos: Todo[];
  total: number;
  numCompleted: number;
  addTodo: () => void;
  toggleCompleteTodo: (id: number, completed: boolean) => void;
}

const store$ = observable<Store>({
  user: {
    name: 'John Doe',
  },
  todos: [],
  // Computeds
  total: (): number => {
    return store$.todos.length;
  },
  numCompleted: (): number => {
    console.log('numCompleted', store$.todos.get());
    return store$.todos.get().filter((todo) => todo.completed).length;
  },
  addTodo: () => {
    const todo: Todo = {
      id: store$.todos.length + 1,
      text: 'Todo ' + store$.todos.length,
    };
    store$.todos.push(todo);
  },
  toggleCompleteTodo: (id: number, completed: boolean) => {
    const todo = store$.todos.get().findIndex((todo) => todo.id === id);
    store$.todos[todo].completed.set(completed);
  },
});

const name$ = observable('');
const uppercaseName$ = observable(() => name$.get().toUpperCase());

// syncObservable(store$, {
//   persist: {
//     name: 'todoStore',
//     plugin: ObservablePersistLocalStorage,
//   },
// });

const Legend = observer(() => {
  return (
    <div>
      <div>Legend</div>
      <input value={name$.get()} onChange={(e) => name$.set(e.target.value)} />
      <div>Uppercase Name: {uppercaseName$.get()}</div>
      <Total />

      <Todos />

      <Completed />

      <State />

      <button onClick={() => store$.addTodo()}>Add Todo</button>
    </div>
  );
});

const Todos = observer(() => {
  console.log('RENDER TODOS');
  return (
    <div>
      <div>Todos</div>
      {store$.todos.get().map((todo) => (
        <div key={todo.id}>
          <div>{todo.text}</div>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => {
              console.log('==');
              store$.toggleCompleteTodo(todo.id, e.target.checked);
            }}
          />
        </div>
      ))}
    </div>
  );
});

const Total = observer(() => {
  console.log('RENDER TOTAL');
  return <div>Total {store$.total.get()}</div>;
});

const Completed = observer(() => {
  console.log('Render Completed');
  return <div>Completed {store$.numCompleted.get()}</div>;
});

const State = observer(() => {
  //   console.log(state$.get().relationalData);
  return <div>STATE</div>;
});

export const Route = createFileRoute('/legend')({
  component: Legend,
});
