### ``serializePromises(workFunction, workContext, workArray)``
Executes functions in synchronous rather than asynchronous in a promise. If ``workFunction`` is an array, each element of ``workFunction`` will be executed with the same index for ``workArray``. If ``workFunction`` is a function, it will be executed with each element of ``workArray``. If ``workContext`` is an array, each element of ``workContext`` will be the context with the same index for ``workFunction``. If ``workContext`` is an Object, it will be executed with each element of ``workFunction``.
- `workFunction` `<Array> or <Function>`
- `workContext` `<Array> or <Object>`
- `workArray` `<Array>`

```js
var workFunction = [pvh.exec, pvh.exec];
var workContext = [this, this];
var workArray = ['echo hello', 'echo bye'];
pvh.serializePromises(workFunction, workContext, workArray);
```
