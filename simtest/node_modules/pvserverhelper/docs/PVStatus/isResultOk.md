### ``isResultOk(response)``
Checks if `PVStatus` is Okay.
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
pvh.isResultOk(response);
```