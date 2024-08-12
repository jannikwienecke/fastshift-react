import { add } from '@fastapp/core';

export function App() {
  const result = add(1, 2);

  return <div className="bg-red-100">Vite + Nx {result}</div>;
}

export default App;
