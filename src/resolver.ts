/**
 * Result of calling function `resolveProperty` below,
 * to indicate success+value for the property resolution.
 */
export interface IProperty {
    /**
     * Indicates if the property exists on the object.
     */
    exists: boolean;

    /**
     * The resolved value, set only when 'exists' = true
     */
    value?: any;
}
