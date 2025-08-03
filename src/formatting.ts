import {resolveProperty} from './resolver';

/**
 * Formatting Filter interface.
 */
export interface IFormattingFilter {
    /**
     * Takes any value and formats it according to the type and/or the filter logic.
     */
    format(value: any): string;
}

/**
 * Formatting Configuration interface.
 */
export interface IFormattingConfig {
    /**
     * Implements default formatting (when without a filter):
     *  - takes any value and formats it according to the type.
     */
    format(value: any): string;

    /**
     * Optional set of formatting filters that override default formatting.
     */
    filters?: { [name: string]: IFormattingFilter };
}

/**
 * Returns a function that formats strings according to the specified configurator.
 */
export function createFormatter(cfg: IFormattingConfig) {
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
                const f = cfg.filters?.[filter];
                if (!f) {
                    throw new Error(`Filter ${JSON.stringify(filter)} not recognized`);
                }
                return f.format(res.value);
            }
            return cfg.format(res.value);
        });
    }
}
