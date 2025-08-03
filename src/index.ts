import {createFormatter, IFormatting} from './formatter';

class MyFormatter implements IFormatting {
    formatValue(value: any): string {
        return value.toString();
    }
}

const format = createFormatter(new MyFormatter());

const s = format('Hello ${name} and ${this.value.bla:flt}', {name: 'World', value: {bla: 123}});

console.log(s);
