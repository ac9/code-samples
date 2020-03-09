### ``getErrorMessage(error, [includeTimestamp])``
Returns error message from error object.
- `error` `<Object>`
- `includeTimestamp` `<Boolean>` : Optional, default is ``false``

```js
pvh.getErrorMessage({
	success: false,
	messsage: 'First attempt',
	Messsage: 'Second attempt'
}, true);
```