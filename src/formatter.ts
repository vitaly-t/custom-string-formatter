// TODO: Add support for custom-type formatting

import {resolveProperty} from './resolver';

export interface IFormattingFilter {
    format(value: any): string;
}

export interface IFormatting {
    format(value: any): string;

    filters?: { [name: string]: IFormattingFilter };
}

/**
 * Patterns:
 * 1. Simple one: \${\s*(\w+)\s*(:\s*(\w*)\s*)?\s*}
 * 2. Complete one: \$[{<([/]\s*(\w+)\s*(:\s*(\w*)\s*)?\s*[/}>)\]]
 * 3. With proper variable syntax + sub-property support:
 *      \$[{<([/]\s*([a-zA-Z0-9$_.]+)\s*(:\s*([a-zA-Z0-9$_.]*)\s*)?\s*[/}>)\]]
 *
 * 4. Complete: \$(?:({)|(\()|(<)|(\[)|(\/))\s*([\w$.]+)\s*(:\s*([\w\$]*)\s*)?\s*(?:(?=\2)(?=\3)(?=\4)(?=\5)}|(?=\1)(?=\3)(?=\4)(?=\5)\)|(?=\1)(?=\2)(?=\4)(?=\5)>|(?=\1)(?=\2)(?=\3)(?=\5)]|(?=\1)(?=\2)(?=\3)(?=\4)\/)
 *
 * @param f
 */
export function createFormatter(config: IFormatting) {
    const reg = new RegExp(/\$(?:({)|(\()|(<)|(\[)|(\/))\s*([\w$.]+)\s*(:\s*([\w\$]*)\s*)?\s*(?:(?=\2)(?=\3)(?=\4)(?=\5)}|(?=\1)(?=\3)(?=\4)(?=\5)\)|(?=\1)(?=\2)(?=\4)(?=\5)>|(?=\1)(?=\2)(?=\3)(?=\5)]|(?=\1)(?=\2)(?=\3)(?=\4)\/)/g);
    return function (text: string, params: { [key: string]: any }) {
        return text.replace(reg, (...args: string[]) => {
            const prop = args[6]; // property name
            const filter = args[8]; // filter, if specified
            const res = resolveProperty(params, prop);
            if (!res.exists) {
                throw new Error(`Property ${JSON.stringify(prop)} does not exist`);
            }
            if (filter) {
                const f = config.filters?.[filter];
                if (!f) {
                    throw new Error(`Filter ${JSON.stringify(filter)} not recognized`);
                }
                return f.format(res.value);
            }
            return config.format(res.value);
        });
    }
}
