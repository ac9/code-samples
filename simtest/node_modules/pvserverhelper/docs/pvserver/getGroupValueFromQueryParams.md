### ``getGroupValueFromQueryParams(queryParams, objectName, groupName)``
Return the last group value from the parameters of a RPM API Query for ``objectName``'s ``groupName``.
- `queryParams` `<Object>`
- `objectName` `<String>`
- `groupName` `<String>`

```js
var queryParams = {
    AndFilter: {
        OrFilter: [{
            _attrs: {
                category: 'Opportunities'
            },
            AndFilter: [{
                    Filter: "Opportunities_name='Test'"
                }
            ]
        }]
    }
};
pvh.getGroupValueFromQueryParams(queryParams, 'Opportunities', 'Opportunities_name');
```