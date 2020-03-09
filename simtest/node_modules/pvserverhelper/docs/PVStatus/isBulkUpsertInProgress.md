### ``isBulkUpsertInProgress(response)``
Checks if `PVStatus` is bulk upsert is in progress.
- `response` `<Object>`

```js
var response = {
	PVResponse: {
		PVStatus: {
			Code: 'RPM_PE_QUERY_RESULT_OK_UPSERT_IN_PROGRESS'
		}
	}
};
pvh.isBulkUpsertInProgress(response);
```