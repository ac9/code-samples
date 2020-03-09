### ``getGroupValuevFromQueryParams(queryParams, objectName, groupName)``
Return the group values as an ``array`` from the parameters of a RPM API Query for ``objectName``'s ``groupName``.
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
        },{
            _attrs: {
                category: 'Opportunities'
            },
            AndFilter: [{
                    Filter: "Opportunities_name='Test1'"
                }
            ]
        }]
    }
};
pvh.getGroupValuesFromQueryParams(queryParams, 'Opportunities', 'Opportunities_name');
```