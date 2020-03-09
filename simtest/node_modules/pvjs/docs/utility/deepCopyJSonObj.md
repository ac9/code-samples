### ``deepCopyJSonObj(obj)``
Returns an object that is copy of all values contained in ``obj``. This uses ``JSON.stringify`` and ``JSON.parse`` to perform the copy.

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