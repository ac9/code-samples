### ``deepCopy(obj)``
Returns an object that is copy of all values contained in ``obj``.

- `obj` `<Object>`

```js
var clone = PV.deepCopy({
	a: {
		b: {
			c: 'hello'
		}
	}
});
```