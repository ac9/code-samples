### ``isResultTruncated(response)``
Checks if `PVStatus` is Truncated.
- `response` `<Object>`

```js
var response = {
	PVResponse: {
		PVStatus: {
			Code: 'RPM_PE_QUERY_RESULT_TRUNCATED'
		}
	}
};
pvh.isResultTruncated(response);
```