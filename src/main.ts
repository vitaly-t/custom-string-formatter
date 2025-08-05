import {IFormatter} from './protocol';
import {resolveProperty} from './resolver';

const regEx = new RegExp(/\$(?:({)|(\()|(<)|(\[)|(\/))\s*([\w$.]+)\s*(:\s*([\w\$]*)\s*)?\s*(?:(?=\2)(?=\3)(?=\4)(?=\5)}|(?=\1)(?=\3)(?=\4)(?=\5)\)|(?=\1)(?=\2)(?=\4)(?=\5)>|(?=\1)(?=\2)(?=\3)(?=\5)]|(?=\1)(?=\2)(?=\3)(?=\4)\/)/g);

/**
 * Returns a function that formats strings according to the specified configurator.
 */
export function createFormatter(base: IFormatter) {
    return function (text: string, params: { [key: string]: any }) {
        return text.replace(regEx, (...args: string[]) => {
            const prop = args[6]; // property name
            const filter = args[8]; // filter, if specified
            const res = resolveProperty(prop, params);
            if (!res.exists) {
                if (typeof base.getDefaultValue !== 'function') {
                    throw new Error(`Property ${JSON.stringify(prop)} does not exist`);
                }
                res.value = base.getDefaultValue(prop, params);
            }
            if (filter) {
                let f = base.filters?.[filter];
                if (!f) {
                    if (typeof base.getDefaultFilter === 'function') {
                        f = base.getDefaultFilter(filter);
                        if (f) {
                            return f.format(res.value);
                        }
                    }
                    throw new Error(`Filter ${JSON.stringify(filter)} not recognized`);
                }
                return f.format(res.value);
            }
            return base.format(res.value);
        });
    }
}

/**
 * Variable descriptor, as returned from `enumVariables` function.
 */
export interface IVariable {

    /**
     * Exact enumeration match for the variable.
     */
    match: string;

    /**
     * Extracted property name.
     */
    property: string;

    /**
     * Extracted filter name, if specified.
     */
    filter?: string;
}

/**
 * Enumerates variables from a string, for any kind of reference analysis.
 *
 * @param text
 * Text string that contains variables.
 *
 * @returns IVariable[]
 * An array of matched variables (as descriptors)
 */
export function enumVariables(text: string): IVariable[] {
    return (text.match(regEx) || [])
        .map(m => {
            const a = m.match(/\$.\s*([\w$.]+)\s*(:\s*([\w$]+))?/) || [];
            const result: IVariable = {match: m, property: a[1]};
            if (a[3]) {
                result.filter = a[3];
            }
            return result;
        });
}
