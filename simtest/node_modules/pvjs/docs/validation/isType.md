### ``isType(t)``
Checks if ``t`` an instance of ``Type``. ``Type`` can be one of the following: `Array`, `Boolean`, `Database`, `Date`, `Element`, `Function`, `Infinity`, `NaN`, `Null`, `Number`, `Object`, `RegExp`, `String`, `Undefined`

- `t` `<type>`

```js
if (PV.isType(t)) {
    console.log(`Success`);
} else {
    console.log(`Failure`);
}
```