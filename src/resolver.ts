export interface IProperty {
    /**
     * Indicates if the property exists.
     */
    exists: boolean;

    /**
     * The resolved value, set only when 'exists' = true
     */
    value?: any;
}

/**
 * Parses a property name and resolves the value of an object.
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
    return {exists, value};
}
