import { api } from '@apps-next/convex';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';

export const useUserViews = () => {
  const { data: allViews, refetch } = useQuery(
    convexQuery(api.query.getUserViews, {})
  );

  return {
    allViews,
    refetch,
  };
};
