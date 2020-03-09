### ``updateObjWithSameSchema(targeObj, sourceObj)``
Imprints the values of ``sourceObj`` onto ``targeObj``.

- `targeObj` `<Object>`
- `sourceObj` `<Object>`

```js
PV.updateObjWithSameSchema({
	a: 'bye'
}, {
	a: {
		b: {
			c: 'hello'
		}
	}
});
```