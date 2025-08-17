/**
 * Value-Transformation Filter / Pipe
 *
 * It takes the current value and then transforms / pipes it into the next filter
 * in the chain (or the formatter, if last in the chain).
 */
export interface IFilter<T = any, R = any> {
    /**
     * Transforms a value, to be piped into the next filter.
     *
     * @param value
     * Value for transformation.
     *
     * @param args
     * Arguments passed into the filter as `: val1 : val2`.
     *
     * By default, each argument is HTML-decoded, unless override
     * {@link decodeArguments} is implemented.
     *
     * @returns
     * Result of the value transformation.
     *
     * @example
     * import {IFilter} from 'custom-string-formatter';
     *
     * class JsonFilter implements IFilter {
     *     transform(value: any, args: string[]): any {
     *         return JSON.stringify(value); // transform into a JSON string
     *     }
     * }
     *
     * @example
     * // Since property `IFormatter.filters` uses interfaces,
     * // creating IFilter-based classes is not necessary:
     *
     * // simple object with an arrow function:
     * const json = {transform: (value: any) => JSON.stringify(value)};
     *
     * // or, as an object with a normal function:
     * const json = {
     *      transform(value: any) => {
     *          return JSON.stringify(value);
     *      }
     * };
     *
     * // Both approaches will work the same as the example above.
     */
    transform(value: T, args: string[]): R;

    /**
     * Optional override for arguments decoding.
     *
     * By default, all HTML-encoded symbols inside arguments are automatically decoded
     * before they are passed into {@link transform}. And adding this method overrides that.
     *
     * If your filter takes arguments for which no decoding will ever be needed,
     * adding this override to simply return the original arguments will improve the filter's performance.
     *
     * Another reason for overriding it - force removal of accents (diacritical marks) during decoding,
     * which function {@link decodeFilterArg} supports as an option.
     *
     * @param args
     * Raw text arguments that may contain HTML-encoded symbols, using notations:
     *  - `&#123;` - decimal symbol code (1-6 digits);
     *  - `&#x1a3;` - hexadecimal symbol code (1-5 hex digits, case-insensitive);
     *
     * @returns
     * List of arguments to be passed into {@link transform}.
     *
     * @example
     * // The example below replicates the default argument decoding, i.e.,
     * // implementing decodeArguments like this is the same as not having it at all.
     *
     * import {IFilter} from 'custom-string-formatter';
     *
     * class MyFilter implements IFilter {
     *     decodeArguments(args: string[]): string[] {
     *         return args.map(a => decodeFilterArg(a)); // decoding all arguments
     *     }
     * }
     *
     * @example
     * // This filter encodes all arguments and removes accents (diacritical marks) from letters.
     *
     * import {IFilter} from 'custom-string-formatter';
     *
     * class MyFilter implements IFilter {
     *     decodeArguments(args: string[]): string[] {
     *         // decoding all arguments, plus removing accents:
     *         return args.map(a => decodeFilterArg(a, true));
     *     }
     * }
     */
    decodeArguments?(args: string[]): string[];
}

/**
 * Base formatting interface.
 */
export interface IFormatter {
    /**
     * Formats any value, according to its type.
     *
     * @returns
     * Formatted string.
     *
     * @example
     * import {IFormatter} from 'custom-string-formatter';
     *
     * class BaseFormatter implements IFormatter {
     *     format(value: any): string {
     *         // your own value formatting here;
     *         return (value ?? 'null').toString();
     *     }
     * }
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
     *
     * @returns
     * Default value to be used whenever a property fails to be resolved.
     *
     * @example
     * import {IFormatter} from 'custom-string-formatter';
     *
     * class BaseFormatter implements IFormatter {
     *     getDefaultValue(prop: string, params: { [key: string]: any }) {
     *         // return whatever is to be the default for properties,
     *         // including nothing (undefined)
     *     }
     * }
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
     *
     * @example
     * // Example of aliasing a filter name to an existing filter;
     *
     * import {IFormatter} from 'custom-string-formatter';
     *
     * class BaseFormatter implements IFormatter {
     *     getDefaultFilter(filter: string, args: string[]): IFilter | undefined {
     *         if (filter === 'object' || filter === 'any') {
     *             return this.filters.json; // alias to another filter
     *         }
     *         // else nothing, to throw default error
     *     }
     *
     *     filters = {
     *         json: new JsonFilter()
     *     }
     * }
     */
    getDefaultFilter?(filter: string, args: string[]): IFilter | undefined;

    /**
     * Optional set of filters.
     *
     * When the parser cannot find a filter by name in this map, it will use
     *  the {@link getDefaultFilter} method when such is provided.
     *
     * You can add or delete filters in it at any point, thus allowing for
     * lazy-loading filters or any other dynamic scenario.
     */
    filters?: { [name: string]: IFilter };
}
