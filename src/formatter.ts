// TODO: Add support for custom-type formatting

export interface IFormattingFilter {

}

export interface IFormatting {
    formatValue(value: any): string;
}

export function createFormatter(f: IFormatting) {
    return function (text: string, params: { [key: string]: any }) {

    }
}
