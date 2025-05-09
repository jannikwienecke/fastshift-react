import { MainViewPage } from '../view-pom';
import { ViewName, ViewSlug } from './e2e.helper.types';

export type NavigationE2eHelper = {
  goToListView: (slug: ViewSlug) => Promise<void>;
  goToDetail: (slug: ViewSlug, name: string) => Promise<void>;
  goToDetailSubList: (
    slug: ViewSlug,
    name: string,
    subList: ViewName
  ) => Promise<void>;
};

export const makeNavigationHelper = ({ page, detailHeader }: MainViewPage) => {
  const BASE_PATH = '/fastApp';
  const OPTIONS = {
    timeout: 5000,
  };
  const goToListView: NavigationE2eHelper['goToListView'] = async (slug) => {
    await page.goto(`${BASE_PATH}/${slug}`, OPTIONS);
  };

  const goToDetail: NavigationE2eHelper['goToDetail'] = async (slug, name) => {
    await page.goto(`${BASE_PATH}/${slug}`, OPTIONS);

    await page.getByText(name).first().click();
  };

  const goToDetailSubList: NavigationE2eHelper['goToDetailSubList'] = async (
    slug,
    name,
    subList
  ) => {
    await goToDetail(slug, name);

    await detailHeader.getByText(subList).first().click({ force: true });
  };

  return { goToListView, goToDetail, goToDetailSubList };
};
