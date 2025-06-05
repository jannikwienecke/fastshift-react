import { UiViewConfig } from '../config.store';
import { ViewRegistryEntry } from './config.types';
import { MakeDetailPropsOption } from './ui.types';
import { ViewConfigType } from './view-config.types';

/**
 * Type definition for the components that can be added to a view registry entry
 */
export interface ViewRegistryComponents {
  /** Main view component (typically the list view) */
  main?: (props: { isSubView?: boolean }) => React.ReactNode;
  /** Detail view component */
  detail?: (options: MakeDetailPropsOption) => React.ReactNode;
  /** Overview component for detail view */
  overView?: (options: MakeDetailPropsOption) => React.ReactNode;
}

/**
 * Type definition for the fluent interface returned by addView method
 */
export interface ViewRegistryBuilder {
  /** Add React components for the view */
  addComponents: (components: ViewRegistryComponents) => ViewRegistryBuilder;
  /** Add UI configuration for the view */
  addUiConfig: (uiViewConfig: UiViewConfig) => ViewRegistryBuilder;
}

/**
 * Type definition for the view registry object
 */
export interface ViewRegistry {
  /**
   * Add a view configuration to the registry
   * @param config - The view configuration
   * @returns A builder object to chain additional configurations
   */
  addView: <T extends ViewConfigType>(config: T) => ViewRegistryBuilder;

  /**
   * Get a view registry entry by name
   * @param name - The view name, table name, or view name (case insensitive)
   * @returns The view registry entry containing view config and components
   */
  getView: (name: string) => ViewRegistryEntry;

  /**
   * Get all views in the registry
   * @returns Record of all view registry entries keyed by lowercase view name
   */
  getViews: () => Record<string, ViewRegistryEntry>;
}
