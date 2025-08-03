import {createFormatter, IFormattingConfig, IFormattingFilter} from '../src';

/**
 * This filter example wraps the value into angle brackets <value>,
 * with support for repeating angles N times.
 */
class AngleFilter implements IFormattingFilter {
    private repeat = 1; // 1 is default

    setRepeat(n: number) {
        this.repeat = n;
    }

    format(value: any) {
        const s = '<'.repeat(this.repeat) + (value ?? 'null').toString() + '>'.repeat(this.repeat);
        this.repeat = 1; // must reset to the default value;
        return s;
    }
}

class BaseFormatter implements IFormattingConfig {
    format(value: any) {
        return (value ?? 'null').toString();
    }

    getDefaultFilter(name: string): IFormattingFilter | undefined {
        const m = name.match(/angle_(\d+)/);
        if (m) {
            const f = this.filters.angle;
            f.setRepeat(parseInt(m[1])); // set repeat value
            return f;
        }
    }

    filters = {
        angle: new AngleFilter()
    }
}

const format = createFormatter(new BaseFormatter());

const s = format('${first:angle}\n${second:angle_2}\n${third:angle_4}',
    {first: 'default: one angle', second: 'with two angles', third: 'with four angles'});

console.log(s);
// OUTPUT:
//
// <default: one angle>
// <<with two angles>>
// <<<<with four angles>>>>
