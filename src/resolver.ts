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

/**
 * Parses a property and resolves its value from an object.
 *
 * It supports `this` as the first name to reference the object itself.
 */
export function resolveProperty(path: string, obj: { [key: string]: any }): IProperty {
    let names: string[] = [];
    if (path.indexOf('[') > 0) {
        // verbose syntax that needs tokenization;
        const reg = /\[\s*(-*\d+)(?=\s*])|\[\s*(["'])((?:\\.|(?!\2).)*)\2\s*]|[-\w$]+/g;
        let a;
        while (a = reg.exec(path)) {
            names.push(a[1] || a[3] || a[0]);
        }
    } else {
        names = path.split('.').filter(a => a);
    }
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
