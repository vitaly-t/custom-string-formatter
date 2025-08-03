import {createFormatter, IFormattingConfig, IFormattingFilter} from './';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class BaseFormatter implements IFormattingConfig {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    filters = {
        json: new JsonFilter()
    };
}

const format = createFormatter(new BaseFormatter());

const s = format('${title} ${name} address: ${address:json}', {
    title: 'Mr.',
    name: 'Foreman',
    address: {street: 'Springfield', house: 10}
});

console.log(s); //=> Mr. Foreman address: {"street":"Springfield","house":10}
