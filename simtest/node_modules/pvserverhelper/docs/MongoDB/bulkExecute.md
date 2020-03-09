### ``bulkExecute(bulk)``
Returns a promise that executes the bulk.
- `bulk` `<Bulk>`

```js
var bulk = mongoConn.collection('Test').initializeOrderedBulkOp();
bulk.find({name: 'hello'}).remove();
pvh.bulkExecute(bulk).then(function(result) {

});
```