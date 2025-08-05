import {createFormatter, IFormatter, IFormattingFilter} from '../src';

class TestFilter implements IFormattingFilter {
    format(value: any): string {
        return (value ?? 'null').toString();
    }
}

class TestFormatter implements IFormatter {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    filters = {
        test: new TestFilter()
    }
}

const format = createFormatter(new TestFormatter());

const totalVars = 500_000; // It can do 1 mln locally, but GitHub CI will fail

let output = ''; // expected output

const testData = {
    // simple property resolution
    simple: {
        obj: {},
        input: ''
    },
    // with nested property
    nested: {
        obj: {},
        input: ''
    },
    // with a filter
    filtered: {
        obj: {},
        input: ''
    }
};

beforeAll(() => {
    generateData();
});

function generateData() {
    for (let i = 0; i < totalVars; i++) {
        testData.simple.input += `$(prop_${i})`;
        testData.simple.obj[`prop_${i}`] = i;

        testData.nested.input += `$(prop_${i}.value)`;
        testData.nested.obj[`prop_${i}`] = {value: i};

        testData.filtered.input += `$(prop_${i}:test)`;
        testData.filtered.obj[`prop_${i}`] = i;

        output += i;
    }
}

describe('performance', () => {
    describe('for simple resolution', () => {
        it(`must do at least ${totalVars} replacements per second`, () => {
            const start = Date.now();
            const s = format(testData.simple.input, testData.simple.obj);
            const duration = Date.now() - start;
            expect(s).toEqual(output);
            expect(duration).toBeLessThan(1000);
        });
    });
    describe('for nested resolution', () => {
        it(`must do at least ${totalVars} replacements per second`, () => {
            const start = Date.now();
            const s = format(testData.nested.input, testData.nested.obj);
            const duration = Date.now() - start;
            expect(s).toEqual(output);
            expect(duration).toBeLessThan(1000);
        });
    });
    describe('for filtered resolution', () => {
        it(`must do at least ${totalVars} replacements per second`, () => {
            const start = Date.now();
            const s = format(testData.filtered.input, testData.filtered.obj);
            const duration = Date.now() - start;
            expect(s).toEqual(output);
            expect(duration).toBeLessThan(1000);
        });
    });
    describe('for one-value string', () => {
        it(`must do at least ${totalVars} * 3 replacements per second`, () => {
            const start = Date.now();
            const obj = {value: 123};
            let s: string;
            // NOTE: It does about 4 times, but we reduce it to pass tests
            for (let i = 0; i < totalVars * 3; i++) {
                s = format('${value}', obj);
            }
            const duration = Date.now() - start;
            console.log('duration:', duration);
            expect(s).toEqual('123');
            expect(duration).toBeLessThan(1000);
        });
    });
});
