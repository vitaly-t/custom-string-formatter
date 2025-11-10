/**
 * Property-Resolution Context.
 *
 * @see {@link IFilter.transform}
 */
export interface IPropertyContext {
    /**
     * Full property path as specified in the variable.
     */
    path: string;

    /**
     * Container for the resolved value/property, immediately preceding it (in the resolution chain).
     *
     * For a simple property reference (not a nested one), the container is the formatting object itself.
     *
     * It is `undefined` when the property chain contains only `this` or when the property does not exist,
     * because in those cases there is no container.
     */
    parent?: any;
}

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
     * Property-Resolution Context.
     */
    ctx: IPropertyContext;

    /**
     * The resolved value, set only when 'exists' = true.
     */
    value?: any;
}

/**
 * Parses a property and resolves its value from an object.
 *
 * It supports `this` as the first name to reference the object itself.
 */
export function resolveProperty(path: string, obj: { [key: string]: any }): IProperty {
    const nameList = path.split('.').filter(a => a);
    let exists = false, value = obj;
    const ctx: IPropertyContext = {path, parent: undefined};
    for (const [i, n] of nameList.entries()) {
        if (!i && n === 'this') {
            exists = true;
            continue;
        }
        if (value === null || value === undefined || !(n in value)) {
            return {exists: false, ctx: {path, parent: undefined}};
        }
        exists = true;
        ctx.parent = value;
        value = value[n];
    }
    return exists ? {exists, value, ctx} : {exists, ctx};
}
