import {countVariables, createFormatter, enumVariables, hasVariables, IFormatter, IFilter} from '../src';

class JsonFilter implements IFilter {
    transform(value: any): any {
        return JSON.stringify(value);
    }
}

class AppendFilter implements IFilter {
    transform(value: any): any {
        return value + '-append';
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

    getDefaultFilter(filter: string): IFilter | undefined {
        if (filter === 'object') {
            return this.filters.json;
        }
    }

    filters = {
        json: new JsonFilter(),
        append: new AppendFilter()
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
        expect(fullFormat('some ${value|json}', {value: 'message'})).toEqual('some "message"');
        expect(fullFormat('some ${  value  |  json  }', {value: 'message'})).toEqual('some "message"');
    });
    it('must resolve chained filters', () => {
        expect(fullFormat('some ${value|append|json}', {value: 'message'})).toEqual('some "message-append"');
        expect(fullFormat('some ${  value  |  append  |  json  }', {value: 'message'})).toEqual('some "message-append"');
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
        expect(countVariables('$(bla) $[here]')).toBe(2);
    });
});

describe('enumVariables', () => {
    it('must handle no matches', () => {
        expect(enumVariables('')).toStrictEqual([]);
    });
    it('must handle multiple matches', () => {
        expect(enumVariables('$[first] $[ second | test | hello ]')).toStrictEqual([
            {match: '$[first]', property: 'first', filters: []},
            {match: '$[ second | test | hello ]', property: 'second', filters: ['test', 'hello']}
        ]);
    });
});
