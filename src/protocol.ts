/**
 * Value-Transformation Filter.
 */
export interface IFilter {
    /**
     * Transforms a value.
     *
     * @param value
     * Value for transformation.
     *
     * @param args
     * Arguments passed into the filter as ': val1 : val2'.
     *
     * By default, each argument is HTML-decoded, unless override
     * `decodeArguments` is implemented.
     *
     * @example
     * `${property | filter : -123.45 : Hello World! }`
     * // args = ['-123.45', 'Hello World!']
     */
    transform(value: any, args: string[]): any;

    /**
     * Optional override for arguments decoding.
     *
     * By default, all HTML-encoded symbols inside arguments are automatically decoded
     * before they are passed into `transform`. And adding this method overrides that.
     *
     * This is mainly for filters designed to handle HTML inside their arguments.
     *
     * @param args
     * Raw text arguments that may contain HTML-encoded symbols.
     *
     * @returns
     * List of arguments to be passed into `transform`.
     *
     * @example
     * The example below replicates the default behavior, i.e., implementing
     * it like this is the same as not having this method at all.
     *
     * ```ts
     * import {decodeFilterArg} from 'custom-string-format';
     *
     * decodeArguments(args: string[]): string {
     *     return args.map(decodeFilterArg);
     * }
     * ```
     */
    decodeArguments?(args: string[]): string[];
}

/**
 * Base formatting interface.
 */
export interface IFormatter {
    /**
     * Formats any value, according to its type.
     */
    format(value: any): string;

    /**
     * Optional override to produce a default value whenever the target
     * property does not exist. This will prevent throwing an error, which
     * is not the safest approach.
     *
     * @param prop
     * Name of the property that failed to resolve the value (it does not exist).
     *
     * @param params
     * Parameter object that the property was being resolved against.
     */
    getDefaultValue?(prop: string, params: { [key: string]: any }): any;

    /**
     * Optional override for when a filter cannot be found, to provide
     * an alternative filter. When no alternative can be provided, the
     * function should return `undefined` / `null`, for the parser to
     * default to throwing an error.
     *
     * Usage Scenarios:
     *
     *  - Support for filter aliases when multiple filter names must be
     *     resolved into one filter.
     *  - Support for dynamic filters. For example, to lazy-load filters
     *     and add them to the list upon first use.
     *
     * @param filter
     * Filter Name.
     *
     * @param args
     * Raw filter arguments (not decoded).
     *
     * @returns
     * An alternative filter, or nothing (if no alternative filter can be provided).
     */
    getDefaultFilter?(filter: string, args: string[]): IFilter | undefined;

    /**
     * Optional set of filters.
     *
     * When the parser cannot find a filter by name in this map, it will use
     *  the `getDefaultFilter` method when such is provided.
     */
    filters?: { [name: string]: IFilter };
}
