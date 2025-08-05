/**
 * Formatting Filter interface.
 */
export interface IFormattingFilter {
    /**
     * Takes any value and formats it according to the type and/or the filter logic.
     */
    format(value: any): string;
}

/**
 * Base formatting interface.
 */
export interface IFormatter {
    /**
     * Implements default formatting (when without a filter):
     *  - takes any value and formats it according to the type.
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
     *  1. Support for filter aliases when multiple filter names must be
     *     resolved into one filter.
     *  2. Support for dynamic filters. For example, to lazy-load filters
     *     and add them to the list upon first use.
     *  3. Support for composite filters names when a name may include
     *     parameters, like `gap_5`, to be parsed for extra data to be
     *     passed into the filter.
     *
     * @param filter
     * Filter Name.
     *
     * @returns
     * An alternative filter, or nothing (if no alternative filter can be provided).
     */
    getDefaultFilter?(filter: string): IFormattingFilter | undefined;

    /**
     * Optional set of formatting filters that override default formatting.
     *
     * When the parser cannot find a filter by name in this map, it will use
     *  the `getDefaultFilter` method when such is provided.
     */
    filters?: { [name: string]: IFormattingFilter };
}
