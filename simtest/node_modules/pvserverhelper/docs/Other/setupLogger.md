### ``setupLogger(jsapi, [timestamp])``
Setups a logger for logging messages.
- `jsapi` `<Object>`
- `timestamp` `<Boolean>` : Optional, default is ``false``

```js
pvh.setupLogger(jsapi);
```

Logger with default winston.
```js
var jsapi = {
	logger: require('winston')
};
jsapi.logger.add(jsapi.logger.transports.File, {
    level: 'info',
    filename: '.\log.txt',
    maxsize: '10000000', //10MB,
    json: false,
    timestamp: new Date
});
pvh.setupLogger(jsapi);
```

Logger with instance winston.
```js
var winston = require('winston')
var jsapi = {};
jsapi.logger = new winston.Logger({
    transports: [new(winston.transports.File)({
        level: 'info',
        maxsize: '10000000', //10MB,
        json: false,
        timestamp: new Date,
        filename: .\log.txt'
    })]
});
pvh.setupLogger(jsapi);

var jsapi2 = {};
jsapi2.logger = new winston.Logger({
    transports: [new(winston.transports.File)({
        level: 'info',
        maxsize: '10000000', //10MB,
        json: false,
        timestamp: new Date,
        filename: .\log2.txt'
    })]
});
pvh.setupLogger(jsapi2);
```

### ``info(message)``
Logs a message with `INFO`.
- `message` `<String>`

```js
jsapi.logger.info('Hello World');
```

### ``error(error, throwError)``
Logs a ``error`` with `ERROR`.
- `error` `<Object>`
- `throwError` `<Boolean>` : Optional, default is ``true``

```js
jsapi.logger.error({
	message: 'Opps'
});
```

### ``startTime(message)``
Returns an object to track a message and when it started.
- `message` `<String>`

```js
var helloTime = jsapi.logger.startTime('Hello');
```

### ``endTime(timerObj)``
Logs the message in ``timerObj`` with `TIMER`.
- `timerObj` `<Object>`

```js
var helloTime = jsapi.logger.startTime('Hello');
jsapi.logger.endTime(helloTime);
```