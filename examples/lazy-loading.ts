import {createFormatter, IFormattingConfig, IFormattingFilter} from 'custom-string-formatter';

class FirstFilter implements IFormattingFilter {
    format(value: any) {
        return value + '-1';
    }
}

class SecondFilter implements IFormattingFilter {
    format(value: any) {
        return value + '-2';
    }
}

class ThirdFilter implements IFormattingFilter {
    format(value: any) {
        return value + '-3';
    }
}

class BaseFormatter implements IFormattingConfig {
    format(value: any) {
        return (value ?? 'null').toString();
    }

    getDefaultFilter(name: string): IFormattingFilter | undefined {
        switch (name) {
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

    filters: { [name: string]: IFormattingFilter } = {}
}

const format = createFormatter(new BaseFormatter());

const s = format('${a:first}\n${b:second}\n${c:third}',
    {a: 'aaa', b: 'bbb', c: 'ccc'});

console.log(s);
// OUTPUT:
//
// aaa-1
// bbb-2
// ccc-3
