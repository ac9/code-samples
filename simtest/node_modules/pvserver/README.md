# pvserver

This is an npm module used to communicate with a pVelocity Application Server using its RPM API web services.

[![pVelocity Logo](https://s3-us-west-2.amazonaws.com/pvmarketing/logo/pV+logo+transparent.png)](http://www.pvelocity.com)

##Introduction

pVelocity Inc. is an enterprise software company providing collaborative workflow solutions.

<img src="https://s3-us-west-2.amazonaws.com/pvmarketing/Images/Solution.png" width=700/>

pVelocity built the [CRMflow](http://www.crmflow.com) workflow platform. This platform is purpose built for connecting disparate data sources (e.g. from ERP and CRM systems) into concise workflows tailored to support specific business processes (including but not limited to):

* Cost Management
* Price Management
* Profit and Margin Management
* Customer Relationship Management
* Continuous Improvement

The pVelocity Reference Profit Model (RPM) API is used by pVelocity client software to communicate with the pVelocity Application Server (__AS__). The __AS__ fulfills analytical queries, simulate scenarios, and make transactional changes to business objects used within the business workflows managed by the server. With the [CRMflow](http://www.crmflow.com) platform, users can quickly turn insights into actions, accelerating the decision making cycle towards continuous improvements.

The ``pserver`` is a coarse grained Node module used to make __RPM API__ requests. Users can use this module to customize and augment existing workflows. The module can also be used to facilitate certain backend processes, such as periodic and automated report generation or notifications. Please contact your pVelocity administrator for reference documentation relating to the __RPM API__.

For a more detail account of our solution, please visit us at [www.pvelocity.com](http://www.pvelocity.com)

##Getting Started

Install the ``pvserver`` module.

    npm install --save pvserver

Use the require statement to load the module.

```js
var pvserver = require('pvserver');
```

Connect to a known pVelocity Application Server by creating an ``PVServerAPI`` instance.

```js
var pv = new pvserver.PVServerAPI("http://domain.com");
```

All RPM API requests must be preceded by a successful login. Below is an example flow of how to perform a login and then followed by a simple query.

```js
    pv.login("demoUser", "password", null).
    then(function(json) {

        console.log(`Result: ${JSON.stringify(json)}\n`);

        // Query order margins related to industries

        var queryParamsJson = {
            'Currency': 'USD',
            'ProfitModel': 'PipelineProduct',
            'Category': 'Sales',
            'Groups': {
                'Group': [{
                    '_attrs': {
                        'name': 'Res1'
                    },
                    '_text': 'PV_Industry'
                }]
            },
            'Fields': {
                'Field': 'PV_Order_Margin'
            },
            'SearchCriteria': {
                'DateRange': {
                    '_attrs': {
                        'ignoreBaseQuery': true
                    },
                    'From': {
                        'Year': 1000,
                        'Month': '01'
                    },
                    'To': {
                        'Year': 2999,
                        'Month': '06'
                    }
                }
            }
        };

        return pv.sendRequest('Query', queryParamsJson);

    }).then(function(json) {

        // Print out the results and logout
        console.log(`Result: ${JSON.stringify(json)}\n`);
        return pv.logout();

    }).catch(pvserver.PVServerError, function(err) {

        // Catches any errors returned from the application server
        console.log(`Unexpected Application Server Error:`);
        console.log(`${err.code}: ${err.message()}, ${JSON.stringify(err.status)}}`);

    }).catch(function(err) {

        // Catches other node.js errors
        console.log(`Unexpected Error: ${err.message}`);

    });
```

For a more indepth example, please consult the following [script](https://github.com/pVelocity/pvserver/blob/master/test/index.js).

##Methods

All functions can be used in [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) style or with traditional Node callback style. This module uses [bluebird](http://bluebirdjs.com/docs/getting-started.html) to give you Promise.

If the function is called without a callback function, then it will return a Promise object, otherwise the call ``callback(err, json)`` will be used.

For a detail account of all valid RPM API operations and their corresponding parameters, please contact your pVelocity administrator.

###``sendRequest(operation, parameters)``

Send a request to the application server. The ``operation`` parameter indicates the name of the operation that the application server should perform. The ``parameters`` is either an object containing the required and optional parameters needed by the operation, or it can also be an XML parameter string.

###``sendFormRequest(operation, parameters)``

Similar to ``sendRequest``, but uses the multipart/form-data encoding.

###``login(user_id, password, credential_key)``

Login to the application server with the ``user_id`` using either the ``password`` or the ``credential_key``. The state of the authentication is stored within the ``PVServerAPI`` instance.

###``logout()``

Logout of the application server. The ``PVServerAPI`` instance can be reused again by calling ``login``.

###``getHTML5ShareLink(html5loginContext)``

This function is only applicable to JSAPI2 functions. Use this function to request a shared URL that represents the current workflow of a given HTML5 user session from the pVelocity HTML5 server. Below is a sample usage provided in a form of an JSAPI2 function:

```js

function(params, callback) {

    var pv = new this.pvserver.PVServerAPI(this.PVSession.engineSessionInfo.url);

    pv.getHTML5ShareLink(this.PVSession.engineSessionInfo.html5loginContext).then(function(json) {

        var link = json.sharingUrl;

        callback(null, {'link': link});

    }).catch(function(err) {

        callback(err);

    });

};

```

###``refreshWorkflow(html5loginContext)``

This function is only applicable to JSAPI2 functions. Use this function to request a workflow refresh on workflows that is being viewed by the HTML5 user session. This is similar to pressing the refresh button on all opened browser window or tabs with the same user session. Note that the engine session must be established by the HTML5 server for this function to work properly. Below is a sample usage provided in a form of an JSAPI2 function:

```js

function(params, callback) {

    var pv = new this.pvserver.PVServerAPI(this.PVSession.engineSessionInfo.url);
    pv.refreshWorkflow(this.PVSession.engineSessionInfo.html5loginContext);

    // The function returns an empty object '{}'
    callback(null);

};

```

##License

Copyright (c) 2016, pVelocity Inc

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.