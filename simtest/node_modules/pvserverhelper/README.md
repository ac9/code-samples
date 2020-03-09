# pvserverhelper

This is an npm module design to perform common uses with pVelocity's [pvserver](https://github.com/pVelocity/pvserver).

## Getting Started

Install the ``pvserverhelper`` module.

    npm install --save pvserverhelper

Use the require statement to load the module.

```js
var pvh = require('pvserverhelper');
```

## Methods

### pvserver
- [login](docs/pvserver/login.md)
- [loginWithSession](docs/pvserver/loginWithSession.md)
- [getProviderModelInfo](docs/pvserver/getProviderModelInfo.md)
- [getProviderModelUrl](docs/pvserver/getProviderModelUrl.md)
- [parseProviderModelUrl](docs/pvserver/parseProviderModelUrl.md)
- [createSalesforceProviderModel](docs/pvserver/createSalesforceProviderModel.md)
- [createSalesforceProviderModelWithSession](docs/pvserver/createSalesforceProviderModelWithSession.md)
- [createMongoProviderModel](docs/pvserver/createMongoProviderModel.md)
- [getEntityGroupsAndFields](docs/pvserver/getEntityGroupsAndFields.md)
- [convertGroupOrFieldArrayForQueryParams](docs/pvserver/convertGroupOrFieldArrayForQueryParams.md)
- [removeEntityRelationshipGroupAndFields](docs/pvserver/removeEntityRelationshipGroupAndFields.md)
- [getGroupsOrFieldsFromQueryParams](docs/pvserver/getGroupsOrFieldsFromQueryParams.md)
- [getGroupValueFromQueryParams](docs/pvserver/getGroupValueFromQueryParams.md)
- [getGroupValuesFromQueryParams](docs/pvserver/getGroupValuesFromQueryParams.md)
- [getLastComponentSelections](docs/pvserver/getLastComponentSelections.md)
- [getGroupValueFromGroupFilters](docs/pvserver/getGroupValueFromGroupFilters.md)
- [execServlet](docs/pvserver/execServlet.md)
- [httpMethod](docs/pvserver/httpMethod.md)

### MongoDB
- [setupMongoDBUrl](docs/MongoDB/setupMongoDBUrl.md)
- [createMongoDB](docs/MongoDB/createMongoDB.md)
- [find](docs/MongoDB/find.md)
- [copy](docs/MongoDB/copy.md)
- [move](docs/MongoDB/move.md)
- [createCollection](docs/MongoDB/createCollection.md)
- [createIndices](docs/MongoDB/createIndices.md)
- [dropCollection](docs/MongoDB/dropCollection.md)
- [dropSomeCollections](docs/MongoDB/dropSomeCollections.md)
- [cleanupChildren](docs/MongoDB/cleanupChildren.md)
- [bulkExecute](docs/MongoDB/bulkExecute.md)
- [getProperties](docs/MongoDB/getProperties.md)
- [getAggregateProjectMapping](docs/MongoDB/getAggregateProjectMapping.md)
- [createExpressionMapping](docs/MongoDB/createExpressionMapping.md)
- [aggregateLookup](docs/MongoDB/aggregateLookup.md)

### PVStatus
- [getPVStatus](docs/PVStatus/getPVStatus.md)
- [getResultCode](docs/PVStatus/getResultCode.md)
- [getResultMessage](docs/PVStatus/getResultMessage.md)
- [getResultScriptMessage](docs/PVStatus/getResultScriptMessage.md)
- [isResultOk](docs/PVStatus/isResultOk.md)
- [isResultTruncated](docs/PVStatus/isResultTruncated.md)
- [isResultTooLarge](docs/PVStatus/isResultTooLarge.md)
- [isBulkUpsertInProgress](docs/PVStatus/isBulkUpsertInProgress.md)

### Other
- [listFiles](docs/Other/listFiles.md)
- [setupLogger](docs/Other/setupLogger.md)
- [getErrorMessage](docs/Other/getErrorMessage.md)
- [isEmptyValue](docs/Other/isEmptyValue.md)
- [convertFile](docs/Other/convertFile.md)
- [convertStream](docs/Other/convertStream.md)
- [exec](docs/Other/exec.md)
- [setCallbackTimeout](docs/Other/setCallbackTimeout.md)
- [checkCallbackTimeout](docs/Other/checkCallbackTimeout.md)
- [addOrGetSessionJsapiObject](docs/Other/addOrGetSessionJsapiObject.md)
- [getSessionJsapiObject](docs/Other/getSessionJsapiObject.md)
- [removeSessionJsapiObject](docs/Other/removeSessionJsapiObject.md)
- [serializePromises](docs/Other/serializePromises.md)
- [cleanup](docs/Other/cleanup.md)
- [cleanupForNonCached](docs/Other/cleanupForNonCached.md)
- [returnImmediately](docs/Other/returnImmediately.md)
- [scriptErrHandler](docs/Other/scriptErrHandler.md)
- [genericErrHandler](docs/Other/genericErrHandler.md)

## License

Copyright (c) 2016, pVelocity Inc

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.