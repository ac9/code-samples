### ``convertObjectToStr(object, separator, delimiter)``
Returns a string that represents ``object``g.
```js
{			=>	'a=1&b=2'
	a: 1,
	b: 2
}
```

- `object` `<Object>`
- `separator` `<String>`: Optional, default is `'='`
- `delimiter` `<String>`: Optional, default is `'&'`

```js
var str = PV.convertObjectToStr({a: 1, b: 2});
```