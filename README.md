# custom-string-formatter

[![ci](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml/badge.svg)](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/nodejs-20%20--%2024-green.svg?logo=node.js&style=flat)](https://nodejs.org)

* [Installation](#installation)
* [Basic Syntax](#basic-syntax)
* [Nested Properties Syntax](#nested-properties)
* [Formatting Filters](#formatting-filters)
* [Self-Reference](#self-reference)

This is a platform for easy implementation of flexible string-value formatting.

```ts
import {createFormatter, IFormattingConfig} from 'custom-string-formatter';

class BaseFormatter implements IFormattingConfig {
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
$ npm i custom-type-formatting
```

## Basic Syntax

Supported variable syntax is any of the following:

* `${propertyName}`
* `$(propertyName)`
* `$[propertyName]`
* `$<propertyName>`
* `$/propertyName/`

Property name follows valid open JavaScript variable notation, i.e. the name can contain letters (case-sensitive),
digits, plus `$` (dollar) and `_` (underscore).

You can use a combination of the above inside one string, but you cannot combine opener-closer pairs, i.e.
something like `${propertyName]` is invalid, and won't be recognized as a variable.

Name-surrounding spaces are ignored, i.e. `${  propertyName  }` works the same as `${propertyname}`.

## Nested Properties

Property nesting (separated with `.`) of any depth is supported: `${propA.propB.propC}`.

Empty property names adjacent to `.` are ignored, i.e. `${...propA...propB...propC...}` will work
the same as `${propA.propB.propC}`.

## Formatting Filters

Formatting filters are appended to the property name after `:` to override the default formatting, i.e.
in the form of `${propertyName:filterName}`.

<b>Example of using formatting filters</b>

```ts
import {createFormatter, IFormattingConfig, IFormattingFilter} from './';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class BaseFormatter implements IFormattingConfig {
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

When a property starts with `this` (case-sensitive), the parser treats it as the reference to the parameter object itself.  

It is to avoid wrapping the parameter object into another object when you want to format that object itself.

For the above example with the filter, we can use it like this:

```ts
const s = format('Address: ${this:json}', {street: 'Springfield', house: 10});

console.log(s); //=> Address: {"street":"Springfield","house":10}
```

Above, we referenced the parameter object itself, and forwarded formatting into our `json` filter.

Because `this` references the parameter object, its use with nested properties is also valid - `${this.propA.propB}`,
though it may not have a practical need, as use of `this` in this case is superfluous.
