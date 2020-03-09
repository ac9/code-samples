### ``combineColors(r1, g1, b1, r2, g2, b2, a2)``
Combines two colors together into a color object. This can be used to determine the color is when one color with ``a2`` is drawn on top of another.
```js
{
	r: 255,
	g: 255,
	b: 255
}
```

- `r1` `<Number>`
- `g1` `<Number>`
- `b1` `<Number>`
- `r2` `<Number>`
- `g2` `<Number>`
- `b2` `<Number>`
- `a2` `<Number>`

```js
var colorObj = PV.combineColors(128, 0, 0, 128, 128, 128, 0.5);
```