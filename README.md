# custom-string-formatter

[![ci](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml/badge.svg)](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/nodejs-20%20--%2024-green.svg?logo=node.js&style=flat)](https://nodejs.org)

* [Installation](#installation)
* [Variable Syntax](#variable-syntax)
* [Formatting Filters](#formatting-filters)
    - [Filter Arguments](#filter-arguments)
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
unlike ES6 Template Literals, which only work via JavaScript interpolation.

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
* `$<propertyName>`

The extra syntax is for cases like combining it with ES6 Template Literals, etc.

Property names follow simple JavaScript variable notation: the name can contain letters (case-sensitive),
digits, `$`, `_` (underscore) and `.` for nested properties.

You can use a combination of the above inside one string, but you cannot combine opener-closer pairs, i.e.
something like `${propertyName)` is invalid, and won't be recognized as a variable.

**Full Syntax:**

Full variable syntax supports a chain of nested properties, plus optional filters with arguments:

* `${prop1.prop2.prop3 | filter1 | filter2 | filter3 : arg1 : arg2}`.

All spaces in between are ignored, i.e. `${  prop  |  filter  :  arg  }` works the same as `${prop|filter:arg}`.

See the chapters below for further details.

## Formatting Filters

Formatting filters can be appended to the property name, using `|` separator, for value transformation, in the form
of `${propertyName | filter1 | filter2 | filter3}`.

Filters perform value transformation in the same order in which they are specified.
Output from the last filter in the chain goes to the formatter, to be converted into a string (if needed).

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

    // name->object map of all our filters:
    filters = {
        json: new JsonFilter()
    };
}

const format = createFormatter(new BaseFormatter());

const s = format('${title} ${name} address: ${address | json}', {
    title: 'Mr.',
    name: 'Foreman',
    address: {street: 'Springfield', house: 10}
});

console.log(s); //=> Mr. Foreman address: {"street":"Springfield","house":10}
```

### Filter Arguments

You can pass optional arguments into a filter after `:` symbol:

```
${propertyName | filterName : -123.45 : Hello World!}
```

For the example above, the `transform` will receive `args` set to `['-123.45', 'Hello World!']`.

**Limitation**

> Filter arguments cannot contain symbols `|:{}<>()`, as they would conflict with the variable syntax.
> To pass those in, use HTML symbol encoding, as explained below.

Filter arguments are automatically HTML-decoded (unless [decodeArguments] override is used):

* `&#8364;` => `€`: decimal symbol codes (1–6 digits)
* `&#x1F60a;` => `😊`: hexadecimal symbol codes (1–5 hex digits, case-insensitive)

Codes for symbols that must be encoded inside filter arguments:

| symbol | decimal  | hexadecimal |
|:------:|:--------:|:-----------:|
|  `\|`  | `&#124;` |  `&#x7c;`   |
|  `:`   | `&#58;`  |  `&#x3a;`   |
|  `{`   | `&#123;` |  `&#x7b;`   |
|  `}`   | `&#125;` |  `&#x7d;`   |
|  `<`   | `&#60;`  |  `&#x3c;`   |
|  `>`   | `&#62;`  |  `&#x3e;`   |
|  `(`   | `&#40;`  |  `&#x28;`   |
|  `)`   | `&#41;`  |  `&#x29;`   |

For dynamic filter arguments, you can use function [sanitizeFilterArg] to encode them.

You can also override method [decodeArguments], for the following purposes:

* to let the filter control individual argument decoding
* to optimize the filter's performance by not decoding some or all arguments

## Self-Reference

When a property chain starts with `this` (case-sensitive), the parser treats it as the reference to the parameter object
itself. It is to avoid wrapping the parameter object into another object when you want to format that parameter object
itself.

For the above example with the filter, we can use it like this:

```ts
const s = format('Address: ${this | json}', {street: 'Springfield', house: 10});

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
    {match: '${title}', property: 'title', filters: []},
    {match: '${name}', property: 'name', filters: []},
    {
        match: '${address | json}',
        property: 'address',
        filters: [{name: 'json', args: []}]
    }
]
```

## Safety Checks

### Property-name Safety

The parser requires that any referenced property exists, or else it will throw `Property "propName" does not exist`.
This is to help with detection of invalid property names.

If a property is missing, it must be set to `undefined` before it can be referenced from a string, to avoid the error.

You can override such behavior by implementing [getDefaultValue] function inside [IFormatter] and return
a default value whenever the property cannot be resolved. This is not the safest approach when no error is thrown,
as invalid property names can be easily missed.

### Filter-name Safety

When using an unknown filter, the parser will throw `Filter "filterName" not recognized`, to help with detection
of invalid filter names.

You can override such behavior by implementing [getDefaultFilter] function inside [IFormatter] and return
an alternative filter. This can have various uses, such as:

* Support for filter aliases
* Support for dynamic filters / lazy-loading

Check out [the examples](./examples).

### Performance

The high performance of this library is enforced right in the unit tests (
see [./test/performance.spec.ts](./test/performance.spec.ts)).

The engine can do the following inside 1 second:

- replace 1 million variables inside a string that contains 1 million variables;
- replace a variable inside one-variable string 4 million times in a row.

Tested under NodeJS v20/24.

[IFormatter]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L57

[getDefaultValue]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L74

[getDefaultFilter]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L98

[hasVariables]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/parser.ts#L48

[countVariables]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/parser.ts#L55

[enumVariables]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/parser.ts#L89

[sanitizeFilterArg]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/encoding.ts#L16

[decodeArguments]:https://github.com/vitaly-t/custom-string-formatter/blob/main/src/protocol.ts#L51
