import {createFormatter, IFormatter, IFormattingFilter} from '../src';

class DummyFilter implements IFormattingFilter {
    format(value: any) {
        return '[' + value + ']';
    }
}

class BaseFormatter implements IFormatter {
    format(value: any) {
        return (value ?? 'null').toString();
    }

    getDefaultFilter(name: string): IFormattingFilter | undefined {
        // return "dummy" filter for "wrap" and "brackets" the same:
        if (['wrap', 'brackets'].indexOf(name) >= 0) {
            return this.filters.dummy;
        }
    }

    filters = {
        dummy: new DummyFilter()
    }
}

const format = createFormatter(new BaseFormatter());

const s = format('${a:dummy}\n${b:wrap}\n${c:brackets}',
    {a: 'first', b: 'second', c: 'third'});

console.log(s);
// OUTPUT:
//
// [first]
// [second]
// [third]
