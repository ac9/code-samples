/*global PV */
'use strict';

/* jshint strict: true */
/* jshint node: true */
/* jshint unused: false */
let root = (typeof window === 'undefined') ? global : window;

(function(root) {
  let type = function(o, t) {
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

    let s = Object.prototype.toString.call(o);
    let type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

    // handle NaN and Infinity
    if (type === 'number') {
      if (isNaN(o)) {
        return 'nan';
      }
      if (!isFinite(o)) {
        return 'infinity';
      }
    } else if (type === 'asyncfunction') {
      // handle AsyncFunction and Function
      if (t === 'function') {
        return 'function';
      }
    }

    return type;
  };

  let types = [
    'Array',
    'Boolean',
    'Database',
    'Date',
    'Element',
    'Function',
    'AsyncFunction',
    'Infinity',
    'NaN',
    'Null',
    'Number',
    'Object',
    'RegExp',
    'String',
    'Undefined'
  ];

  let generateMethod = function(t) {
    type['is' + t] = function(o) {
      return type(o, t.toLowerCase()) === t.toLowerCase();
    };
  };

  for (let i = 0; i < types.length; i++) {
    generateMethod(types[i]);
  }

  root.PV = type;
})(root);

(function(root) {
  root.PV.isEmail = function(inputText) {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
      return true;
    } else {
      return false;
    }
  };
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
  if (typeof window === 'undefined') {
    root.PV.createHash = function(txt, len) {
      const crypto = require('crypto');
      let hash = crypto.createHash('sha256').update(txt).digest('hex');
      if (PV.isNumber(len) === false) {
        len = 32;
      }
      hash = hash.slice(hash, len);
      return hash;
    };
  }
  root.PV.createGuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  root.PV.deepCopy = function(obj) {
    if (PV.isArray(obj)) {
      let out = [];
      for (let i = 0; i < obj.length; i++) {
        out[i] = PV.deepCopy(obj[i]);
      }
      return out;
    }
    if (PV.isObject(obj)) {
      let out2 = {};
      for (let j in obj) {
        out2[j] = PV.deepCopy(obj[j]);
      }
      return out2;
    }
    return obj;
  };
  root.PV.deepCopyJSonObj = function(obj) {
    if (obj !== null && obj !== undefined) {
      let strConfig = JSON.stringify(obj);
      let retObj = JSON.parse(strConfig);
      return retObj;
    } else {
      return obj;
    }
  };
  root.PV.updateObjWithSameSchema = function(targeObj, sourceObj) {
    if (PV.isObject(targeObj) && PV.isObject(sourceObj)) {
      let sourceCopy = PV.deepCopyJSonObj(sourceObj);
      for (let sourceProp in sourceCopy) {
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
  root.PV.escapeFileName = function(fileName) {
    if (PV.isString(fileName)) {
      return fileName
        .replace(/\//g, '_')
        .replace(/\\/g, '_')
        .replace(/:/g, '_')
        .replace(/\*/g, '_')
        .replace(/\?/g, '_')
        .replace(/\</g, '_')
        .replace(/\>/g, '_')
        .replace(/\"/g, '_')
        .replace(/\|/g, '_');
    }
    return fileName;
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
    let result = '';
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
    let result = '';
    if (PV.isString(str)) {
      for (let s of str) {
        let d = s.charCodeAt(0);
        //only encode upper cases, A-Z or *
        if ((d >= 65 && d <= 90) || (d === 42)) {
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
        let iLen = String(str).length;
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
    let s = "000000000" + num;
    return s.substr(s.length - size);
  };
  root.PV.isEmptyObject = function(obj) {
    if (PV.isObject(obj) === true) {
      let name;
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
    let objectStr = '';
    if (PV.isObject(object)) {
      let arr = [];
      for (let key in object) {
        if (object.hasOwnProperty(key)) {
          arr.push(key + separator + object[key]);
        }
      }
      objectStr = arr.join(delimiter);
    }
    return objectStr;
  };
  root.PV.convertStrToBool = function(string, defaultBoolean) {
    let bool = false;
    if (PV.isBoolean(defaultBoolean)) {
      bool = defaultBoolean;
    }
    if (PV.isString(string)) {
      let strLower = string.toLowerCase();
      let falseStrings = ['false', 'no', '0', 'n', 'f'];
      let trueStrings = ['true', 'yes', '1', 'y', 't'];
      let isFalse = falseStrings.includes(strLower);
      let isTrue = trueStrings.includes(strLower);

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
    let defaultNum = 0;
    if (PV.isNumber(defaultFloat)) {
      defaultNum = defaultFloat;
    }
    let num = 0;
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

    let date = new Date(string);
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
      let newArray = [];
      for (let i = 0; i < array.length; i++) {
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

    for (let i = 0, l = array1.length; i < l; i++) {
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
        for (let i = i; i < array1.length; i++) {
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
    let matchedIndex = -1;
    if (PV.isArray(lookupArray) && PV.isArray(matchArray)) {
      for (let i = 0; i < lookupArray.length; i++) {

        let dValues = lookupArray[i];
        if (PV.isString(dValues)) {
          dValues = [dValues];
        }
        if (PV.isArray(dValues) && dValues.length === matchArray.length) {
          let match = true;
          for (let j = 0; j < matchArray.length; j++) {
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
      let colorStr = color.replace('rgba', '').replace('rgb', '').replace('(', '').replace(')', '').replace(/ /g, '');
      let colorValues = colorStr.split(',');
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
    let rgb = {
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
    let br = Math.sqrt((299 * r * r + 587 * g * g + 114 * b * b) / 1000);

    return (br < 130);
  };
  root.PV.hexToRgb = function(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
      let rgb = {
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
    let componentToHex = function(c) {
      let hex = c.toString(16);
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
    let min = Math.min(r, g, b);
    let max = Math.max(r, g, b);
    let delta = max - min;
    let h, s, v = max;

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
    let deltadiv = delta === 0 ? 1 : delta; // check if delta is 0

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
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
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

    let r, g, b, i, f, p, q, t;
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

    let rgb = {
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
    let rgb = PV.hsvToRgb(h, s, v);
    return PV.rgbToHex(rgb.r, rgb.g, rgb.b);
  };
  // http://stackoverflow.com/questions/3423214/convert-hsb-color-to-hsl
  root.PV.hsvToHsl = function(h, s, v) {
    // determine the lightness in the range [0,100]
    let l = (2 - s / 100) * v / 2;

    // store the HSL components
    let hsl = {
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

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      let hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    let rgb = {
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
    let rgb = PV.hslToRgb(h, s, l);
    return PV.rgbToHex(rgb.r, rgb.g, rgb.b);
  };
  // http://stackoverflow.com/questions/3423214/convert-hsb-color-to-hsl
  root.PV.hslToHsv = function(h, s, l) {
    // set a temporary value
    let t = s * (l < 50 ? l : 100 - l) / 100;

    // store the HSV components
    let hsv = {
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
    let regex = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/;
    return regex.test(url);
  };
  root.PV.getUrls = function(stringWithUrls) {
    return stringWithUrls.match(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?;&\/\/=]*)/g);
  };
  root.PV.isUrlImageExtension = function(url) {
    if (PV.isString(url)) {
      let parts = url.split('.');
      if (parts.length > 1) {
        let ext = parts[parts.length - 1];
        let validFileExtensions = ['png', 'jpeg', 'gif', 'jpg', 'bmp', 'tif'];
        let mappedExtension = validFileExtensions.map(function(elem) {
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
      let parts = url.split('.');
      if (parts.length > 1) {
        let ext = parts[parts.length - 1];
        let validFileExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
        let mappedExtension = validFileExtensions.map(function(elem) {
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
    let temp, colKey = '';
    let column = index + 1;
    while (column > 0) {
      temp = (column - 1) % 26;
      colKey = String.fromCharCode(temp + 65) + colKey;
      column = (column - temp - 1) / 26;
    }
    return colKey;
  };
  root.PV.getIndexByColumnKey = function(colKey) {
    let column = 0,
      length = colKey.length;
    for (let i = 0; i < length; i++) {
      column += (colKey.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    let index = column - 1;
    return index;
  };
  root.PV.getTimestamp = function(date) {
    let currentDT = PV.isDate(date) ? date : new Date();
    let dd = currentDT.getDate();
    let mm = currentDT.getMonth() + 1; //January is 0!
    let yyyy = currentDT.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }
    let hr = currentDT.getHours();
    if (hr < 10) {
      hr = '0' + hr;
    }
    let min = currentDT.getMinutes();
    if (min < 10) {
      min = '0' + min;
    }
    let ss = currentDT.getSeconds();
    if (ss < 10) {
      ss = '0' + ss;
    }
    let ms = currentDT.getMilliseconds();
    if (ms < 10) {
      ms = '00' + ms;
    } else if (ms < 100) {
      ms = '0' + ms;
    }
    return yyyy + '-' + mm + '-' + dd + ' ' + hr + ':' + min + ':' + ss + ':' + ms;
  };
})(root);