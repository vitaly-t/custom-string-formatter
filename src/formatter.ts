// TODO: Add support for custom-type formatting

interface IFormattingFilter {

}

interface IFormatting {
    formatValue(value: any): string;
}

class MyFormatter implements IFormatting {
    formatValue(value: any): string {
        return value.toString();
    }
}

function createFormatter(f: IFormatting) {
    return function (text: string, params: { [key: string]: any }) {

    }
}

const format = createFormatter(new MyFormatter());

const s = format('Hello ${name}', {name: 'World'});

console.log(s);
