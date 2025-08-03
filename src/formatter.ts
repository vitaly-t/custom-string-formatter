// TODO: Add support for custom-type formatting

export interface IFormattingFilter {

}

export interface IFormatting {
    formatValue(value: any): string;
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
export function createFormatter(f: IFormatting) {
    const reg = new RegExp(/\$(?:({)|(\()|(<)|(\[)|(\/))\s*([\w$.]+)\s*(:\s*([\w\$]*)\s*)?\s*(?:(?=\2)(?=\3)(?=\4)(?=\5)}|(?=\1)(?=\3)(?=\4)(?=\5)\)|(?=\1)(?=\2)(?=\4)(?=\5)>|(?=\1)(?=\2)(?=\3)(?=\5)]|(?=\1)(?=\2)(?=\3)(?=\4)\/)/g);
    return function (text: string, params: { [key: string]: any }) {
        return text.replace(reg, (...args: string[]) => {
            const prop = args[6]; // property name
            const filter = args[8]; // filter, if specified
            console.log(`Found property ${JSON.stringify(prop)}, with filter ${JSON.stringify(filter)}`);
            return params[prop];
        });
    }
}
