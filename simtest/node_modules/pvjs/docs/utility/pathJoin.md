### ``pathJoin(dir, dirname, delimiter)``
Returns a directory string that joins ``dir`` and ``dirname`` that is recognized by the operating system.

- `dir` `<String>`
- `dirname` `<String>`
- `delimiter` `<String>`: Optional, default is `'/'`

```js
var directory = PV.pathJoin('C:\Databases', 'pv', '\\');
```