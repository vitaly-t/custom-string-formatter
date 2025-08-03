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
 * Formatting Configuration interface.
 */
export interface IFormattingConfig {
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
     * @param text
     * Name of the property that failed to resolve value (it does not exist).
     *
     * @param params
     * Parameter object that the property was being resolved against.
     */
    getDefaultValue?(text: string, params: { [key: string]: any }): any;

    /**
     * Optional set of formatting filters that override default formatting.
     */
    filters?: { [name: string]: IFormattingFilter };
}
