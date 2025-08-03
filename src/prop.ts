export interface IProperty {
    /**
     * Indicates if the property exists.
     */
    exists: boolean;

    /**
     * The resolved value, set when 'exists' = true
     */
    value?: any;
}

/**
 * Parses a property name and resolves the value from an object.
 *
 * TODO: This needs to support `this`
 *
 * @param obj
 * @param prop
 */
export function resolveProperty(obj: { [key: string]: any }, prop: string): IProperty {
    // const names = prop.split('.').filter(a => a);
    /*
    if (names.length) {
        let i = 0, result = obj;
        for (const [key, value] of Object.entries(obj)) {
            if (!i && key === 'this') {
                continue;
            }
            result = value;
        }
    }*/
    return {exists: false};
}

/*
/////////////////////////////////////////////////////////////////////////
// Checks if the property exists in the object or value or its prototype;
function hasProperty(value, prop) {
    return (value && typeof value === 'object' && prop in value) ||
        value !== null && value !== undefined && value[prop] !== undefined;
}*/
