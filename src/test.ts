import {createFormatter, IFormattingConfig, IFormattingFilter} from './';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class MyFormatter implements IFormattingConfig {
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
