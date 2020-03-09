### ``arrayEquals(array1, array2)``
Checks if each element of ``array1`` is the same element and index of ``array2``.

- `array1` `<Array>`
- `array2` `<Array>`

```js
if (PV.arrayEquals(['a', 'b', 'c'], ['a', 'b', 'z'])){
	console.log('Success');
} else {
	console.log(`Failure`);
}
```