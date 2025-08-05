import {createFormatter, IFormatter, IFormattingFilter} from '../src';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class ShortFormatter implements IFormatter {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    filters = {
        json: new JsonFilter()
    };
}

class DummyFormatter implements IFormatter {
    format(value: any): string {
        return value.toString();
    }
}

class FullFormatter implements IFormatter {
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
const dummyFormat = createFormatter(new DummyFormatter());

describe('createFormatter', () => {
    it('must resolve properties in every syntax', () => {
        const obj = {value: 'hi'};
        expect(fullFormat('${value}', obj)).toEqual('hi');
        expect(fullFormat('$(value)', obj)).toEqual('hi');
        expect(fullFormat('$[value]', obj)).toEqual('hi');
        expect(fullFormat('$<value>', obj)).toEqual('hi');
        expect(fullFormat('$/value/', obj)).toEqual('hi');
    });
    it('must not recognize mixed opener-closer pairs', () => {
        const obj = {value: 'hi'};
        expect(fullFormat('${value)', obj)).toEqual('${value)');
        expect(fullFormat('$[value>', obj)).toEqual('$[value>');
        expect(fullFormat('$<value/', obj)).toEqual('$<value/');
        expect(fullFormat('$/value}', obj)).toEqual('$/value}');
    });
    it('must resolve filters', () => {
        expect(fullFormat('some ${value:json}', {value: 'message'})).toEqual('some "message"');
        expect(fullFormat('some ${  value  :  json  }', {value: 'message'})).toEqual('some "message"');
    });
    it('must resolve aliases', () => {
        expect(fullFormat('some ${value:object}', {value: 'message'})).toEqual('some "message"');
    });
    it('must redirect to default value', () => {
        expect(fullFormat('${value}', {})).toEqual('nada');
    });
    it('must throw on missing property', () => {
        expect(() => shortFormat('${first}', {})).toThrow('Property "first" does not exist');
    });
    it('must throw on invalid filter', () => {
        expect(() => fullFormat('${value:full}', {value: 123})).toThrow('Filter "full" not recognized');
        expect(() => shortFormat('${value:short}', {value: 123})).toThrow('Filter "short" not recognized');
        expect(() => dummyFormat('${value:dummy}', {value: 123})).toThrow('Filter "dummy" not recognized');
    });
});
