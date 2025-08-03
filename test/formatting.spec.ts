import {createFormatter, IFormattingConfig, IFormattingFilter} from '../src';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class ShortFormatter implements IFormattingConfig {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    filters = {
        json: new JsonFilter()
    };
}

class FullFormatter implements IFormattingConfig {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    getDefaultValue(name: string, params: { [key: string]: any }): any {
        return 'nada';
    }

    getDefaultFilter(name: string): IFormattingFilter | undefined {
        if (name === 'object') {
            return this.filters.json;
        }
    }

    filters = {
        json: new JsonFilter()
    };
}

const shortFormat = createFormatter(new ShortFormatter());
const fullFormat = createFormatter(new FullFormatter());

describe('createFormatter', () => {
    it('must resolve properties', () => {
        expect(fullFormat('some ${value}', {value: 123})).toEqual('some 123');
    });
    it('must resolve filters', () => {
        expect(fullFormat('some ${value:json}', {value: 'message'})).toEqual('some "message"');
    });
    it('must resolve aliases', () => {
        expect(fullFormat('some ${value:object}', {value: 'message'})).toEqual('some "message"');
    });
    it('must redirect to default values', () => {
        expect(fullFormat('${value}', {})).toEqual('nada');
    });
    it('must throw on missing property', () => {
        expect(() => shortFormat('${first}', {})).toThrow('Property "first" does not exist');
    });
    it('must throw on invalid filter', () => {
        expect(() => fullFormat('${value:bla}', {value: 123})).toThrow('Filter "bla" not recognized');
        expect(() => shortFormat('${value:bla}', {value: 123})).toThrow('Filter "bla" not recognized');
    });
});
