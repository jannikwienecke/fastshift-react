import { GetTableName } from '@apps-next/core';

/**
 * The arguments array for a function that takes arguments.
 *
 * This is an array of a single {@link DefaultFunctionArgs} element.
 */
type OneArgArray<ArgsObject extends DefaultFunctionArgs = DefaultFunctionArgs> =
  [ArgsObject];

/**
 * The arguments to a function that takes no arguments (just an empty array).
 */
type NoArgsArray = [];

/**
 * An array of arguments to a Convex function.
 *
 * Convex functions can take either a single {@link DefaultFunctionArgs} object or no
 * args at all.
 *
 * @public
 */
export type ArgsArray = OneArgArray | NoArgsArray;

/**
 * A type for the empty object `{}`.
 *
 * Note that we don't use `type EmptyObject = {}` because that matches every object.
 */
export type EmptyObject = Record<string, never>;

/**
 * Convert an {@link ArgsArray} into a single object type.
 *
 * Empty arguments arrays are converted to {@link EmptyObject}.
 * @public
 */
export type ArgsArrayToObject<Args extends ArgsArray> =
  Args extends OneArgArray<infer ArgsObject> ? ArgsObject : EmptyObject;

/**
 * A type representing the visibility of a Convex function.
 *
 * @public
 */
export type FunctionVisibility = 'public' | 'internal';

/**
 * Given a {@link FunctionVisibility}, should this function have `isPublic: true`
 * or `isInternal: true`?
 */
type VisibilityProperties<Visiblity extends FunctionVisibility> =
  Visiblity extends 'public'
    ? {
        isPublic: true;
      }
    : {
        isInternal: true;
      };

/**
 * A mutation function that is part of this app.
 *
 * You can create a mutation by wrapping your function in
 * {@link mutationGeneric} or {@link internalMutationGeneric} and exporting it.
 *
 * @public
 */
export type RegisteredMutation<
  Visibility extends FunctionVisibility,
  Args extends DefaultFunctionArgs,
  Returns
> = {
  (ctx: any, args: Args): Returns;

  isConvexFunction: true;
  isMutation: true;
  isRegistered?: true;

  /** @internal */
  invokeMutation(argsStr: string): Promise<string>;

  /** @internal */
  exportArgs(): string;

  /** @internal */
  exportReturns(): string;
} & VisibilityProperties<Visibility>;

/**
 * A query function that is part of this app.
 *
 * You can create a query by wrapping your function in
 * {@link queryGeneric} or {@link internalQueryGeneric} and exporting it.
 *
 * @public
 */
export type RegisteredQuery<
  Visibility extends FunctionVisibility = 'public',
  Args extends DefaultFunctionArgs = any,
  Returns = any
> = {
  (ctx: any, args: Args): Returns;

  isConvexFunction: true;
  isQuery: true;
  isRegistered?: true;

  /** @internal */
  invokeQuery(argsStr: string): Promise<string>;

  /** @internal */
  exportArgs(): string;

  /** @internal */
  exportReturns(): string;
} & VisibilityProperties<Visibility>;

export type Value =
  | null
  | bigint
  | number
  | boolean
  | string
  | ArrayBuffer
  | Value[]
  | { [key: string]: undefined | Value };

/**
 * A document stored in Convex.
 * @public
 */
export type GenericDocument = Record<string, Value>;

/**
 * A type describing all of the document fields in a table.
 *
 * These can either be field names (like "name") or references to fields on
 * nested objects (like "properties.name").
 * @public
 */
export type GenericFieldPaths = string;

// Index Types  ///////////////////////////////////////////////////////////////

/**
 * A type describing the ordered fields in an index.
 *
 * These can either be field names (like "name") or references to fields on
 * nested objects (like "properties.name").
 * @public
 */
export type GenericIndexFields = string[];

/**
 * A type describing the indexes in a table.
 *
 * It's an object mapping each index name to the fields in the index.
 * @public
 */
export type GenericTableIndexes = Record<string, GenericIndexFields>;

/**
 * A type describing the configuration of a search index.
 * @public
 */
export type GenericSearchIndexConfig = {
  searchField: string;
  filterFields: string;
};

/**
 * A type describing all of the search indexes in a table.
 *
 * This is an object mapping each index name to the config for the index.
 * @public
 */
export type GenericTableSearchIndexes = Record<
  string,
  GenericSearchIndexConfig
>;

/**
 * A type describing the configuration of a vector index.
 * @public
 */
export type GenericVectorIndexConfig = {
  vectorField: string;
  dimensions: number;
  filterFields: string;
};

/**
 * A type describing all of the vector indexes in a table.
 *
 * This is an object mapping each index name to the config for the index.
 * @public
 */
export type GenericTableVectorIndexes = Record<
  string,
  GenericVectorIndexConfig
>;

export type GenericTableInfo = {
  document: GenericDocument;
  fieldPaths: GenericFieldPaths;
  indexes: GenericTableIndexes;
  searchIndexes: GenericTableSearchIndexes;
  vectorIndexes: GenericTableVectorIndexes;
};

export type GenericDataModel = Record<string, GenericTableInfo>;

/**
 * A {@link GenericDataModel} that considers documents to be `any` and does not
 * support indexes.
 *
 * This is the default before a schema is defined.
 * @public
 */
export type AnyDataModel = {
  [tableName: string]: {
    document: any;
    fieldPaths: GenericFieldPaths;
    // eslint-disable-next-line @typescript-eslint/ban-types
    indexes: {};
    // eslint-disable-next-line @typescript-eslint/ban-types
    searchIndexes: {};
    // eslint-disable-next-line @typescript-eslint/ban-types
    vectorIndexes: {};
  };
};

export type Id<TableName extends string> = string & { __tableName: TableName };

export type QueryBuilder<DataModel, Visibility> = {
  (
    query:
      | {
          /**
           * Argument validation.
           *
           * Examples:
           *
           * ```
           * args: {}
           * args: { input: v.optional(v.number()) }
           * args: { message: v.string(), author: v.id("authors") }
           * args: { messages: v.array(v.string()) }
           * ```
           */
          args?: Record<string, any>;
          /**
           * The return value validator.
           *
           * Examples:
           *
           * ```
           * returns: v.null()
           * returns: v.string()
           * returns: { message: v.string(), author: v.id("authors") }
           * returns: v.array(v.string())
           * ```
           */
          returns?: any;
          /**
           * The implementation of this function.
           *
           * This is a function that takes in the appropriate context and arguments
           * and produces some result.
           *
           * @param ctx - The context object. This is one of {@link QueryCtx},
           * {@link MutationCtx}, or {@link ActionCtx} depending on the function type.
           * @param args - The arguments object for this function. This will match
           * the type defined by the argument validator if provided.
           * @returns
           */
          handler: (ctx: GenericQueryCtx, ...args: any) => any;
        }
      | {
          (ctx: GenericQueryCtx, ...args: any): any;
        }
  ): RegisteredQuery<'public', any, any>;
};

export interface GenericQueryCtx {
  /**
   * A utility for reading data in the database.
   */
  db: any;

  /**
   * Information about the currently authenticated user.
   */
  auth: any;

  /**
   * A utility for reading files in storage.
   */
  storage: any;

  /**
   * @internal
   */
  runQuery?: (query: any, ...args: any) => Promise<any>;
}

export interface GenericMutationCtx {
  /**
   * A utility for reading and writing data in the database.
   */
  db: any;

  /**
   * Information about the currently authenticated user.
   */
  auth: any;

  /**
   * A utility for reading and writing files in storage.
   */
  storage: any;

  /**
   * A utility for scheduling Convex functions to run in the future.
   */
  scheduler: any;

  /**
   * @internal
   */
  runQuery: any;

  /**
   * @internal
   */
  runMutation: any;
}

export type DefaultFunctionArgs = Record<string, unknown>;

export type FunctionType = 'query' | 'mutation' | 'action';

export type FunctionReference<
  Type extends FunctionType,
  Visibility extends FunctionVisibility = 'public',
  Args extends DefaultFunctionArgs = any,
  ReturnType = any,
  ComponentPath = string | undefined
> = {
  _type: Type;
  _visibility: Visibility;
  _args: Args;
  _returnType: ReturnType;
  _componentPath: ComponentPath;
};

/**
 * The types of {@link Value} that can be used to represent numbers.
 *
 * @public
 */
export type NumericValue = bigint | number;

export abstract class Expression<T extends Value | undefined> {
  // Property for nominal type support.
  private _isExpression: undefined;

  // Property to distinguish expressions by the type they resolve to.
  private _value!: T;

  /**
   * @internal
   */
  constructor() {
    // only defining the constructor so we can mark it as internal and keep
    // it out of the docs.
  }
}

/**
 * An {@link Expression} or a constant {@link values.Value}
 *
 * @public
 */
export type ExpressionOrValue<T extends Value | undefined> = Expression<T> | T;

export interface FilterBuilder<TableInfo = any> {
  //  Comparisons  /////////////////////////////////////////////////////////////

  /**
   * `l === r`
   *
   * @public
   * */
  eq<T extends Value | undefined>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<boolean>;

  /**
   * `l !== r`
   *
   * @public
   * */
  neq<T extends Value | undefined>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<boolean>;

  /**
   * `l < r`
   *
   * @public
   */
  lt<T extends Value>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<boolean>;

  /**
   * `l <= r`
   *
   * @public
   */
  lte<T extends Value>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<boolean>;

  /**
   * `l > r`
   *
   * @public
   */
  gt<T extends Value>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<boolean>;

  /**
   * `l >= r`
   *
   * @public
   */
  gte<T extends Value>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<boolean>;

  //  Arithmetic  //////////////////////////////////////////////////////////////

  /**
   * `l + r`
   *
   * @public
   */
  add<T extends NumericValue>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<T>;

  /**
   * `l - r`
   *
   * @public
   */
  sub<T extends NumericValue>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<T>;

  /**
   * `l * r`
   *
   * @public
   */
  mul<T extends NumericValue>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<T>;

  /**
   * `l / r`
   *
   * @public
   */
  div<T extends NumericValue>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<T>;

  /**
   * `l % r`
   *
   * @public
   */
  mod<T extends NumericValue>(
    l: ExpressionOrValue<T>,
    r: ExpressionOrValue<T>
  ): Expression<T>;

  /**
   * `-x`
   *
   * @public
   */
  neg<T extends NumericValue>(x: ExpressionOrValue<T>): Expression<T>;

  //  Logic  ///////////////////////////////////////////////////////////////////

  /**
   * `exprs[0] && exprs[1] && ... && exprs[n]`
   *
   * @public
   */
  and(...exprs: Array<ExpressionOrValue<boolean>>): Expression<boolean>;

  /**
   * `exprs[0] || exprs[1] || ... || exprs[n]`
   *
   * @public
   */
  or(...exprs: Array<ExpressionOrValue<boolean>>): Expression<boolean>;

  /**
   * `!x`
   *
   * @public
   */
  not(x: ExpressionOrValue<boolean>): Expression<boolean>;

  //  Other  ///////////////////////////////////////////////////////////////////

  /**
   * Evaluates to the field at the given `fieldPath`.
   *
   * For example, in {@link OrderedQuery.filter} this can be used to examine the values being filtered.
   *
   * #### Example
   *
   * On this object:
   * ```
   * {
   *   "user": {
   *     "isActive": true
   *   }
   * }
   * ```
   *
   * `field("user.isActive")` evaluates to `true`.
   *
   * @public
   */
  field: any;
}

export abstract class SearchFilter {
  // Property for nominal type support.
  private _isSearchFilter: undefined;

  /**
   * @internal
   */
  constructor() {
    // only defining the constructor so we can mark it as internal and keep
    // it out of the docs.
  }
}

export interface QueryInitializer {
  /**
   * Query by reading all of the values out of this table.
   *
   * This query's cost is relative to the size of the entire table, so this
   * should only be used on tables that will stay very small (say between a few
   * hundred and a few thousand documents) and are updated infrequently.
   *
   * @returns - The {@link Query} that iterates over every document of the table.
   */
  fullTableScan(): any;

  /**
   * Query by reading documents from an index on this table.
   *
   * This query's cost is relative to the number of documents that match the
   * index range expression.
   *
   * Results will be returned in index order.
   *
   * To learn about indexes, see [Indexes](https://docs.convex.dev/using/indexes).
   *
   * @param indexName - The name of the index to query.
   * @param indexRange - An optional index range constructed with the supplied
   *  {@link IndexRangeBuilder}. An index range is a description of which
   * documents Convex should consider when running the query. If no index
   * range is present, the query will consider all documents in the index.
   * @returns - The query that yields documents in the index.
   */
  withIndex(indexName: string, indexRange?: any): any;

  /**
   * Query by running a full text search against a search index.
   *
   * Search queries must always search for some text within the index's
   * `searchField`. This query can optionally add equality filters for any
   * `filterFields` specified in the index.
   *
   * Documents will be returned in relevance order based on how well they
   * match the search text.
   *
   * To learn about full text search, see [Indexes](https://docs.convex.dev/text-search).
   *
   * @param indexName - The name of the search index to query.
   * @param searchFilter - A search filter expression constructed with the
   * supplied {@link SearchFilterBuilder}. This defines the full text search to run
   * along with equality filtering to run within the search index.
   * @returns - A query that searches for matching documents, returning them
   * in relevancy order.
   */
  withSearchIndex(
    indexName: string,
    searchFilter: (q: FilterBuilder) => SearchFilter
  ): any;
  /**
   * The number of documents in the table.
   *
   * @internal
   */
  count(): Promise<number>;
}
