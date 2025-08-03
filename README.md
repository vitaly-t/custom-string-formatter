# custom-string-formatter

[![ci](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml/badge.svg)](https://github.com/vitaly-t/custom-string-formatter/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/nodejs-20%20--%2024-green.svg?logo=node.js&style=flat)](https://nodejs.org)

Platform for easy implementation of flexible string-value formatting.

```ts
import {createFormatter, IFormattingConfig} from 'custom-string-formatter';

class BasicFormatter implements IFormattingConfig {
    format(value: any): string {
        return (value ?? 'null').toString();
    }
}

// creating a reusable formatting function:
const format = createFormatter(new BasicFormatter());

// formatting a string with values from an object:
const s = format('Hello ${title} ${name}!', {title: 'Mr.', name: 'Foreman'});

console.log(s); //=> Hello Mr. Foreman!
```

## Installation

```sh
$ npm i custom-type-formatting
```

## Variable Syntax

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

### Nested Properties

Property nesting of any depth is supported: `${property_A.property_B.property_C}`

### Formatting Filters

Formatting filters are appended to the property name with `:filterName` to override the default formatting, i.e.
in the form of `${propertyName:filterName}`.

<details>
<summary><b>Example of using formatting filters</b></summary>

```ts
import {createFormatter, IFormattingConfig, IFormattingFilter} from './';

class JsonFilter implements IFormattingFilter {
    format(value: any): string {
        return JSON.stringify(value);
    }
}

class BasicFormatter implements IFormattingConfig {
    format(value: any): string {
        return (value ?? 'null').toString();
    }

    filters = {
        json: new JsonFilter()
    };
}

const format = createFormatter(new MyFormatter());

const s = format('${title} ${name} address: ${address:json}', {
    title: 'Mr.',
    name: 'Foreman',
    address: {street: 'Springfield', house: '10'}
});

console.log(s); //=> 
```

</details>

