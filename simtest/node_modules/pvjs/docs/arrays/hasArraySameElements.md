### ``hasArraySameElements(array1, array2)``
Checks if each element of ``array1`` is an index of ``array2``.

- `array1` `<Array>`
- `array2` `<Array>`

```js
if (PV.hasArraySameElements(['a', 'b', 'c'], ['a', 'b', 'z'])){
	console.log('Success');
} else {
	console.log(`Failure`);
}
```