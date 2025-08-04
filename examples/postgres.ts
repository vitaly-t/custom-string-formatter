import {IFormattingConfig} from '../src';

export class PostgresFormatter implements IFormattingConfig {
    format(value: any): string {
        switch (typeof value) {
            case 'boolean': {
                return value ? 'true' : 'false';
            }
            case 'string': {
                return `'${value}'`;
            }
            case 'number':
            case 'bigint': {
                return PostgresFormatter.formatNumber(value);
            }
            case 'object': {
                return PostgresFormatter.formatObject(value);
            }
            default:
                break;
        }
        // return (value ?? 'null').toString();
    }

    static formatNumber(value: number | bigint): string {
        if (Number.isFinite(value)) {
            return value < 0 ? `(${value})` : value.toString();
        }
        if (value === Number.POSITIVE_INFINITY) {
            return `'+Infinity'`;
        }
        if (value === Number.NEGATIVE_INFINITY) {
            return `'-Infinity'`
        }
        return `'NaN'`;
    }

    static formatObject(value: any): string {
        if (value instanceof Date) {
            // in pg-promise, this goes into the base driver,
            // for a very long implementation:
            // https://github.com/brianc/node-postgres/blob/master/packages/pg/lib/utils.js#L95
        }
        if (Buffer.isBuffer(value)) {
            return `'\\x${value.toString('hex')}'`;
        }
    }
}
