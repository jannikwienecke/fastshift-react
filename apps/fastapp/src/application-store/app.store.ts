import { observable } from '@legendapp/state';

export const resettingDb$ = observable(false);

// const viewsConfigStore = observable<{
//   [key: string]: {
//     main?: () => React.ReactNode;
//     detail?: (options: MakeDetailPropsOption) => React.ReactNode;
//     viewConfig: ViewConfigType;
//     uiViewConfig?: UiViewConfig;
//   };
// }>({});

// const addView = (config: ViewConfigType) => {
//   _log.debug('viewsConfigStore:addView', config.viewName);

//   viewsConfigStore.set({
//     ...viewsConfigStore.get(),
//     [config.viewName.toLowerCase()]: { viewConfig: config },
//   });

//   const addComponents = (components: {
//     main?: () => React.ReactNode;
//     detail?: (options: MakeDetailPropsOption) => React.ReactNode;
//   }) => {
//     viewsConfigStore.set({
//       ...viewsConfigStore.get(),
//       [config.viewName.toLowerCase()]: {
//         ...viewsConfigStore.get()[config.viewName.toLowerCase()],
//         ...components,
//       },
//     });
//     return storeFn;
//   };

//   const addUiConfig = (uiViewConfig: UiViewConfig) => {
//     viewsConfigStore.set({
//       ...viewsConfigStore.get(),
//       [config.viewName.toLowerCase()]: {
//         ...viewsConfigStore.get()[config.viewName.toLowerCase()],
//         uiViewConfig,
//       },
//     });
//     return storeFn;
//   };

//   const storeFn = {
//     addComponents,
//     addUiConfig,
//   };

//   return storeFn;
// };

// const getView = (name: string) => {
//   return viewsConfigStore.get()[name.toLowerCase()];
// };

// const getViews = () => {
//   return viewsConfigStore.get();
// };

// export const viewRegistry = {
//   addView,
//   getView,
//   getViews,
// };
