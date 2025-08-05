# custom-string-formatter

[![ci](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml/badge.svg)](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/nodejs-20%20--%2024-green.svg?logo=node.js&style=flat)](https://nodejs.org)

* [Installation](#installation)
* [Basic Syntax](#basic-syntax)
* [Nested Properties](#nested-properties)
* [Formatting Filters](#formatting-filters)
* [Self-Reference](#self-reference)
* [Safety Checks](#safety-checks)
* [Performance](#performance)

Platform for implementing string-value formatting: unified formatting syntax for any type of output.

```ts
import {createFormatter, IFormatter} from 'custom-string-formatter';

class BaseFormatter implements IFormatter {
    format(value: any): string {
        return (value ?? 'null').toString();
    }
}

// creating a reusable formatting function:
const format = createFormatter(new BaseFormatter());

// formatting a string with values from an object:
const s = format('Hello ${title} ${name}!', {title: 'Mr.', name: 'Foreman'});

console.log(s); //=> Hello Mr. Foreman!
```

## Installation

```sh
$ npm i custom-string-formatter
```

Current GitHub CI is set up for just NodeJS v20-v24, but it works in all browsers the same.

## Basic Syntax

Supported variable syntaxes:

* `${propertyName}`
* `$(propertyName)`
* `$[propertyName]`
* `$<propertyName>`
* `$/propertyName/`

Property names follow open JavaScript variable notation, i.e. the name can contain letters (case-sensitive),
digits, plus `$` and `_` (underscore).

You can use a combination of the above inside one string, but you cannot combine opener-closer pairs, i.e.
something like `${propertyName]` is invalid, and won't be recognized as a variable.

Name-surrounding spaces are ignored, i.e. `${  propertyName  }` works the same as `${propertyname}`.

## Nested Properties

Property nesting (separated by `.`) of any depth is supported: `${propA.propB.propC}`.

Empty property names around `.` are ignored, i.e. `${...propA...propB...propC...}` will work
the same as `${propA.propB.propC}`.

## Formatting Filters

A formatting filter can be appended to the property name after `:` to override the default formatting, i.e.
in the form of `${propertyName:filterName}`.

**Example of using a formatting filter:**

```ts
import {createFormatter, IFormatter, IFormattingFilter} from 'custom-string-formatter';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class BaseFormatter implements IFormatter {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    filters = {
        json: new JsonFilter()
    };
}

const format = createFormatter(new BaseFormatter());

const s = format('${title} ${name} address: ${address:json}', {
    title: 'Mr.',
    name: 'Foreman',
    address: {street: 'Springfield', house: 10}
});

console.log(s); //=> Mr. Foreman address: {"street":"Springfield","house":10}
```

Spaces in between are ignored, i.e. `${  propertyName  :  filterName  }` works the same as `${propertyName:filterName}`.

## Self-Reference

When a property chain starts with `this` (case-sensitive), the parser treats it as the reference to the parameter object
itself.

It is to avoid wrapping the parameter object into another object when you want to format that object itself.

For the above example with the filter, we can use it like this:

```ts
const s = format('Address: ${this:json}', {street: 'Springfield', house: 10});

console.log(s); //=> Address: {"street":"Springfield","house":10}
```

Above, we referenced the parameter object itself, and then forwarded formatting into our `json` filter.

Because `this` references the parameter object, its use with nested properties is also valid - `${this.propA.propB}`,
though it may not have a practical need, as use of `this` in this case is superfluous.

## Safety Checks

### Property-name Safety

The parser requires that any referenced property exists, or else it will throw `Property "propName" does not exist`.
This is to help with detection of invalid property names.

If a property is missing, it must be set to `undefined` before it can be referenced from a string, to avoid the error.

You can override such behavior by implementing [getDefaultValue] function inside [IFormatter] and return
a default value whenever the property cannot be resolved. This is not a safe approach when no error is thrown,
as invalid property names can be easily missed.

### Filter-name Safety

When using an unknown filter, the parser will throw `Filter "filterName" not recognized`, to help with detection
of invalid filter names.

You can override such behavior by implementing [getDefaultFilter] function inside [IFormatter] and return
an alternative filter. This can have various uses, such as:

* Support for filter aliases
* Support for dynamic filters / lazy-loading
* Support for composite filters names

Check out [the examples](./examples).

### Performance

The high performance of this library is enforced right in the unit tests (see [./test/performance.spec.ts](./test/performance.spec.ts)).

The engine averages 10^6 (1 million) variable replacements per second when running under NodeJS v20/24 locally.
The unit test has it reduced to 500k to avoid failures in GitHub CI due to the lowered CPU quota there.

[IFormatter]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L14

[getDefaultValue]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L32

[getDefaultFilter]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L56
