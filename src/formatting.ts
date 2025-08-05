import {IFormatter} from './protocol';
import {resolveProperty} from './resolver';

/**
 * Returns a function that formats strings according to the specified configurator.
 */
export function createFormatter(base: IFormatter) {
    const reg = new RegExp(/\$(?:({)|(\()|(<)|(\[)|(\/))\s*([\w$.]+)\s*(:\s*([\w\$]*)\s*)?\s*(?:(?=\2)(?=\3)(?=\4)(?=\5)}|(?=\1)(?=\3)(?=\4)(?=\5)\)|(?=\1)(?=\2)(?=\4)(?=\5)>|(?=\1)(?=\2)(?=\3)(?=\5)]|(?=\1)(?=\2)(?=\3)(?=\4)\/)/g);
    return function (text: string, params: { [key: string]: any }) {
        return text.replace(reg, (...args: string[]) => {
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
