import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/display-options')({
  component: () => <DisplayOptions />,
});

const DisplayOptions = () => {
  return <>sorting</>;
};
