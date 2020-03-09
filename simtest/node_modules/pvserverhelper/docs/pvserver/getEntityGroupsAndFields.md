### ``getEntityGroupsAndFields(entity, entityArray)``
Returns the meta info from ``entityArray`` for ``entity``.
- `entity` `<String>`
- `entityArray` `<Array>`

```js
var entityArray = [{
	Name: 'Opportunities',
	Groups: {
		Group: [{
			Category: 'Opportunities',
			IntName: 'Opportunities_name',
			ExtName: 'Opportunities Name',
			Properties: {
				KeyValue: [{
					Key: 'type',
					Value: 'text'
				}]
			}
		}]
	},
	Fields: {
		Fields: [{
			Category: 'Opportunities',
			IntName: 'Opportunities_value',
			ExtName: 'Opportunities Value',
			Properties: {
				KeyValue: [{
					Key: 'type',
					Value: 'number'
				}]
			}
		}]
	}
}];
pvh.getEntityGroupsAndFields('Opportunities', entityArray);
```