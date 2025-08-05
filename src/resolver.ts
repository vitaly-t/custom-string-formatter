/**
 * Result of calling function `resolveProperty` below,
 * to indicate success + value for the property resolution.
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

/**
 * Parses a nested property name and resolves it from the object.
 *
 * It supports `this` as the first name to reference the object itself.
 */
export function resolveProperty(obj: { [key: string]: any }, prop: string): IProperty {
    const names = prop.split('.').filter(a => a);
    let exists = false, value = obj;
    for (const [i, n] of names.entries()) {
        if (!i && n === 'this') {
            exists = true;
            continue;
        }
        if (value === null || value === undefined || !(n in value)) {
            return {exists: false};
        }
        exists = true;
        value = value[n];
    }
    return exists ? {exists, value} : {exists};
}
