### ``aggregateLookup(jsapi, sourceCollectionName, lookupCollectionName, lookupInfo, lookupOperations)``
This replaces your ``sourceCollectionName`` with a projection that includes the lookup fields specified by ``lookupInfo`` from ``lookupCollectionName``.
- `jsapi` `<Object>`
- `sourceCollectionName` `<String>`
- `lookupCollectionName` `<String>`
- `lookupInfo` `<Object>`:
```js
var lookupInfo = {
    'lookupField': {
        sourceKey: 'sourceKey',
        lookupKey: {
            $toUpper: {
                $concat: ['$lookupProperty1', '-', '$lookupProperty2']
            }
        },
        defaultValue: 'defaultValue',
        rename: 'rename',
        tag: 'tag'
    }
};
```
```
lookupField: field in lookupCollectionName that is being looked up
sourceKey: field in sourceCollectionName used as a key to match with lookupCollectionName
lookupKey: fields in lookupCollectionName used $project to construct a key that matches sourceKey
defaultValue: a $set value used to set a default for the lookupField
rename: field that the lookup will be set to, defaulted to lookupField
tag: field that will be tagged true if lookup applied
```
- `lookupOperations` `<Object>`: provides any additional pipeline operations to filter by

```js
var lookupInfo = {
    'index': {
        sourceKey: 'IndexKey',
        lookupKey: {
            $toUpper: 'Name'
        },
        defaultValue: 0
    }
};

var lookupOperations = [{
    $match: {
    	active: true
    }
}];
pvh.aggregateLookup(jsapi, Opportunties, 'Indexes', lookupInfo, lookupOperations).then(function(result) {

});
```