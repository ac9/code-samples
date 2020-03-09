### ``getIndexByColumnKey(columnKey)``
Returns an equivalent index for ``columnKey``. Column Keys are letter representations of an index. For example:
```
0 = A
1 = B
...
25 = Z
26 = AA
51 = AZ
...
```

- `columnKey` `<String>`

```js
var index = PV.getIndexByColumnKey('AC');
```