### ``round(value, exp)``
Returns ``value`` rounded to ``exp`` digits.

- `value` `<Number>`
- `exp` `<Number>`

```js
round(1.275, 2);   // Returns 1.28
round(1.27499, 2); // Returns 1.27
round(1234.5678, -2);   // Returns 1200
round(1.2345678e+2, 2); // Returns 123.46
round("123.45");        // Returns 123
```