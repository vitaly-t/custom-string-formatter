# custom-string-formatter

[![ci](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml/badge.svg)](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/nodejs-20%20--%2024-green.svg?logo=node.js&style=flat)](https://nodejs.org)

* [Installation](#installation)
* [Variable Syntax](#variable-syntax)
* [Formatting Filters](#formatting-filters)
* [Self-Reference](#self-reference)
* [Input Analysis](#input-analysis)
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

You get access to rich formatting syntax that works with any dynamic text (from file, HTTP, user input or generated),
unlike ES6 Template Literals, which only work via JavaScript interpolation for static templates.

Plus, you get some nice extensions, like [Formatting Filters](#formatting-filters).

## Installation

```sh
$ npm i custom-string-formatter
```

Current GitHub CI is set up for just NodeJS v20-v24, but it works in all browsers the same.

## Variable Syntax

**Basic variable syntax is as below:**

* `${propertyName}`
* `$(propertyName)`
* `$[propertyName]`
* `$<propertyName>`
* `$/propertyName/`

Property names follow open JavaScript variable notation, i.e. the name can contain letters (case-sensitive),
digits, plus `$` and `_` (underscore).

You can use a combination of the above inside one string, but you cannot combine opener-closer pairs, i.e.
something like `${propertyName]` is invalid, and won't be recognized as a variable.

**Full Syntax:**

Full variable syntax supports a chain of nested properties, plus optional filters:

* `${prop1.prop2.prop3 | filter1 | filter2 | filter3}`.

All spaces in between are ignored, i.e. `${  prop  |  filter  }` works the same as `${prop|filter}`.

See the chapters below for further details.

## Formatting Filters

Formatting filters can be appended to the property name, using `|` separator, for value transformation, in the form
of `${propertyName | filter1 | filter2 | filter3}` (all spaces in between are ignored).

Filters will then perform value transformation in the same order in which they are specified.
Output from the last filter in the chain will go to the formatter, to be converted into a string (if needed).

**Example of using formatting filters:**

```ts
import {createFormatter, IFormatter, IFilter} from 'custom-string-formatter';

class JsonFilter implements IFilter {
    transform(value: any, args: string[]): any {
        return JSON.stringify(value); // transform into a JSON string
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

const s = format('${title} ${name} address: ${address|json}', {
    title: 'Mr.',
    name: 'Foreman',
    address: {street: 'Springfield', house: 10}
});

console.log(s); //=> Mr. Foreman address: {"street":"Springfield","house":10}
```

**Filter Arguments**

You can pass arguments into a filter after `:`:

```
${propertyName | filterName : -123.45 : Hello World!}
```

For the example above, the `transform` will receive `args` set to `['-123.45', 'Hello World!']`.

**Limitation**

> Filter arguments cannot contain symbols `:}]>)/|`, as they conflict with the variable syntax.  

## Self-Reference

When a property chain starts with `this` (case-sensitive), the parser treats it as the reference to the parameter object
itself. It is to avoid wrapping the parameter object into another object when you want to format that parameter object
itself.

For the above example with the filter, we can use it like this:

```ts
const s = format('Address: ${this|json}', {street: 'Springfield', house: 10});

console.log(s); //=> Address: {"street":"Springfield","house":10}
```

Above, we referenced the parameter object itself, and then forwarded formatting into our `json` filter.

Because `this` references the parameter object, its use with nested properties is also valid - `${this.prop1.prop2}`,
though it may not have a practical need (use of `this` in this case is superfluous), but just for logical consistency.

## Input Analysis

If you need to verify an input string for the variable references it has, this library offers three global
functions to help you with that:

| Function         | Description                                    |
|------------------|------------------------------------------------|
| [hasVariables]   | A fast check if a string has variables in it.  |
| [countVariables] | A fast count of variables in a string.         |
| [enumVariables]  | Enumerates and parses variables from a string. |

**Example:**

```ts
import {enumVariables} from 'custom-string-formatter';

enumVariables('${title} ${name} address: ${address | json}');
// ==>
[
    { match: '${title}', property: 'title', filters: [] },
    { match: '${name}', property: 'name', filters: [] },
    {
        match: '${address | json}',
        property: 'address',
        filters: [ { name: 'json', args: [] } ]
    }
]
```

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

The high performance of this library is enforced right in the unit tests (
see [./test/performance.spec.ts](./test/performance.spec.ts)).

The engine can do the following inside 1 second:

- replace 1 million variables inside a string that contains 1 million variables;
- replace a variable inside one-variable string 4 million times in a row.

Tested under NodeJS v20/24.

[IFormatter]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L14

[getDefaultValue]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L31

[getDefaultFilter]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L58

[hasVariables]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/parser.ts#L46

[countVariables]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/parser.ts#L53

[enumVariables]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/parser.ts#L87
