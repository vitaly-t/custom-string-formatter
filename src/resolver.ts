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
     * The resolved value, set only when 'exists' = true.
     */
    value?: any;

    /**
     * Container for the resolved property - value/property immediately preceding it (in the resolution chain).
     *
     * It is set only when 'exists' = true.
     */
    parent?: any;
}

/**
 * Parses a property and resolves its value from an object.
 *
 * It supports `this` as the first name to reference the object itself.
 */
export function resolveProperty(prop: string, obj: { [key: string]: any }): IProperty {
    const names = prop.split('.').filter(a => a);
    let exists = false, value = obj, parent = undefined;
    for (const [i, n] of names.entries()) {
        if (!i && n === 'this') {
            exists = true;
            continue;
        }
        if (value === null || value === undefined || !(n in value)) {
            return {exists: false};
        }
        exists = true;
        parent = value;
        value = value[n];
    }
    return exists ? {exists, value, parent} : {exists};
}
