### ``getResultScriptMessage(response)``
Returns `PVStatus.SCRIPT_ERROR_MSG`.
- `response` `<Object>`

```js
var response = {
	PVResponse: {
		PVStatus: {
			Code: 'RPM_PE_STATUS_OK',
			Message: 'Okay',
			SCRIPT_ERROR_MSG:'Okay'
		}
	}
};
pvh.getResultScriptMessage(response);
```