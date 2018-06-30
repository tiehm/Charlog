

# Charlog &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/your/your-project/blob/master/LICENSE)
> A different [signale](https://github.com/klauscfhq/signale).

Charlog is a custom Logger with many features with the main focus to be appealing. 

This is heavily inspired by [signale](https://github.com/klauscfhq/signale), please use signale if you are looking for a fully supported and steady updated logger.

## Installing / Getting started

Just install the package with npm (or yarn).

```shell
npm i charlog --save
```

Then require the class and use it:
```js
const Charlog = require('charlog');
const Logger = new Charlog();

Logger.error('This is a cool %a', 'Error');
```

## Configuration

The class constructor takes an ``options`` object.

``interactive``  
 - Type: ``Boolean``
 - Default: ``false``
 
 Enables the interactive mode. In this mode the recent logged line will be replaced with the new one.
 
 ``uppercaseTag``
- Type: ``Boolean``
- Default: ``true``

Enables the caps lock for tags.

``tag``
- Type: ``String``
- Default: ``Main``

The Tag which appears in front of the log message.

``date``
- Type: ``Boolean``
- Default: ``false``

Enables that the date is shown before the log message.

``timestamp``
- Type: ``Boolean``
- Default: ``false``

Enables that the current time is shown before the log message.

``setFileLength``
- Type: ``Number``
- Default: ``0``

Set the length of the longest filename including extension (only needed if ``filename`` is enabled)

``longestTagName``
- Type: ``Number``
- Default: ``0``

Set the length of the longest tag name.

``filename``
- Type: ``Boolean``
- Default: ``true``

Enabling that the filename is shown before the log message.

``loggers``
- Type: ``Object``
- Default: See below

Set custom loggers.

``Logger``

````
"nameOfLogger": {
    tag: 'TAG',
    color: 'color'
}
````

## Licensing

MIT
