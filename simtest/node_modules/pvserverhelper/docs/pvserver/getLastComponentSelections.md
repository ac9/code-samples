### ``getLastComponentSelections(components)``
Return an array of group filters from the last selection from the ``components``.
- `components` `<Array>`

```js
var components = [{
    "Selection": {
        "GroupFilter": [{
                "Group": "CommitmentLTC.roundName",
                "Value": "Test2"
            },
            {
                "Group": "Round.name",
                "Value": "Test2"
            },
            {
                "Group": "MongoDB.Rounds.name",
                "Value": "Test2"
            },
            {
                "Group": "CommitmentLTC.roundCreationDate",
                "Value": "2018-07-09T22:18:50.154+0000"
            },
            {
                "Group": "Round.creationDate",
                "Value": "2018-07-09T22:18:50.154+0000"
            },
            {
                "Group": "MongoDB.Rounds.creationDate",
                "Value": "2018-07-09T22:18:50.154+0000"
            }
        ]
    }
}, {
    "Selection": {
        "GroupFilter": [{
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
            }
        ]
    }
}]

pvh.getLastComponentSelections(components);
```