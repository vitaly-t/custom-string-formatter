import {IFormatter, IFormattingFilter} from '../src';

export class PostgresFormatter implements IFormatter {
    format(value: any): string {
        switch (typeof value) {
            case 'undefined': {
                return 'null';
            }
            case 'boolean': {
                return value ? 'true' : 'false';
            }
            case 'string': {
                return `'${PostgresFormatter.safeText(value)}'`;
            }
            case 'number':
            case 'bigint': {
                return PostgresFormatter.formatNumber(value);
            }
            case 'object': {
                return this.formatObject(value);
            }
            default: {
                // will throw for types: "symbol" and "function"
                throw new TypeError(`Type "${typeof value}" not supported`);
            }
        }
    }

    static safeText(value: string): string {
        // replace every single quote with two single quotes:
        return value.replace(/'/g, '\'\'');
    }

    /**
     * Mimics JSON.stringify, but with support for BigInt.
     */
    static toJson(value: any): string | undefined {
        if (value !== undefined) {
            return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? `${v}#bigint` : v)
                .replace(/"(-?\d+)#bigint"/g, (_, a) => a);
        }
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

    formatObject(value: object): string {
        if (value === null) {
            return 'null';
        }
        if (Array.isArray(value)) {
            return `array[${value.map(a => this.format(a)).join()}]`;
        }
        if (value instanceof Date) {
            // in pg-promise, this goes into the base driver, for a very long implementation:
            // https://github.com/brianc/node-postgres/blob/master/packages/pg/lib/utils.js#L95
            return value.toDateString(); // temporary
        }
        if (Buffer.isBuffer(value)) {
            return `'\\x${value.toString('hex')}'`;
        }
        return `'${PostgresFormatter.safeText(PostgresFormatter.toJson(value) as string)}'`;
    }

    filters = {
        name: new SqlNameFilter()
    }
}

/**
 * Formatting for SQL Name(s):
 *  - from a single string
 *  - from an array of strings
 *  - from an object (for property names)
 */
export class SqlNameFilter implements IFormattingFilter {
    format(value: any): string {
        switch (typeof value) {
            case 'string': {
                return `"${value}"`;
            }
            case 'object': {
                const names = Array.isArray(value) ? value : Object.keys(value);
                return names.map(n => `"${n}"`).join();
            }
            default: {
                throw new Error(`Invalid sql name: ${JSON.stringify(value)}`);
            }
        }
    }
}
