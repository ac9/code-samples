### ``getProviderModelInfo(jsapi, tag, [params])``
Sets the ``tag`` provider model info with an existing session or ``params`` and returns the model id.
- `jsapi` `<Object>`
- `tag` `<String>`
- `params` `<Object>`

Existing Session:
```js
var jsapi = {
    PVSession: {
        engineSessionInfo: {
            providerModelsByTag: {
                MongoDB: {
                    type: 'MongoDB',
                    modelId: 'pvmodel://Database.pvelocity.com/a39f04ac-a911-46bc-81b9-39eebf5a0802',
                    userId: 'admin@sample.com',
                    appName: 'CRM',
                    mongoDBHostName: 'mongoDB_local'
                }
            }
        }
    }
};
pvh.getProviderModelInfo(jsapi, 'MongoDB');
```

From ``params.OpRequest``:
```js
var params = {
	OpRequest: "{"PVRequest":{"Operation":{"Params":{"ProfitModel":{"text":"pvmodel://Database.pvelocity.com/a39f04ac-a911-46bc-81b9-39eebf5a0802"}}}}}"
};
pvh.getProviderModelInfo(jsapi, 'MongoDB', params);
```

From ``params.ProviderModels``:
```js
var params = {
	ProviderModels: "{"MongoDB":{"type":"MongoDB","modelId":"pvmodel://Database.pvelocity.com/a39f04ac-a911-46bc-81b9-39eebf5a0802","userId":"admin@sample.com","appName":"CRM","mongoDBHostName":"mongoDB_local"}}"
};
pvh.getProviderModelInfo(jsapi, 'MongoDB', params);
```