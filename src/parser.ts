import {IFilter, IFormatter} from './protocol';
import {IProperty} from './resolver';
import {decodeFilterArg} from './encoding';

// New regex that understands this:
// ${one.two.three | fil1 : 'asd sds{}'  } $(as['s'].one | bla: 'hey' | extra: 'three') $<bla[123]|last> ${last["hey"].there|filter|bla: -123.456}
const formatRegEx = /\$(?:({)|(\()|(<))\s*([\w$]+(\s*|\.\s*[\w$]+|\[\s*('[^']+'|"[^"]+"|\d+)\s*])*)((\s*\|\s*[\w$]*(\s*:\s*('[^']*'|"[^"]*"|[\d.-])*)*)*)\s*(?:(?=\2)(?=\3)}|(?=\1)(?=\3)\)|(?=\1)(?=\2)>)/g;

//TODO: '" inside the same

export abstract class Formatter {

    getDefaultValue?(prop: string, params: { [key: string]: any }): any;

    getDefaultFilter?(name: string, args: string[]): any;

    abstract format(value: any): string;

    filters?: { [name: string]: IFilter };

    replace(text: string, params: { [key: string]: any }) {
        return text.replace(formatRegEx, (...args: string[]) => {
            const pp = args[4]; // full property path
            const filters = args[7]; // all filters with arguments
            let {exists, value} = Formatter.resolveProperty(pp, params);
            if (!exists) {
                if (typeof this.getDefaultValue !== 'function') {
                    throw new Error(`Property ${JSON.stringify(pp)} does not exist`);
                }
                value = this.getDefaultValue(pp, params);
            }
            if (filters) {
                value = filters
                    .split('|')
                    .map(a => a.trim())
                    .filter(a => a)
                    .reduce((p, c) => {
                        const [fName, ...args] = c.split(':').map(a => a.trim());
                        let f = this.filters?.[fName];
                        if (!f && typeof this.getDefaultFilter === 'function') {
                            f = this.getDefaultFilter(fName, args);
                        }
                        if (!f) {
                            throw new Error(`Filter ${JSON.stringify(fName)} not recognized`);
                        }
                        const decodedArgs = typeof f.decodeArguments === 'function' ? f.decodeArguments(args) : args.map(a => decodeFilterArg(a));
                        return f.transform(p, decodedArgs);
                    }, value);
            }
            return this.format(value);
        });
    }

    /**
     * Parses a property and resolves its value from an object.
     *
     * It supports `this` as the first name to reference the object itself.
     */
    private static resolveProperty(path: string, obj: { [key: string]: any }): IProperty {
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
}


/**
 * Creates a formatter function.
 *
 * @returns
 * A function that formats a string from an object-parameter, and according to the specified configurator.
 *
 * @example
 * import {createFormatter, IFormatter} from 'custom-string-formatter';
 *
 * class BaseFormatter implements IFormatter {
 *     format(value: any): string {
 *         return (value ?? 'null').toString();
 *     }
 * }
 *
 * const format = createFormatter(new BaseFormatter());
 *
 * format('Hello ${title} ${name}!', {title: 'Mr.', name: 'Foreman'});
 * //=> Hello Mr. Foreman!
 *
 * @example
 * // Function createFormatter expects only an interface,
 * // so using a class is not necessary:
 *
 * const format = createFormatter({
 *      format(value: any): string {
 *         return (value ?? 'null').toString();
 *     }
 * });
 */


/**
 * A fast check if a string has variables in it.
 *
 * @returns
 * Boolean flag, indicating if the string has variables in it.
 *
 * @example
 * import {hasVariables} from 'custom-string-formatter';
 *
 * hasVariables('${value}'); //=> true
 *
 * hasVariables('some text'); //=> false
 *
 * @see {@link countVariables}, {@link enumVariables}
 */
export function hasVariables(text: string): boolean {
    return text.search(formatRegEx) >= 0;
}

/**
 * A fast count of variables in a string.
 *
 * @returns
 * Number of variables in the string.
 *
 * @example
 * import {countVariables} from 'custom-string-formatter';
 *
 * countVariables('some text'); //=> 0
 *
 * countVariables('${first} ${second}'); //=> 2
 *
 * @see {@link hasVariables}, {@link enumVariables}
 */
export function countVariables(text: string): number {
    return text.match(formatRegEx)?.length ?? 0;
}

/**
 * Variable descriptor, as returned from {@link enumVariables} function.
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
     * Extracted filters with raw arguments (not decoded).
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
 *
 * @example
 * import {enumVariables} from 'custom-string-formatter';
 *
 * enumVariables('${title} ${name} address: ${address | json}');
 * // ==>
 * [
 *     {match: '${title}', property: 'title', filters: []},
 *     {match: '${name}', property: 'name', filters: []},
 *     {
 *         match: '${address | json}',
 *         property: 'address',
 *         filters: [{name: 'json', args: []}]
 *     }
 * ]
 *
 * @see {@link hasVariables}, {@link countVariables}
 */
export function enumVariables(text: string): IVariable[] {
    return (text.match(formatRegEx) || [])
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

class MyFormatter extends Formatter {
    format(value: any): string {
        return (value ?? 'null').toString();
    }
}

const a = new MyFormatter();

const format = a.replace.bind(a)

console.log(format(`$(first) text`, {first: 'hello'}));
