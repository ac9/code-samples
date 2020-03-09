### ``getProviderModelUrl(jsapi, [options])``
Sets the provider model url with the model id from provider model info.
- `jsapi` `<Object>`
- `options` `<Object>`

```js
var jsapi = {
	mongo: {
		modelId: 'pvmodel://Database.pvelocity.com/a39f04ac-a911-46bc-81b9-39eebf5a0802'
	}
};
pvh.getProviderModelUrl(jsapi, {
    socketTimeoutMS: 600000
});
```