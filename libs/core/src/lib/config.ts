import { BaseConfigInterface } from './types';

export class BaseConfig<
  T extends Record<string, any>,
  Tables,
  TTest extends Record<string, any>
> {
  constructor(public config: BaseConfigInterface<T, Tables, TTest>) {}

  getAllTables() {
    return this.config.tableNames;
  }
}
