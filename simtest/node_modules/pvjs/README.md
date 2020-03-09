# pvjs

This is an npm module design to perform common uses in the pVelocity JSAPI2 framework.

## Getting Started

Install the ``pvjs`` module.

    npm install --save pvjs

Use the require statement to load the module into the global namespace.

```js
require('pvjs');
```

## Methods

### Validation
- [isArray](docs/validation/isType.md)
- [isBoolean](docs/validation/isType.md)
- [isDatabase](docs/validation/isType.md)
- [isDate](docs/validation/isType.md)
- [isElement](docs/validation/isType.md)
- [isFunction](docs/validation/isType.md)
- [isInfinity](docs/validation/isType.md)
- [isNaN](docs/validation/isType.md)
- [isNull](docs/validation/isType.md)
- [isNumber](docs/validation/isType.md)
- [isObject](docs/validation/isType.md)
- [isRegExp](docs/validation/isType.md)
- [isString](docs/validation/isType.md)
- [isUndefined](docs/validation/isType.md)
- [isInteger](docs/validation/isInteger.md)
- [isEmptyObject](docs/validation/isEmptyObject.md)
- [isEmptyValue](docs/validation/isEmptyValue.md)
- [isValidUrl](docs/validation/isValidUrl.md)
- [isUrlImageExtension](docs/validation/isUrlImageExtension.md)
- [isUrlDocExtension](docs/validation/isUrlDocExtension.md)
- [isEmail](docs/validation/isEmail.md)

### Color
- [colorToRgba](docs/color/colorToRgba.md)
- [rgbaToColor](docs/color/rgbaToColor.md)
- [combineColors](docs/color/combineColors.md)
- [useWhiteOnColor](docs/color/useWhiteOnColor.md)
- [hexToRgb](docs/color/hexToRgb.md)
- [rgbToHex](docs/color/rgbToHex.md)
- [rgbToHsv](docs/color/rgbToHsv.md)
- [rgbToHsl](docs/color/rgbToHsl.md)
- [hsvToRgb](docs/color/hsvToRgb.md)
- [hsvToHex](docs/color/hsvToHex.md)
- [hsvToHsl](docs/color/hsvToHsl.md)
- [hslToRgb](docs/color/hslToRgb.md)
- [hslToHex](docs/color/hslToHex.md)
- [hslToHsv](docs/color/hslToHsv.md)

### Conversion
- [unescapeXml](docs/conversion/unescapeXml.md)
- [escapeXml](docs/conversion/escapeXml.md)
- [escapeHtml](docs/conversion/escapeHtml.md)
- [encodeURIComponentCaseSensitive](docs/conversion/encodeURIComponentCaseSensitive.md)
- [encodeURIComponentFull](docs/conversion/encodeURIComponentFull.md)
- [convertObjectToStr](docs/conversion/convertObjectToStr.md)
- [convertStrToBool](docs/conversion/convertStrToBool.md)
- [convertStrToFloat](docs/conversion/convertStrToFloat.md)
- [convertStrToDate](docs/conversion/convertStrToDate.md)
- [getColumnKeyByIndex](docs/conversion/getColumnKeyByIndex.md)
- [getIndexByColumnKey](docs/conversion/getIndexByColumnKey.md)

### Arrays
- [ensureArray](docs/arrays/ensureArray.md)
- [swapArray](docs/arrays/swapArray.md)
- [arrayEquals](docs/arrays/arrayEquals.md)
- [hasArraySameElements](docs/arrays/hasArraySameElements.md)
- [sortArrayKeyValueAsc](docs/arrays/sortArrayKeyValueAsc.md)
- [sortArrayKeyValueDesc](docs/arrays/sortArrayKeyValueDesc.md)
- [matchedIndexOfArray](docs/arrays/matchedIndexOfArray.md)

### Utility
- [round](docs/utility/round.md)
- [randomInt](docs/utility/randomInt.md)
- [createHash](docs/utility/createHash.md)
- [pathJoin](docs/utility/pathJoin.md)
- [deepCopy](docs/utility/deepCopy.md)
- [deepCopyJSonObj](docs/utility/deepCopyJSonObj.md)
- [updateObjWithSameSchema](docs/utility/updateObjWithSameSchema.md)
- [left](docs/utility/left.md)
- [right](docs/utility/right.md)
- [lTrim](docs/utility/lTrim.md)
- [rTrim](docs/utility/rTrim.md)
- [trim](docs/utility/trim.md)
- [pad](docs/utility/pad.md)
- [getUrls](docs/utility/getUrls.md)
- [getTimestamp](docs/utility/getTimestamp.md)
- [replaceAll](docs/utitlity/replaceAll.md)

## License

Copyright (c) 2016, pVelocity Inc

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.