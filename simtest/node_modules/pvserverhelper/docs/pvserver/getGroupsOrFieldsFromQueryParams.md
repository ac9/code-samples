### ``getGroupsOrFieldsFromQueryParams(groupsOrFieldsParams)``
Return an array of groups or fields from the Groups and Fields parameters of a RPM API Query in ``groupsOrFieldsParams``.
- `groupsOrFieldsParams` `<Object>`

```js
var groupsOrFieldsParams = {
    Group: [{
        _attrs: {name: "Res1"},
        _text: "group1"
    }, {
        _attrs: {name: "Res1"},
        _text: "group2"
    }]
};
pvh.getGroupsOrFieldsFromQueryParams(groupsOrFieldsParams);
```