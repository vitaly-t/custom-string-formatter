import {IFormatter} from './protocol';
import {resolveProperty} from './resolver';

const regEx = new RegExp(/\$(?:({)|(\()|(<))\s*([\w$.]+)((\s*\|\s*[\w$]*(\s*:\s*[^|:{}\[\]<>()]*)*)*)\s*(?:(?=\2)(?=\3)}|(?=\1)(?=\3)\)|(?=\1)(?=\2)>)/g);

/**
 * Returns a function that formats a strings from an object-parameter, and according to the specified configurator.
 */
export function createFormatter(base: IFormatter) {
    return function (text: string, params: { [key: string]: any }) {
        return text.replace(regEx, (...args: string[]) => {
            const prop = args[4]; // property name
            const filters = args[5]; // filters, if specified
            let {exists, value} = resolveProperty(prop, params);
            if (!exists) {
                if (typeof base.getDefaultValue !== 'function') {
                    throw new Error(`Property ${JSON.stringify(prop)} does not exist`);
                }
                value = base.getDefaultValue(prop, params);
            }
            if (filters) {
                value = filters
                    .split('|')
                    .map(a => a.trim())
                    .filter(a => a)
                    .reduce((p, c) => {
                        const [fName, ...args] = c.split(':').map(a => a.trim());
                        let f = base.filters?.[fName];
                        if (!f && typeof base.getDefaultFilter === 'function') {
                            f = base.getDefaultFilter(fName, args);
                        }
                        if (!f) {
                            throw new Error(`Filter ${JSON.stringify(fName)} not recognized`);
                        }
                        return f.transform(p, args);
                    }, value);
            }
            return base.format(value);
        });
    }
}

/**
 * A fast check if a string has variables in it.
 */
export function hasVariables(text: string): boolean {
    return text.search(regEx) >= 0;
}

/**
 * A fast count of variables in a string.
 */
export function countVariables(text: string): number {
    return text.match(regEx)?.length ?? 0;
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
     * Extracted filters with arguments.
     */
    filters: Array<{ name: string, args: string[] }>
}

/**
 * Enumerates and parses variables from a string, for any kind of reference analysis.
 *
 * @param text
 * Text string with variables.
 *
 * @returns IVariable[]
 * An array of matched variables (as descriptors)
 */
export function enumVariables(text: string): IVariable[] {
    return (text.match(regEx) || [])
        .map(m => {
            const a = m.match(/.\s*([\w$.]+)((\s*\|\s*[\w$]*(\s*:\s*[^}>)]*)*)*)/) as RegExpMatchArray;
            const filtersWithArgs = a[2] ? a[2].split('|').map(a => a.trim()).filter(a => a) : [];
            const filters = filtersWithArgs.map(a => {
                const [name, ...args] = a.split(':').map(b => b.trim());
                return {name, args};
            });
            return {match: m, property: a[1], filters};
        });
}
