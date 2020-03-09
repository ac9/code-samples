### ``matchedIndexOfArray(matchArray, lookupArray)``
Returns the first index of ``lookupArray`` where every element of ``matchArray`` equals every element of the returned index. Returns ``-1`` otherwise.

- `matchArray` `<Array>`
- `lookupArray` `<Array>`

```js
var matchArray = ['b'];
var lookupArray = [['a1', 'a2'], 'b'];
var matchedIndex = PV.matchedIndexOfArray(matchArray, lookupArray);
```