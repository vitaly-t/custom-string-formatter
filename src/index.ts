import {createFormatter, IFormatting, IFormattingFilter} from './formatter';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class MyFormatter implements IFormatting {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    filters = {
        json: new JsonFilter()
    };
}

const format = createFormatter(new MyFormatter());

const s = format('Hello ${name} and ${this.value.hello}', {name: 'World', value: {bla: 123, hello: undefined}});

console.log(s);
