import { useParams } from '@tanstack/react-router';
import { getViewParms } from '../utils/app.helper';

export const useViewParams = () => {
  const paramsView = useParams({ from: '/fastApp/$view' });
  const paramsViewId = useParams({ strict: false });
  const viewParams = getViewParms({
    ...paramsView,
    ...paramsViewId,
  });

  return viewParams;
};
