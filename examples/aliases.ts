import {createFormatter, IFormattingConfig, IFormattingFilter} from 'custom-string-formatter';

class FirstFilter implements IFormattingFilter {
    format(value: any) {
        return value + '-1';
    }
}

class BaseFormatter implements IFormattingConfig {
    format(value: any) {
        return (value ?? 'null').toString();
    }

    getDefaultFilter(name: string): IFormattingFilter | undefined {
        if (['one', '1'].indexOf(name) >= 0) {
            return this.filters.first;
        }
    }

    filters = {
        first: new FirstFilter()
    }
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
