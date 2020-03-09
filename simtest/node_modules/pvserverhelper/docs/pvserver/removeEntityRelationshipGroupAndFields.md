### ``removeEntityRelationshipGroupAndFields(meta, entity, relationshipPatterns, [not])``
Removes relationship ``relationshipPatterns`` groups and fields for ``entity``.
- `meta` `<Object>`
- `entity` `<String>`
- `relationshipPatterns` `<Array>`
- `not` `<Boolean>`: Optional, default is `false`

```js
var meta = {
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
		}, {
			Category: 'Opportunities',
			IntName: 'Opportunities_account_name',
			ExtName: 'Opportunities Account Name',
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
		}, {
			Category: 'Opportunities',
			IntName: 'Opportunities_account_value',
			ExtName: 'Opportunities Account Value',
			Properties: {
				KeyValue: [{
					Key: 'type',
					Value: 'number'
				}]
			}
		}]
	}
}
pvh.removeEntityRelationshipGroupAndFields(meta, 'Account', ['name', 'value']);
```