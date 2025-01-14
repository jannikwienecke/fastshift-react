import { api } from '@apps-next/convex';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/display-options')({
  component: () => <DisplayOptions />,
});

const DisplayOptions = () => {
  const { data } = useQuery(convexQuery(api.query.displayOptions, {}));
  return <>sorting</>;
};
