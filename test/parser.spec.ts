import {countVariables, createFormatter, enumVariables, hasVariables, IFormatter, IFilter} from '../src';

class JsonFilter implements IFilter {
    transform(value: any, args: string[]): any {
        return JSON.stringify(value);
    }
}

class AppendFilter implements IFilter {
    transform(value: any, args: string[]): any {
        return [value, ...args].join(',');
    }

    decodeArguments(args: string[]): string[] {
        return args; // to avoid decoding
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

    getDefaultValue(prop: string, params: { [key: string]: any }): any {
        return 'nada';
    }

    getDefaultFilter(filter: string, args: string[]): IFilter | undefined {
        if (filter === 'object') {
            return this.filters.json;
        }
    }

    filters = {
        json: new JsonFilter(),
        append: new AppendFilter()
    };
}

const fullFormatter = new FullFormatter();
const fullFormat = createFormatter(fullFormatter);
const shortFormat = createFormatter(new ShortFormatter());
const dummyFormat = createFormatter(new DummyFormatter());

describe('createFormatter', () => {
    it('must resolve properties in every syntax', () => {
        const obj = {value: 'hi'};
        expect(fullFormat('${value}', obj)).toEqual('hi');
        expect(fullFormat('$(value)', obj)).toEqual('hi');
        expect(fullFormat('$<value>', obj)).toEqual('hi');
    });
    it('must not recognize mixed opener-closer pairs', () => {
        const obj = {value: 'hi'};
        expect(fullFormat('${value)', obj)).toEqual('${value)');
        expect(fullFormat('$[value>', obj)).toEqual('$[value>');
        expect(fullFormat('$<value/', obj)).toEqual('$<value/');
        expect(fullFormat('$/value}', obj)).toEqual('$/value}');
    });
    it('must resolve filters', () => {
        expect(fullFormat('some ${value|json}', {value: 'message'})).toEqual('some "message"');
        expect(fullFormat('some ${  value  |  json  }', {value: 'message'})).toEqual('some "message"');
    });
    it('must resolve chained filters', () => {
        expect(fullFormat('some ${value|append:bla|json}', {value: 'message'})).toEqual('some "message,bla"');
        expect(fullFormat('some ${  value  |  append : bla  |  json  }', {value: 'message'})).toEqual('some "message,bla"');
    });
    it('must resolve aliases', () => {
        expect(fullFormat('some ${value|object}', {value: 'message'})).toEqual('some "message"');
    });
    it('must redirect to default value', () => {
        expect(fullFormat('${value}', {})).toEqual('nada');
    });
    it('must throw on missing property', () => {
        expect(() => shortFormat('${first}', {})).toThrow('Property "first" does not exist');
    });
    it('must throw on invalid filter', () => {
        expect(() => fullFormat('${value|full}', {value: 123})).toThrow('Filter "full" not recognized');
        expect(() => shortFormat('${value|short}', {value: 123})).toThrow('Filter "short" not recognized');
        expect(() => dummyFormat('${value|dummy}', {value: 123})).toThrow('Filter "dummy" not recognized');
    });
    it('must chain filter results', () => {
        expect(fullFormat('${value|append:b:c|append:d:e}', {value: 'a'})).toEqual('a,b,c,d,e');
    });
    describe('for filter arguments', () => {
        it('must handle empty args', () => {
            const cb = jest.spyOn(fullFormatter.filters.json, 'transform');
            fullFormat('${value|json:}', {value: 'message'});
            expect(cb).toHaveBeenCalledWith('message', ['']);
        });
        it('must resolve numbers', () => {
            const cb = jest.spyOn(fullFormatter.filters.json, 'transform');
            fullFormat('${value|json: 1: 22.33: -45.678}', {value: 'message'});
            expect(cb).toHaveBeenCalledWith('message', ['1', '22.33', '-45.678']);
        });
        it('must resolve random text with spaces', () => {
            const cb1 = jest.spyOn(fullFormatter.filters.json, 'transform');
            const cb2 = jest.spyOn(fullFormatter, 'getDefaultFilter');
            fullFormat('${value|object: Hello World! : Where are we? }', {value: 'message'});
            expect(cb1).toHaveBeenCalledWith('message', ['Hello World!', 'Where are we?']);
            expect(cb2).toHaveBeenCalledWith('object', ['Hello World!', 'Where are we?']);
        });
        it('must decode HTML symbols by default', () => {
            const cb = jest.spyOn(fullFormatter.filters.json, 'transform');
            fullFormat('${value|json: &#58;}', {value: 'message'});
            expect(cb).toHaveBeenCalledWith('message', [':']);
        });
        it('must not decode HTML symbols with override present', () => {
            const cb = jest.spyOn(fullFormatter.filters.append, 'transform');
            fullFormat('${value|append: &#58;}', {value: 'message'});
            expect(cb).toHaveBeenCalledWith('message', ['&#58;']);
        });
    });
});

describe('hasVariables', () => {
    it('must return false when no variables used', () => {
        expect(hasVariables('')).toBeFalsy();
        expect(hasVariables('$(bla}')).toBeFalsy();
    });
    it('must return true when variables are used', () => {
        expect(hasVariables('$(bla)')).toBeTruthy();
    });
});

describe('countVariables', () => {
    it('must return correct variable count', () => {
        expect(countVariables('')).toBe(0);
        expect(countVariables('$(bla}')).toBe(0);
        expect(countVariables('$(bla)')).toBe(1);
        expect(countVariables('$(bla) $<here>')).toBe(2);
    });
});

describe('enumVariables', () => {
    it('must handle no matches', () => {
        expect(enumVariables('')).toStrictEqual([]);
    });
    it('must handle multiple matches', () => {
        expect(enumVariables('$<first> $< second | test | hello >')).toStrictEqual([
            {match: '$<first>', property: 'first', filters: []},
            {
                match: '$< second | test | hello >',
                property: 'second',
                filters: [{name: 'test', args: []}, {name: 'hello', args: []}]
            }
        ]);
    });
    it('must handle filter arguments', () => {
        expect(enumVariables('$(first | ff: Hello there! ) $( second | test | hello: -123.45 )')).toStrictEqual([
            {match: '$(first | ff: Hello there! )', property: 'first', filters: [{name: 'ff', args: ['Hello there!']}]},
            {
                match: '$( second | test | hello: -123.45 )',
                property: 'second',
                filters: [{name: 'test', args: []}, {name: 'hello', args: ['-123.45']}]
            }
        ]);
    });
});
