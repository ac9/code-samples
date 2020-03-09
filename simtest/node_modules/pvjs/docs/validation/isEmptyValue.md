### ``isEmptyValue(s)``
Checks if ``s`` is ``null``, ``undefined``, ``'-N/A-'``, ``'- N/A -'`` or an empty trimmed string.

- `s` `<String>`

```js
if (PV.isEmptyValue('- N/A -')) {
    console.log(`Success`);
} else {
    console.log(`Failure`);
}
```