### ``getGroupValueFromGroupFilters(selections, groupName)``
Return an array of group values from the selections of a component that match with ``groupName``.
- `selections` `<Array>`
- `groupName` `<String>`

```js
var selections = [{
    "GroupFilter": [
    {
        "Group": "CommitmentLTC.round",
        "Value": "5b43df23ec799c6e421094af"
    },
    {
        "Group": "CommitmentGBU.round",
        "Value": "5b43df23ec799c6e421094af"
    },
    {
        "Group": "Round.roundId",
        "Value": "5b43df23ec799c6e421094af"
    },
    {
        "Group": "MongoDB.Rounds._id",
        "Value": "5b43df23ec799c6e421094af"
    },
    {
        "Group": "Round.phase",
        "Value": "Segment Generation"
    },
    {
        "Group": "MongoDB.Rounds.phase",
        "Value": "Segment Generation"
    }]
}];
pvh.getGroupValueFromGroupFilters(selections, 'MongoDB.Rounds.phase');
```