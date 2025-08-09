import {createFormatter, IFormatter, IFilter} from '../src';

class FirstFilter implements IFilter {
    transform(value: any, args: string[]): any {
        return value + '-1';
    }
}

class SecondFilter implements IFilter {
    transform(value: any, args: string[]): any {
        return value + '-2';
    }
}

class ThirdFilter implements IFilter {
    transform(value: any, args: string[]): any {
        return value + '-3';
    }
}

class BaseFormatter implements IFormatter {
    format(value: any) {
        return (value ?? 'null').toString();
    }

    getDefaultFilter(filter: string, args: string[]): IFilter | undefined {
        switch (filter) {
            case 'first': {
                return this.filters.first = new FirstFilter();
            }
            case 'second': {
                return this.filters.second = new SecondFilter();
            }
            case 'third': {
                return this.filters.third = new ThirdFilter();
            }
            default:
                break;
        }
    }

    filters: { [name: string]: IFilter } = {}
}

const format = createFormatter(new BaseFormatter());

const s = format('${a|first}\n${b|second}\n${c|third}',
    {a: 'aaa', b: 'bbb', c: 'ccc'});

console.log(s);
// OUTPUT:
//
// aaa-1
// bbb-2
// ccc-3
