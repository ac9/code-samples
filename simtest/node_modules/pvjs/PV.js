/*global PV */
'use strict';

/* jshint strict: true */
/* jshint node: true */
/* jshint unused: false */

var root = (typeof window === 'undefined') ? global : window;

(function(root) {
    var type = function(o) {
        // handle null in old IE
        if (o === null) {
            return 'null';
        } else if (o === undefined) {
            return 'undefined';
        }

        // handle DOM elements
        if (o && (o.nodeType === 1 || o.nodeType === 9)) {
            return 'element';
        }

        var s = Object.prototype.toString.call(o);
        var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

        // handle NaN and Infinity
        if (type === 'number') {
            if (isNaN(o)) {
                return 'nan';
            }
            if (!isFinite(o)) {
                return 'infinity';
            }
        }

        return type;
    };

    var types = [
        'Array',
        'Boolean',
        'Database',
        'Date',
        'Element',
        'Function',
        'Infinity',
        'NaN',
        'Null',
        'Number',
        'Object',
        'RegExp',
        'String',
        'Undefined'
    ];

    var generateMethod = function(t) {
        type['is' + t] = function(o) {
            return type(o) === t.toLowerCase();
        };
    };

    for (var i = 0; i < types.length; i++) {
        generateMethod(types[i]);
    }

    root.PV = type;
})(root);

(function(root) {
    root.PV.round = function(value, exp) {
        //https://stackoverflow.com/questions/1726630/formatting-a-number-with-exactly-two-decimals-in-javascript
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Example:_Decimal_rounding
        if (typeof exp === 'undefined' || +exp === 0)
            return Math.round(value);
        value = +value;
        exp = +exp;
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
            return NaN;
        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    };
    root.PV.randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    root.PV.createHash = function(txt, len) {
        var crypto = require('crypto');
        var hash = crypto.createHash('sha256').update(txt).digest('hex');
        if (PV.isNumber(len) === false) {
            len = 32;
        }
        hash = hash.slice(hash, len);
        return hash;
    };
    root.PV.pathJoin = function(dir, dirname, delimiter) {
        if (PV.isString(delimiter) === false) {
            delimiter = '/';
        }
        if (PV.isString(dir)) {
            var dirArray = dir.split(delimiter);
            if (dirArray[0] === '.') {
                dirArray[0] = dirname;
            }
            var path = require('path');
            return path.join.apply(this, dirArray);
        } else {
            return dir;
        }
    };
    root.PV.deepCopy = function(obj) {
        if (PV.isArray(obj)) {
            var out = [];
            for (var i = 0; i < obj.length; i++) {
                out[i] = PV.deepCopy(obj[i]);
            }
            return out;
        }
        if (PV.isObject(obj)) {
            var out2 = {};
            for (var j in obj) {
                out2[j] = PV.deepCopy(obj[j]);
            }
            return out2;
        }
        return obj;
    };
    root.PV.deepCopyJSonObj = function(obj) {
        if (obj !== null && obj !== undefined) {
            var strConfig = JSON.stringify(obj);
            var retObj = JSON.parse(strConfig);
            return retObj;
        } else {
            return obj;
        }
    };
    root.PV.updateObjWithSameSchema = function(targeObj, sourceObj) {
        if (PV.isObject(targeObj) && PV.isObject(sourceObj)) {
            var sourceCopy = PV.deepCopyJSonObj(sourceObj);
            for (var sourceProp in sourceCopy) {
                if (targeObj.hasOwnProperty(sourceProp) === false) {
                    targeObj[sourceProp] = sourceCopy[sourceProp];
                } else {
                    if (PV.isObject(sourceCopy[sourceProp])) {
                        targeObj[sourceProp] = PV.updateObjWithSameSchema(PV.deepCopyJSonObj(targeObj[sourceProp]), sourceCopy[sourceProp]);
                    } else {
                        targeObj[sourceProp] = sourceCopy[sourceProp];
                    }
                }
            }
        }
        return targeObj;
    };
    root.PV.unescapeXml = function(str) {
        if (PV.isString(str)) {
            return str
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#92;/g, '\\')
                .replace(/&#39;/g, '\'')
                .replace(/&apos;/g, '\'')
                .replace(/&quot;/g, '"');
        }
        return str;
    };
    root.PV.escapeXml = function(xmlStr) {
        if (PV.isString(xmlStr)) {
            return xmlStr
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }
        return xmlStr;
    };
    root.PV.escapeHtml = function(htmlStr) {
        if (PV.isString(htmlStr)) {
            return htmlStr
                .replace(/\\r\\n/g, '&#13;&#10;')
                .replace(/\\r/g, '&#13;&#10;')
                .replace(/\\n/g, '&#13;&#10;')
                .replace(/</g, '&#60;')
                .replace(/>/g, '&#62;');
        }
        return htmlStr;
    };
    root.PV.encodeURIComponentFull = function(str) {
        var result = '';
        if (PV.isString(str)) {
            for (let s of str) {
                let h = s.charCodeAt(0).toString(16);
                if (h.length % 2) {
                    h = '0' + h;
                }

                result = result + '%' + h;
            }
        }
        return result;
    };
    root.PV.encodeURIComponentCaseSensitive = function(str) {
        var result = '';
        if (PV.isString(str)) {
            for (let s of str) {
                let d = s.charCodeAt(0);
                //only encode upper cases, A-Z or *
                if ((d >= 65 && d <= 90) ||(d === 42)) {
                    let h = s.charCodeAt(0).toString(16);
                    if (h.length % 2) {
                        h = '0' + h;
                    }
                    result = result + '%' + h;
                } else {
                    //apply normal encodeURIComponent
                    result = result + encodeURIComponent(s);
                }
            }
        }
        return result;
    };
    root.PV.replaceAll = function(search, replace, str) {
        if (PV.isString(str)) {
            return str.replace(new RegExp(search, 'g'), replace);
        }
        return str;
    };
    root.PV.left = function(str, n) {
        if (PV.isString(str)) {
            if (n <= 0)
                return "";
            else if (n > String(str).length)
                return str;
            else
                return String(str).substring(0, n);
        }
        return str;
    };
    root.PV.right = function(str, n) {
        if (PV.isString(str)) {
            if (n <= 0)
                return "";
            else if (n > String(str).length)
                return str;
            else {
                var iLen = String(str).length;
                return String(str).substring(iLen, iLen - n);
            }
        }
        return str;
    };
    root.PV.lTrim = function(str, charList) {
        if (charList === undefined) {
            charList = '\\s';
        }

        return str.replace(new RegExp('^[' + charList + ']+'), '');
    };
    root.PV.rTrim = function(str, charList) {
        if (charList === undefined) {
            charList = '\\s';
        }

        return str.replace(new RegExp('[' + charList + ']+$'), '');
    };
    root.PV.trim = function(str, charList) {
        str = PV.lTrim(str, charList);
        str = PV.rTrim(str, charList);

        return str;
    };
    root.PV.pad = function(num, size) {
        var s = "000000000" + num;
        return s.substr(s.length - size);
    };
    root.PV.isEmptyObject = function(obj) {
        if (PV.isObject(obj) === true) {
            var name;
            for (name in obj) {
                return false;
            }
        }
        return true;
    };
    root.PV.isEmptyValue = function(value) {
        return PV.isNull(value) || PV.isUndefined(value) ||
            value === '-N/A-' || value === '- N/A -' ||
            (PV.isString(value) && value.trim().length === 0);
    };
    root.PV.convertObjectToStr = function(object, separator, delimiter) {
        if (PV.isString(separator) === false) {
            separator = '=';
        }
        if (PV.isString(delimiter) === false) {
            delimiter = '&';
        }
        var objectStr = '';
        if (PV.isObject(object)) {
            var arr = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    arr.push(key + separator + object[key]);
                }
            }
            objectStr = arr.join(delimiter);
        }
        return objectStr;
    };
    root.PV.convertStrToBool = function(string, defaultBoolean) {
        var bool = false;
        if (PV.isBoolean(defaultBoolean)) {
            bool = defaultBoolean;
        }
        if (PV.isString(string)) {
            var strLower = string.toLowerCase();
            var isFalse = strLower === 'false' || strLower === 'no';
            var isTrue = strLower === 'true' || strLower === 'yes';

            if (isFalse) {
                return false;
            } else if (isTrue) {
                return true;
            } else {
                return bool;
            }
        } else if (PV.isBoolean(string)) {
            return string;
        }
        return bool;
    };
    root.PV.convertStrToFloat = function(string, defaultFloat) {
        var defaultNum = 0;
        if (PV.isNumber(defaultFloat)) {
            defaultNum = defaultFloat;
        }
        var num = 0;
        if (PV.isString(string)) {
            num = parseFloat(string.replace(/[ ,]/g, ''));
        } else {
            num = parseFloat(string);
        }
        if (PV.isNumber(num)) {
            return num;
        } else {
            return defaultNum;
        }
    };
    root.PV.convertStrToDate = function(string, defaultDate) {
        if (PV.isDate(defaultDate) === false) {
            defaultDate = new Date();
        }

        var date = new Date(string);
        if (PV.isString(string) && PV.isDate(date) && !isNaN(date.getTime())) {
            return date;
        } else {
            return defaultDate;
        }
    };
    root.PV.ensureArray = function(object) {
        if (PV.isUndefined(object) || PV.isNull(object)) {
            object = [];
        } else if (PV.isArray(object) === false) {
            object = [object];
        }
        return object;
    };
    root.PV.swapArray = function(array, index1, index2) {
        if (PV.isArray(array)) {
            var newArray = [];
            for (var i = 0; i < array.length; i++) {
                if (i === index1) {
                    newArray[i] = array[index2];
                } else if (i === index2) {
                    newArray[i] = array[index1];
                } else {
                    newArray[i] = array[i];
                }
            }
            return newArray;
        }
        return array;
    };
    root.PV.arrayEquals = function(array1, array2) {
        if (!array1 || !array2) {
            return false;
        }

        if (array1.length !== array2.length) {
            return false;
        }

        for (var i = 0, l = array1.length; i < l; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    };
    root.PV.hasArraySameElements = function(array1, array2) {
        if (array1 === null && array2 === null) {
            return true;
        } else if (array1 === undefined && array2 === undefined) {
            return true;
        } else if (PV.isArray(array1) && PV.isArray(array2)) {
            if (array1.length.length !== array2.length) {
                return false;
            } else {
                for (var i = i; i < array1.length; i++) {
                    if (array2.indexOf(array1[i]) !== -1) {
                        return false;
                    }
                }
                return true;
            }
            return true;
        } else {
            return false;
        }
    };
    root.PV.sortArrayKeyValueAsc = function(arr) {
        if (PV.isArray(arr)) {
            arr.sort(function(a, b) {
                if (a.extName === b.extName) {
                    return 0;
                } else if (a.extName > b.extName) {
                    return 1;
                }
                return -1;
            });
        }
    };
    root.PV.sortArrayKeyValueDesc = function(arr) {
        if (PV.isArray(arr)) {
            arr.sort(function(a, b) {
                if (a.extName === b.extName) {
                    return 1;
                } else if (a.extName > b.extName) {
                    return 0;
                }
                return -1;
            });
        }
    };
    root.PV.matchedIndexOfArray = function(matchArray, lookupArray) {
        var matchedIndex = -1;
        if (PV.isArray(lookupArray) && PV.isArray(matchArray)) {
            for (var i = 0; i < lookupArray.length; i++) {

                var dValues = lookupArray[i];
                if (PV.isString(dValues)) {
                    dValues = [dValues];
                }
                if (PV.isArray(dValues) && dValues.length === matchArray.length) {
                    var match = true;
                    for (var j = 0; j < matchArray.length; j++) {
                        if (matchArray[j] !== dValues[j]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        matchedIndex = i;
                        break;
                    }
                }
            }
        }
        return matchedIndex;
    };
    root.PV.colorToRgba = function(color) {
        if (PV.isString(color)) {
            var colorStr = color.replace('rgba', '').replace('rgb', '').replace('(', '').replace(')', '').replace(/ /g, '');
            var colorValues = colorStr.split(',');
            if (colorValues.length > 3) {
                return {
                    'r': parseInt(colorValues[0], 10),
                    'g': parseInt(colorValues[1], 10),
                    'b': parseInt(colorValues[2], 10),
                    'a': parseFloat(colorValues[3])
                };
            } else {
                return {
                    'r': parseInt(colorValues[0], 10),
                    'g': parseInt(colorValues[1], 10),
                    'b': parseInt(colorValues[2], 10),
                    'a': 1
                };
            }
        } else {
            return null;
        }
    };
    root.PV.rgbaToColor = function(r, g, b, a) {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    };
    root.PV.combineColors = function(r1, g1, b1, r2, g2, b2, a2) {
        var rgb = {
            'r': Math.floor((1 - a2) * r1 + a2 * r2),
            'g': Math.floor((1 - a2) * g1 + a2 * g2),
            'b': Math.floor((1 - a2) * b1 + a2 * b2)
        };

        if (rgb.r < 0) rgb.r = 0;
        if (rgb.g < 0) rgb.g = 0;
        if (rgb.b < 0) rgb.b = 0;

        if (rgb.r > 255) rgb.r = 255;
        if (rgb.g > 255) rgb.g = 255;
        if (rgb.b > 255) rgb.b = 255;

        return rgb;
    };
    root.PV.useWhiteOnColor = function(r, g, b) {
        var br = Math.sqrt((299 * r * r + 587 * g * g + 114 * b * b) / 1000);

        return (br < 130);
    };
    root.PV.hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (result) {
            var rgb = {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            };

            if (rgb.r < 0) rgb.r = 0;
            if (rgb.g < 0) rgb.g = 0;
            if (rgb.b < 0) rgb.b = 0;

            if (rgb.r > 255) rgb.r = 255;
            if (rgb.g > 255) rgb.g = 255;
            if (rgb.b > 255) rgb.b = 255;

            return rgb;
        } else {
            return null;
        }
    };
    root.PV.rgbToHex = function(r, g, b) {
        var componentToHex = function(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? '0' + hex : hex;
        };
        r = parseInt(r, 10);
        g = parseInt(g, 10);
        b = parseInt(b, 10);
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };
    // HSB is another way of saying HSV
    // http://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work
    root.PV.rgbToHsv = function(r, g, b) {
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var h, s, v = max;

        v = Math.floor(max / 255 * 100);
        if (max !== 0) {
            s = Math.floor(delta / max * 100);
        } else {
            // black
            return {
                'h': 0,
                's': 0,
                'v': 0
            };
        }
        var deltadiv = delta === 0 ? 1 : delta; // check if delta is 0

        if (r == max) {
            h = (g - b) / deltadiv; // between yellow & magenta
        } else if (g == max) {
            h = 2 + (b - r) / deltadiv; // between cyan & yellow
        } else {
            h = 4 + (r - g) / deltadiv; // between magenta & cyan
        }

        h = Math.floor(h * 60); // degrees
        if (h < 0) h += 360;

        return {
            'h': h,
            's': s,
            'v': v
        };
    };
    // http://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work
    root.PV.rgbToHsl = function(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return {
            'h': Math.floor(h * 360),
            's': Math.floor(s * 100),
            'l': Math.floor(l * 100)
        };
    };
    // http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    root.PV.hsvToRgb = function(h, s, v) {
        h = h / 360;
        s = s / 100;
        v = v / 100;

        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }

        var rgb = {
            'r': Math.floor(r * 255),
            'g': Math.floor(g * 255),
            'b': Math.floor(b * 255)
        };

        if (rgb.r < 0) rgb.r = 0;
        if (rgb.g < 0) rgb.g = 0;
        if (rgb.b < 0) rgb.b = 0;

        if (rgb.r > 255) rgb.r = 255;
        if (rgb.g > 255) rgb.g = 255;
        if (rgb.b > 255) rgb.b = 255;

        return rgb;
    };
    root.PV.hsvToHex = function(h, s, v) {
        var rgb = PV.hsvToRgb(h, s, v);
        return PV.rgbToHex(rgb.r, rgb.g, rgb.b);
    };
    // http://stackoverflow.com/questions/3423214/convert-hsb-color-to-hsl
    root.PV.hsvToHsl = function(h, s, v) {
        // determine the lightness in the range [0,100]
        var l = (2 - s / 100) * v / 2;

        // store the HSL components
        var hsl = {
            'h': h,
            's': s * v / (l < 50 ? l * 2 : 200 - l * 2),
            'l': l
        };

        // correct a division-by-zero error
        if (isNaN(hsl.s)) s = 0;

        return hsl;
    };
    // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    root.PV.hslToRgb = function(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        var r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        var rgb = {
            'r': Math.floor(r * 255),
            'g': Math.floor(g * 255),
            'b': Math.floor(b * 255)
        };

        if (rgb.r < 0) rgb.r = 0;
        if (rgb.g < 0) rgb.g = 0;
        if (rgb.b < 0) rgb.b = 0;

        if (rgb.r > 255) rgb.r = 255;
        if (rgb.g > 255) rgb.g = 255;
        if (rgb.b > 255) rgb.b = 255;

        return rgb;
    };
    root.PV.hslToHex = function(h, s, l) {
        var rgb = PV.hslToRgb(h, s, l);
        return PV.rgbToHex(rgb.r, rgb.g, rgb.b);
    };
    // http://stackoverflow.com/questions/3423214/convert-hsb-color-to-hsl
    root.PV.hslToHsv = function(h, s, l) {
        // set a temporary value
        var t = s * (l < 50 ? l : 100 - l) / 100;

        // store the HSV components
        var hsv = {
            'h': h,
            's': 200 * t / (l + t),
            'v': t + l
        };

        // correct a division-by-zero error
        if (isNaN(hsv.s)) hsv.s = 0;

        return hsv;
    };
    root.PV.isInteger = function(number) {
        if (PV.isNumber(number) || PV.isString(number)) {
            number = number + '';
            if (/^[0-9]+$/.test(number)) {
                return true;
            }
        }
        return false;
    };
    root.PV.isValidUrl = function(url) {
        var regex = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/;
        return regex.test(url);
    };
    root.PV.getUrls = function(stringWithUrls) {
        return stringWithUrls.match(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?;&\/\/=]*)/g);
    };
    root.PV.isUrlImageExtension = function(url) {
        if (PV.isString(url)) {
            var parts = url.split('.');
            if (parts.length > 1) {
                var ext = parts[parts.length - 1];
                var validFileExtensions = ['png', 'jpeg', 'gif', 'jpg', 'bmp', 'tif'];
                var mappedExtension = validFileExtensions.map(function(elem) {
                    if (PV.isString(elem)) {
                        return elem.toUpperCase();
                    } else {
                        return elem;
                    }
                });
                if (mappedExtension.indexOf(ext.toUpperCase()) > -1) {
                    return true;
                }
            }
        }
        return false;
    };
    root.PV.isUrlDocExtension = function(url) {
        if (PV.isString(url)) {
            var parts = url.split('.');
            if (parts.length > 1) {
                var ext = parts[parts.length - 1];
                var validFileExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
                var mappedExtension = validFileExtensions.map(function(elem) {
                    if (PV.isString(elem)) {
                        return elem.toUpperCase();
                    } else {
                        return elem;
                    }
                });
                if (mappedExtension.indexOf(ext.toUpperCase()) > -1) {
                    return true;
                }
            }
        }
        return false;
    };
    root.PV.getColumnKeyByIndex = function(index) {
        var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        var len = alphabet.length;
        var colKey = '';
        var left = index + 1; //index is base 0

        for (; left > 0;) {
            var mod = left;
            if (mod > len) {
                mod = left % len;
            }
            var index = 0;
            if (mod === 0) {
                index = len - 1;
            } else {
                index = mod - 1;
            }
            colKey = alphabet[index].toUpperCase() + colKey;
            left = Math.floor(left / 26.0);
            if (left === 1 && mod === len) {
                break;
            }
        }
        return colKey;
    };
    root.PV.getIndexByColumnKey = function(colKey) {
        var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        var index = 0;
        if (PV.isString(colKey)) {
            var chKey = colKey.split('');
            var digit = 0;
            for (var i = chKey.length - 1; i >= 0; i--) {
                var chIndex = alphabet.indexOf(chKey[i].toLowerCase());
                if (chIndex === -1) {
                    return -1;
                }
                if (digit === 0) {
                    index = chIndex;
                } else {
                    index += (Math.pow(26, digit) * (chIndex + 1));
                }
                digit++;
            }
        }
        return index;
    };
    root.PV.getTimeStamp = function() {
        // deprecated
        return PV.getTimestamp();
    };
    root.PV.getTimestamp = function() {
        var currentDT = new Date();
        var dd = currentDT.getDate();
        var mm = currentDT.getMonth() + 1; //January is 0!
        var yyyy = currentDT.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }
        var hr = currentDT.getHours();
        if (hr < 10) {
            hr = '0' + hr;
        }
        var min = currentDT.getMinutes();
        if (min < 10) {
            min = '0' + min;
        }
        var ss = currentDT.getSeconds();
        if (ss < 10) {
            ss = '0' + ss;
        }
        var ms = currentDT.getMilliseconds();
        if (ms < 10) {
            ms = '00' + ms;
        } else if (ms < 100) {
            ms = '0' + ms;
        }
        return yyyy + '-' + mm + '-' + dd + ' ' + hr + ':' + min + ':' + ss + ':' + ms;
    };
    root.PV.isEmail = function(inputText) {
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (inputText.match(mailformat)) {
            return true;
        } else {
            return false;
        }
    };
})(root);