/*global PV, emit*/
'use strict';

/* jshint strict: true */
/* jshint node: true */
/* jshint unused: false */

const iconv = require('iconv-lite');
const fs = require('fs');
const mongodb = require('mongodb');
const pvserver = require('pvserver');
const Converter = require('csvtojson').Converter;
const path = require('path');
const http = require('http');
const https = require('https');
const util = require('util');

require('pvjs');

module.exports = {
  sessionJsapiCache: {},
  callbackTimeouts: {},

  addOrGetSessionJsapiObject: function(jsapi, sessionId) {
    if (this.sessionJsapiCache.hasOwnProperty(sessionId)) {
      return this.sessionJsapiCache[sessionId];
    } else {
      jsapi.isCached = true;
      this.sessionJsapiCache[sessionId] = jsapi;
      return jsapi;
    }
  },

  getSessionJsapiObject: function(jsapi, sessionId) {
    if (PV.isObject(this.sessionJsapiCache[sessionId])) {
      return this.sessionJsapiCache[sessionId];
    } else {
      return jsapi;
    }
  },

  removeSessionJsapiObject: function(jsapi, sessionId) {
    if (PV.isObject(this.sessionJsapiCache[sessionId])) {
      let cachedJsapi = this.sessionJsapiCache[sessionId];
      cachedJsapi.isCached = null;
      delete this.sessionJsapiCache[sessionId];
      return cachedJsapi;
    } else {
      return jsapi;
    }
  },

  cleanupForNonCached: async function(jsapi) {
    if (PV.isBoolean(jsapi.isCached) && jsapi.isCached) {

    } else {
      await this.cleanup(jsapi);
    }
  },

  serializePromises: function(workFunction, workContext, workArray) {
    let results = [];
    return new Promise(function(resolve, reject) {
      let func = workFunction;
      let context = workContext;
      let next = function(curIndex) {
        if (curIndex < workArray.length) {
          if (PV.isArray(workFunction)) {
            func = workFunction[curIndex];
          }
          if (PV.isArray(workContext)) {
            context = workContext[curIndex];
          }

          func.apply(context, workArray[curIndex]).then(function(result) {
            results.push(result);

            setImmediate(function() {
              next(curIndex + 1);
            });
          }).catch(function(err) {
            reject(err);
          });
        } else {
          resolve(results);
        }
      };

      try {
        next(0);
      } catch (err) {
        reject(err);
      }
    });
  },

  cleanup: async function(jsapi) {
    if (jsapi.mongoConn) {
      try {
        await jsapi.mongoConn.close();
      } catch (ignore) {}
      jsapi.mongoConn = null;
      jsapi.mongoConnDb = null;
    }

    if (jsapi.sfdcConn) {
      if (PV.isObject(jsapi.sfdc) === false || jsapi.sfdc.isSession !== true) {
        try {
          jsapi.sfdcConn.logoutAsync = util.promisify(jsapi.sfdcConn.logout);
          await jsapi.sfdcConn.logoutAsync();
        } catch (ignore) {}
      }
      jsapi.sfdcConn = null;
    }

    if (jsapi.pv) {
      try {
        await jsapi.pv.logout();
      } catch (ignore) {}
      jsapi.pv = null;
    }
  },

  returnImmediately: function(callback) {
    throw {
      'code': 'RETURN_IMMEDIATELY',
      'callback': function() {
        callback(null, null);
      }
    };
  },

  scriptErrHandler: function(jsapi, callback, passError) {
    let fn = async function(error) {

      await this.cleanupForNonCached(jsapi);

      let err = error;
      if (error.json) {
        err = this.getPVStatus(error.json)
      }
      err.message = this.getErrorMessage(err);

      if (PV.isString(err.SCRIPT_ERROR_CODE)) {
        err.code = err.SCRIPT_ERROR_CODE;
      } else if (PV.isString(err.code)) {

      } else if (PV.isString(err.Code)) {
        err.code = err.Code;
      } else if (PV.isFunction(err.code)) {
        err.code = err.code();
      } else {
        err.code = 'JSAPI2_UNKNOWN_ERROR';
      }

      if (err.code === 'RETURN_IMMEDIATELY' && typeof(err.callback) === 'function') {
        err.callback();
      } else {
        if (PV.isBoolean(passError) && passError) {
          callback(null, {
            'code': `${err.code}`,
            'message': `${err.message}`
          });
        } else {
          callback({
            'code': `${err.code}`,
            'message': `${err.message}`
          }, null);
        }
      }
    }.bind(this);
    return fn;
  },

  genericErrHandler: function(jsapi, callback, passError) {
    let fn = async function(err) {
      await this.cleanupForNonCached(jsapi);

      if (PV.isBoolean(passError) && passError) {
        callback(null, {
          'code': 'JSAPI2_UNKNOWN_ERROR',
          'message': `The function encountered an unknown error.\n${JSON.stringify(err)}\n`
        });
      } else {
        callback({
          'code': 'JSAPI2_UNKNOWN_ERROR',
          'message': `The function encountered an unknown error.\n${JSON.stringify(err)}\n`
        }, null);
      }
    }.bind(this);
    return fn;
  },

  getErrorMessage: function(error, includeTimestamp) {
    let err = error;
    if (error.json) {
      err = this.getPVStatus(error.json);
    }

    let message = '';
    if (PV.isString(err.SCRIPT_ERROR_MSG)) {
      message = err.SCRIPT_ERROR_MSG;
    } else if (PV.isString(err.message)) {
      message = err.message;
    } else if (PV.isString(err.Message)) {
      message = err.Message;
    } else if (PV.isFunction(err.message)) {
      message = err.message();
    } else {
      message = 'No Relevant Message';
    }

    let timedMsg = '';
    if (includeTimestamp === true) {
      timedMsg = PV.getTimestamp() + ' - ' + message;
    } else {
      timedMsg = message;
    }
    return timedMsg;
  },

  setupLogger: function(jsapi, timestamp) {
    if (PV.isObject(jsapi.logger) === false) {
      jsapi.logger = {
        timestamp: timestamp
      };
    }
    jsapi.logger.info = function(message) {
      let timedMsg = '';
      if (jsapi.logger.timestamp === true) {
        timedMsg = PV.getTimestamp() + ' - ' + message;
      } else {
        timedMsg = message;
      }
      if (PV.isObject(jsapi.logger) && PV.isFunction(jsapi.logger.log)) {
        jsapi.logger.log('info', timedMsg);
      } else if (PV.isFunction(jsapi.log)) {
        jsapi.log('info', timedMsg);
      } else {
        console.log('INFO: ' + timedMsg);
      }
    };
    jsapi.logger.infoAsync = function(message) {
      return new Promise(function(resolve) {
        resolve(jsapi.logger.info(message));
      });
    };
    jsapi.logger.error = function(error, throwError) {
      let message = this.getErrorMessage(error, jsapi.logger.timestamp);

      if (PV.isObject(jsapi.logger) && PV.isFunction(jsapi.logger.log)) {
        jsapi.logger.log('error', message);
      } else if (PV.isFunction(jsapi.log)) {
        jsapi.log('error', message);
      } else {
        console.log('ERROR: ' + message);
      }
      if (throwError !== false) {
        throw error;
      }
    }.bind(this);
    jsapi.logger.errorAsync = function(message) {
      return new Promise(function(resolve) {
        resolve(jsapi.logger.error(message));
      });
    };
    jsapi.logger.startTime = function(message) {
      let timerObj = {
        startTime: new Date(),
        message: message
      };
      return timerObj;
    };
    jsapi.logger.endTime = function(timerObj) {
      let timedMsg = timerObj.message;
      let endTime = new Date();
      let elapsedTime = (endTime - timerObj.startTime) / 1e3;
      timedMsg = timedMsg + ' - ElaspedTime: ' + elapsedTime + 's';
      if (PV.isObject(jsapi.logger) && PV.isFunction(jsapi.logger.log)) {
        jsapi.logger.log('TIMER', timedMsg);
      } else if (PV.isFunction(jsapi.log)) {
        jsapi.log('error', timedMsg);
      } else {
        console.log('TIMER: ' + timedMsg);
      }
    };
  },

  convertFile: function(source, target, options, decoding, encoding) {
    return new Promise(function(resolve, reject) {
      let rd = fs.createReadStream(source);
      let wr = fs.createWriteStream(target);

      if (PV.isObject(options) === false) {
        options = {};
      }

      this.convertStream(rd, wr, resolve, reject, options, decoding, encoding);
    }.bind(this));
  },

  convertStream: function(rd, wr, successCallback, failureCallback, options, decoding, encoding) {
    let converter = null;
    if (PV.isObject(options)) {
      converter = new Converter(options);
    }

    rd.on('error', rejectCleanup);
    wr.on('error', rejectCleanup);

    function rejectCleanup(err) {
      rd.destroy();
      wr.end();
      failureCallback(err);
    }
    wr.on('finish', successCallback);

    if (PV.isString(decoding) && PV.isString(encoding)) {
      if (PV.isObject(options)) {
        rd.pipe(iconv.decodeStream(decoding))
          .pipe(iconv.encodeStream(encoding))
          .pipe(converter)
          .pipe(wr);
      } else {
        rd.pipe(iconv.decodeStream(decoding))
          .pipe(iconv.encodeStream(encoding))
          .pipe(wr);
      }
    } else if (PV.isObject(options)) {
      rd.pipe(converter).pipe(wr);
    } else {
      rd.pipe(wr);
    }
  },

  saveFile: function(url, dest, headers) {
    return new Promise(function(resolve, reject) {
      let file = fs.createWriteStream(dest);

      let options = {
        method: 'GET',
        gzip: true,
        headers: {
          'user-agent': 'pvserverhelper',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
          'Cache-Control': 'max-age=0',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      };
      if (PV.isObject(headers)) {
        for (let headerKey in headers) {
          options.headers[headerKey] = headers[headerKey];
        }
      }

      let reqClient = http;
      if (url.startsWith('https')) {
        reqClient = https;
      }

      let req = reqClient.request(url, options, function(res) {
        res.pipe(file);
        res.on('end', () => {
          resolve();
        });
      });
      req.on('error', (e) => {
        file.end();
        reject(e);
      });
    });
  },

  execServlet: function(jsapi, headers, operation, params) {
    return new Promise(function(resolve, reject) {
      let options = {
        headers: {
          'user-agent': 'pvserverhelper',
          'content-type': 'application/x-www-form-urlencoded',
          'cache-control': 'no-cache',
          'pragma': 'no-cache'
        }
      };

      if (PV.isObject(headers)) {
        for (let headerKey in headers) {
          options.headers[headerKey] = headers[headerKey];
        }
      }

      let url = jsapi.pv.urlScheme + '://' + jsapi.pv.hostName + ':' + jsapi.pv.hostPort + '/admin/' + operation;

      if (PV.isObject(params)) {
        let args = [];
        for (let paramKey in params) {
          args.push(paramKey + '=' + params[paramKey]);
        }
        url = url + '?' + args.join('&');
      }

      options.method = 'POST';

      let reqClient = http;
      if (url.startsWith('https')) {
        reqClient = https;
      }

      let req = reqClient.request(url, options, function(res) {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          res.body = data;
          resolve(res);
        });
      });
      req.on('error', (e) => {
        reject(e);
      });

      // Write data to request body
      req.write('');
      req.end();
    });
  },

  exec: function(jsapi, cmd, options) {
    return new Promise(function(resolve, reject) {
      try {
        let exec = require('child_process').exec;
        if (PV.isObject(options) === false) {
          options = {};
        }
        exec(cmd, options, function(error, stdout, stderr) {
          if (error) {
            reject(error);
          } else {
            jsapi.logger.info('stdout: ' + stdout, true);
            jsapi.logger.info('stderr: ' + stderr, true);
            resolve({
              'stdout': stdout,
              'stderr': stderr
            });
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  spawn: function(jsapi, cmd, args, options) {
    return new Promise(function(resolve, reject) {
      try {
        let spawn = require('child_process').spawn;
        if (PV.isObject(options) === false) {
          options = {};
        }
        spawn(cmd, args, options, function(pid, output, stdout, stderr, status, signal, error) {
          if (error) {
            reject(error);
          } else {
            jsapi.logger.info('stdout: ' + stdout, true);
            jsapi.logger.info('stderr: ' + stderr, true);
            resolve({
              'pid': pid,
              'output': output,
              'stdout': stdout,
              'stderr': stderr,
              'status': status,
              'signal': signal
            });
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  bulkExecute: function(bulk) {
    return new Promise(function(resolve, reject) {
      bulk.execute(function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  dropSomeCollections: function(jsapi, matchFunction) {
    return jsapi.mongoConnDb.listCollections({}).toArray().then(function(result) {
      let promises = [];
      result.forEach(function(collection) {
        if (matchFunction(collection.name)) {
          promises.push(jsapi.mongoConnDb.collection(collection.name).drop());
        }
      });
      return Promise.all(promises);
    });
  },

  dropCollection: function(jsapi, collectionName) {
    return jsapi.mongoConnDb.listCollections({
      name: collectionName
    }).toArray().then(function(result) {
      if (result.length > 0) {
        return jsapi.mongoConnDb.collection(collectionName).drop();
      } else {
        return;
      }
    });
  },

  createCollection: function(jsapi, collectionName, drop, indices) {
    return jsapi.mongoConnDb.listCollections({
      name: collectionName
    }).toArray().then(function(result) {
      if (result.length === 0) {
        return jsapi.mongoConnDb.createCollection(collectionName);
      } else if (drop) {
        return jsapi.mongoConnDb.collection(collectionName).drop().then(function() {
          return jsapi.mongoConnDb.createCollection(collectionName);
        });
      } else {
        return false;
      }
    }).then(function(result) {
      if (PV.isObject(result) && PV.isArray(indices)) {
        return jsapi.mongoConnDb.collection(collectionName).createIndexes(indices);
      } else {
        return result;
      }
    }.bind(this));
  },

  // this replaces your source collection with a projection that includes the lookup fields
  // lookupField: field in lookupCollectionName that is being looked up
  // sourceKey: field in sourceCollectionName used as a key to match with lookupCollectionName
  // lookupKey: fields in lookupCollectionName used $project to construct a key that matches sourceKey
  // defaultValue: a $set value used to set a default for the lookupField
  // rename: field that the lookup will be set to, defaulted to lookupField
  // tag: field that will be tagged true if lookup applied
  // let lookupInfo = {
  //     'lookupField': {
  //         sourceKey: 'sourceKey',
  //         lookupKey: {
  //             $toUpper: {
  //                 $concat: ['$lookupProperty1', '-', '$lookupProperty2']
  //             }
  //         },
  //         defaultValue: 'defaultValue',
  //         rename: 'rename',
  //         tag: 'tag'
  //     }
  // };
  aggregateLookup: function(jsapi, sourceCollectionName, lookupCollectionName, lookupInfo, lookupOperations) {
    let id = PV.getTimestamp() + Math.random();
    let tempLookupCollection = 'AG_' + PV.createHash(lookupCollectionName + '_' + id, 32);
    let tempSourceCollection = 'AG_' + PV.createHash(sourceCollectionName + '_' + id, 32);

    let lookupDuplicate = [];
    let indices1 = [];

    let project = {
      _id: 0
    };
    for (let lookupField in lookupInfo) {
      project[lookupField] = '$' + lookupField;

      let lookup = lookupInfo[lookupField];
      let lookupKeyString = JSON.stringify(lookup.lookupKey);

      let lookupKey = PV.createHash(lookupKeyString + '1_' + id, 32);
      if (lookupDuplicate.indexOf(lookupKeyString) === -1) {
        project[lookupKey] = PV.isString(lookup.lookupKey) ? '$' + lookup.lookupKey : lookup.lookupKey;
        lookupDuplicate.push(lookupKeyString);
        let key = {};
        key[lookupKey] = 1;
        indices1.push({
          key: key
        });
      }
    }
    lookupDuplicate = [];

    let promises = [];
    promises.push(jsapi.mongoConnDb.collection(sourceCollectionName).indexInformation({ full: true }));
    promises.push(this.createCollection(jsapi, tempLookupCollection, true, indices1));

    return Promise.all(promises).then(function(results) {
      let pipeline = [];
      if (PV.isArray(lookupOperations)) {
        lookupOperations.forEach(function(operation) {
          pipeline.push(operation);
        });
      }

      pipeline.push({
        $project: project
      });

      pipeline.push({
        $out: tempLookupCollection
      });

      let indices2 = results[0];
      indices2.forEach(function(index) {
        for (let prop in index) {
          if (['name', 'unique', 'key'].includes(prop) === false) {
            delete index[prop];
          }
        }
      });

      let promises = [];
      promises.push(this.getAggregateProjectMapping(jsapi, sourceCollectionName));
      promises.push(this.createCollection(jsapi, tempSourceCollection, true, indices2));
      promises.push(jsapi.mongoConnDb.collection(lookupCollectionName).aggregate(pipeline, {
        allowDiskUse: true
      }).toArray());

      return Promise.all(promises);
    }.bind(this)).then(function(results) {
      let project = results[0];

      let pipelineLookup = [];
      let pipelineUnwind = [];

      let tempKeyDuplicate = [];

      for (let lookupField in lookupInfo) {
        let lookup = lookupInfo[lookupField];
        let lookupKeyString = JSON.stringify(lookup.lookupKey);

        let lookupKey = PV.createHash(lookupKeyString + '1_' + id, 32);
        let tempKey = PV.createHash(lookup.sourceKey + '2_' + id, 32);
        let lookupFieldKey = PV.createHash(lookupField + '3_' + id, 32);
        if (lookupDuplicate.indexOf(lookupKeyString) === -1 && tempKeyDuplicate.indexOf(tempKey) === -1) {
          pipelineLookup.push({
            $lookup: {
              from: tempLookupCollection,
              localField: lookup.sourceKey,
              foreignField: lookupKey,
              as: tempKey
            }
          });

          pipelineUnwind.push({
            $unwind: {
              path: '$' + tempKey,
              preserveNullAndEmptyArrays: true
            }
          });
        }

        project[lookupFieldKey] = '$' + tempKey + '.' + lookupField;

        if (lookupDuplicate.indexOf(lookupKeyString) === -1) {
          lookupDuplicate.push(lookupKey);
        }
        if (tempKeyDuplicate.indexOf(tempKey) === -1) {
          tempKeyDuplicate.push(tempKey);
        }
      }

      let pipeline = pipelineLookup.concat(pipelineUnwind);

      pipeline.push({
        $project: project
      });
      pipeline.push({
        $out: tempSourceCollection
      });

      return jsapi.mongoConnDb.collection(sourceCollectionName).aggregate(pipeline, {
        allowDiskUse: true
      }).toArray();
    }.bind(this)).then(function() {
      let promises = [];

      promises.push(this.dropCollection(jsapi, tempLookupCollection));
      promises.push(this.dropCollection(jsapi, sourceCollectionName));

      let bulk = jsapi.mongoConnDb.collection(tempSourceCollection).initializeOrderedBulkOp();
      for (let lookupField in lookupInfo) {
        let lookup = lookupInfo[lookupField];
        let lookupFieldKey = PV.createHash(lookupField + '3_' + id, 32);

        let defaultValue = lookup.defaultValue;
        if (PV.isNull(defaultValue) === false && PV.isUndefined(defaultValue) === false) {
          let filter = {};
          filter[lookupFieldKey] = {
            $exists: false
          };
          let set = {};
          set[PV.isString(lookup.rename) ? lookup.rename : lookupField] = defaultValue;

          bulk.find(filter).update({
            $set: set
          });
        }

        let rename = {};
        rename[lookupFieldKey] = PV.isString(lookup.rename) ? lookup.rename : lookupField;

        let filter2 = {};
        filter2[lookupFieldKey] = {
          $exists: true
        };

        let update = {
          $rename: rename
        };
        if (PV.isString(lookup.tag)) {
          let set = {};
          set[lookup.tag] = true;
          update.$set = set;
        }
        bulk.find(filter2).update(update);
      }
      if (bulk.length > 0) {
        promises.push(this.bulkExecute(bulk));
      }
      return Promise.all(promises);
    }.bind(this)).then(function() {
      return jsapi.mongoConnDb.collection(tempSourceCollection).rename(sourceCollectionName);
    }.bind(this));
  },

  createExpressionMapping: function(objectOrArray, accumulator, aggregated, include_id) {
    let arr = null;
    if (PV.isArray(objectOrArray)) {
      arr = objectOrArray;
    } else if (PV.isObject(objectOrArray)) {
      arr = Object.keys(objectOrArray);
    }

    let project = {};
    if (PV.isArray(arr)) {
      arr.forEach(function(element) {
        let value = null;
        if (aggregated === true) {
          value = '$_id.' + element;
        } else {
          value = '$' + element;
        }
        if (PV.isString(accumulator)) {
          project[element] = {};
          project[element][accumulator] = value;
        } else {
          project[element] = value;
        }
      });
    }
    if (include_id !== true) {
      project._id = 0;
    }
    return project;
  },

  find: function(jsapi, collectionName, id, projection) {
    let filter = {};
    if (PV.isString(id)) {
      filter._id = new mongodb.ObjectId.createFromHexString(id);
    } else if (PV.isObject(id)) {
      filter._id = id;
    }
    if (PV.isObject(projection) === false) {
      projection = {};
    }
    return jsapi.mongoConnDb.collection(collectionName).find(filter).project(projection).toArray();
  },

  copy: function(jsapi, sourceCollection, targetCollection, filter, projection, overwriteKey) {
    if (PV.isObject(filter) === false) {
      filter = {};
    }
    if (PV.isObject(projection) === false) {
      projection = {};
    }
    let batchSize = 2000;
    return new Promise(async function(resolve, reject) {
      let bulk = jsapi.mongoConnDb.collection(targetCollection).initializeOrderedBulkOp();
      try {
        let cursor = await jsapi.mongoConnDb.collection(sourceCollection).find(filter).project(projection);
        while (await cursor.hasNext()) {
          let item = await cursor.next();
          if (bulk.length > batchSize) {
            await this.bulkExecute(bulk);
            bulk = jsapi.mongoConnDb.collection(targetCollection).initializeOrderedBulkOp();
          }

          if (PV.isString(overwriteKey)) {
            let filter2 = {};
            filter2[overwriteKey] = item[overwriteKey];
            bulk.find(filter2).deleteOne();
          }
          bulk.insert(item);
        }
        if (bulk.length > 0) {
          resolve(this.bulkExecute(bulk));
        } else {
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    }.bind(this));
  },

  move: function(jsapi, sourceCollection, targetCollection, filter, cleanId) {
    if (PV.isObject(filter) === false) {
      filter = {};
    }
    let batchSize = 2000;
    return new Promise(async function(resolve, reject) {
      try {
        let count = await jsapi.mongoConnDb.collection(sourceCollection).find(filter).count();
        while (count > 0) {
          let insertedIds = [];
          let sourceDocs = await jsapi.mongoConnDb.collection(sourceCollection).find(filter).limit(batchSize).toArray();
          let bulk = jsapi.mongoConnDb.collection(targetCollection).initializeUnorderedBulkOp();
          sourceDocs.forEach(function(doc) {
            insertedIds.push(doc._id);
            if (cleanId === true) {
              delete doc._id;
            }
            bulk.insert(doc);
          });
          if (bulk.length > 0) {
            await this.bulkExecute(bulk);
          }
          await jsapi.mongoConnDb.collection(sourceCollection).deleteMany({ _id: { $in: insertedIds } });
          count = await jsapi.mongoConnDb.collection(sourceCollection).find(filter).count();
        }
        if (PV.isEmptyObject(filter)) {
          resolve(this.dropCollection(jsapi, sourceCollection));
        } else {
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    }.bind(this));
  },

  getProperties: function(jsapi, collectionName) {
    let mapFunction = function() {
      for (let key in this) {
        emit(key, null);
      }
    };
    let reduceFunction = function(key, stuff) {
      return null;
    };
    let options = { out: { 'inline': 1 } };
    return jsapi.mongoConnDb.collection(collectionName).mapReduce(mapFunction, reduceFunction, options).then(function(result) {
      return result.map(i => i._id);
    });
  },

  getABOMProperties: function(jsapi, appName, objectName) {
    return jsapi.mongoConnDb.collection('ABOM_Apps').find({
      Name: appName
    }).project({
      _id: 1
    }).toArray().then(function(appArr) {
      let appId = appArr[0]._id;
      return jsapi.mongoConnDb.collection('ABOM_Objects').find({
        Name: objectName,
        App: appId
      }).project({
        _id: 1
      }).toArray();
    }).then(function(objArr) {
      let objId = objArr[0]._id;
      return jsapi.mongoConnDb.collection('ABOM_Properties').find({
        Object: objId,
        Type: {
          $nin: ['expr', 'abomPropertyType', 'function']
        }
      }).project({
        _id: 1,
        Name: 1
      }).toArray();
    }).then(function(propArr) {
      let properties = {};
      propArr.forEach(function(propObj) {
        properties[propObj.Name] = propObj._id;
      });
      return properties;
    });
  },

  getAggregateProjectMapping: function(jsapi, collectionName) {
    return this.getProperties(jsapi, collectionName).then(function(result) {
      return this.createExpressionMapping(result);
    }.bind(this));
  },

  cleanupChildren: function(jsapi, collectionName, id, childrenMap) {
    let projection = {};
    for (let child in childrenMap) {
      projection[childrenMap[child]] = 1;
    }

    return this.find(jsapi, collectionName, id, projection).then(function(result) {
      let promises = [];
      let set = {};

      for (let child in childrenMap) {
        let targets = result[0][childrenMap[child]];
        if (PV.isArray(targets)) {
          set[childrenMap[child]] = [];
        } else {
          set[childrenMap[child]] = null;
        }

        let filter = null;
        if (PV.isArray(targets)) {
          filter = {
            _id: {
              $in: targets
            }
          };
        } else if (PV.isObject(targets)) {
          filter = {
            _id: targets
          };
        }
        if (PV.isObject(filter)) {
          promises.push(jsapi.mongoConnDb.collection(child).deleteMany(filter));
        }
      }

      let updateFilter = {};
      if (PV.isString(id)) {
        updateFilter._id = new mongodb.ObjectId.createFromHexString(id);
      } else if (PV.isObject(id)) {
        updateFilter._id = id;
      }

      promises.push(jsapi.mongoConnDb.collection(collectionName).updateOne(updateFilter, {
        $set: set
      }));

      return Promise.all(promises);
    });
  },

  isEmptyValue: function(value) {
    return PV.isNull(value) || PV.isUndefined(value) ||
      value === '-N/A-' || value === '- N/A -' ||
      (PV.isString(value) && value.trim().length === 0);
  },

  setCallbackTimeout: function(key, timeout, callback) {
    if (PV.isString(key)) {
      if (this.callbackTimeouts.hasOwnProperty(key)) {
        clearTimeout(this.callbackTimeouts[key]);
      }
      this.callbackTimeouts[key] = setTimeout(function() {
        clearTimeout(this.callbackTimeouts[key]);
        delete this.callbackTimeouts[key];
        callback(null, null);
      }.bind(this), timeout);
    } else {
      setTimeout(function() {
        if (key.callbackTracker !== true) {
          key.callbackTracker = true;
          callback(null, null);
        }
      }, timeout);
    }
  },

  checkCallbackTimeout: function(key, callback) {
    if (PV.isString(key)) {
      if (this.callbackTimeouts.hasOwnProperty(key)) {
        clearTimeout(this.callbackTimeouts[key]);
        delete this.callbackTimeouts[key];
        callback(null, null);
      }
    } else {
      if (key.callbackTracker !== true) {
        key.callbackTracker = true;
        callback(null, null);
      }
    }
  },

  login: function(jsapi, protocol, host, port, username, password, credKey, sessionContext, options) {
    return this.loginWithUrl(jsapi, protocol + '://' + host + ':' + port, username, password, credKey, sessionContext, options);
  },

  loginWithUrl: function(jsapi, url, username, password, credKey, sessionContext, options) {
    jsapi.logger.info('Logging in ' + url);
    jsapi.pv = new pvserver.PVServerAPI(url);

    if (PV.isObject(options)) {
      if (PV.isNumber(options.timeOut)) {
        jsapi.pv.timeOut = options.timeOut;
      }
    }

    let params = {
      User: username,
      TimeOut: jsapi.pv.timeOut,
      DeviceName: jsapi.pv.device
    }

    if (PV.isString(password)) {
      params.Password = password;
    }

    if (PV.isString(credKey)) {
      params.CredentialKey = credKey;
    }

    if (PV.isObject(sessionContext)) {
      params.SessionContext = {
        Property: []
      };
      for (let key in sessionContext) {
        params.SessionContext.Property.push({
          '_attrs': {
            'key': key
          },
          Value: sessionContext[key]
        });
      }
    }

    return jsapi.pv.sendRequest('Login', params).then(function(json) {
      jsapi.pv.user = json.PVResponse.PVStatus.User;
      jsapi.pv.role = json.PVResponse.PVStatus.UserGroup;
      return true;
    }).catch(function(err) {
      if (PV.isObject(err.json)) {
        jsapi.logger.error(this.getPVStatus(err.json));
      } else {
        jsapi.logger.error(err);
      }
      return false;
    }.bind(this));
  },

  loginWithSession: function(jsapi, options) {
    return new Promise(function(resolve, reject) {
      if (PV.isObject(jsapi.pv) === false) {
        jsapi.pv = new pvserver.PVServerAPI(jsapi.PVSession.engineSessionInfo.url);
        if (PV.isObject(options)) {
          if (PV.isNumber(options.timeOut)) {
            jsapi.pv.timeOut = options.timeOut;
          }
        }
        jsapi.pv.login(null, null, jsapi.PVSession.engineSessionInfo.apiKey).then(function(resp) {
          resolve(true);
        }).catch(function(err) {
          jsapi.logger.error(this.getPVStatus(err.json), false);
          reject(this.getPVStatus(err.json));
        }.bind(this));
      } else {
        resolve(true);
      }
    }.bind(this))
  },

  parseProviderModelUrl: function(url) {
    let info = {};

    let re = /:[\/][\/]([^\/]+)[\/]([^\/?]+)[?\/]?.*/;
    let m = null;
    if ((m = re.exec(url)) !== null) {
      let host = m[1].split('@');
      if (host.length > 1) {
        let auth = host[0].split(':');
        info.username = auth[0];
        info.password = auth[1];
        info.host = host[1];
      } else {
        info.username = null;
        info.password = null;
        info.host = m[1];
      }
      info.dbname = m[2];
    } else {
      info.host = null;
      info.dbname = null;
    }

    let reOptions = /[?](.*)/;
    if ((m = reOptions.exec(url)) !== null) {
      let allOptions = m[1];
      let options = allOptions.split('&');
      info.options = {};
      options.forEach(function(opt) {
        let opValues = opt.split('=');
        info.options[opValues[0]] = opValues[1];
      });
    } else {
      info.options = null;
    }

    return info;
  },

  getProviderModelInfo: function(jsapi, tag, params) {
    let infoTag = null;
    if (tag === 'MongoDB') {
      infoTag = 'mongo';
    } else if (tag === 'Salesforce') {
      infoTag = 'sfdc';
    }

    if (PV.isObject(jsapi[infoTag]) === false) {
      jsapi[infoTag] = {};
    }

    try {
      let sessionInfo = jsapi.PVSession.engineSessionInfo;
      let providerModelInfo = sessionInfo.providerModelsByTag[tag];
      let connectionInfo = null;
      if (PV.isArray(providerModelInfo)) {
        let userId = (params.userId ? params.userId : sessionInfo.user);
        let appName = params.appName;
        let mongoDBHostName = params.mongoDBHostName;

        let html5AppName = null;
        let html5DataSetId = null;
        if (PV.isObject(sessionInfo.html5loginContext)) {
          html5AppName = sessionInfo.html5loginContext.html5AppName;
          html5DataSetId = sessionInfo.html5loginContext.html5DataSetId;
        }

        let providerModelId = sessionInfo.providerModelId;
        if (PV.isString(userId) && (
            (PV.isString(appName) && PV.isString(mongoDBHostName)) ||
            (PV.isString(providerModelId)))) {
          for (let i = 0; i < providerModelInfo.length; i++) {
            if (providerModelInfo[i].userId === userId && (
                (providerModelInfo[i].appName === appName && providerModelInfo[i].mongoDBHostName === mongoDBHostName) ||
                (providerModelInfo[i].modelId === providerModelId) ||
                (providerModelInfo[i].appName === html5AppName && providerModelInfo[i].dataSetId === html5DataSetId))) {
              connectionInfo = providerModelInfo[i];
            }
          }
        }
      } else if (PV.isObject(providerModelInfo)) {
        connectionInfo = providerModelInfo;
      }

      if (PV.isObject(connectionInfo)) {
        for (let prop in connectionInfo) {
          jsapi[infoTag][prop] = connectionInfo[prop];
        }
      }
      jsapi.logger.info(infoTag + ' Engine Session Info');
    } catch (e1) {
      try {
        jsapi[infoTag].modelId = JSON.parse(params.OpRequest).PVRequest.Operation.Params.ProfitModel.text;
        jsapi.logger.info(infoTag + ' OpRequest');
      } catch (e2) {
        try {
          let domain = tag.toUpperCase();
          let models = JSON.parse(params.ProviderModels);
          jsapi[infoTag].modelId = models[domain];
          jsapi.logger.info(infoTag + ' ProviderModels');
        } catch (e2) {}
      }
    }

    return PV.isString(jsapi[infoTag].modelId);
  },

  createSalesforceProviderModel: function(jsapi, dataSetId, username, password) {
    return new Promise(function(resolve, reject) {
      if (PV.isObject(jsapi.sfdc) === false) {
        jsapi.sfdc = {};
      }
      if (PV.isString(jsapi.sfdc.modelId)) {
        resolve(true);
      } else {
        let dataSetQuery = {
          'Type': 'Salesforce',
          'KeyValue': [{
            'Key': 'username',
            'Value': username
          }, {
            'Key': 'password',
            'Value': password
          }, {
            'Key': 'dataSetId',
            'Value': dataSetId
          }]
        };

        jsapi.logger.info('Creating provider model with ' + username + ' with ' + dataSetId);
        return jsapi.pv.sendRequest('CreateProviderModel', dataSetQuery).then(function(resp) {
          let status = this.getPVStatus(resp);
          jsapi.sfdc.modelId = status.ModelId;
          resolve(true);
        }.bind(this)).catch(function(err) {
          jsapi.logger.error(this.getPVStatus(err.json), false);
          reject(this.getPVStatus(err.json));
        }.bind(this));
      }
    }.bind(this));
  },

  createSalesforceProviderModelWithSession: function(jsapi, dataSetId, access_token, instance_url) {
    return new Promise(function(resolve, reject) {
      if (PV.isObject(jsapi.sfdc) === false) {
        jsapi.sfdc = {};
      }
      if (PV.isString(jsapi.sfdc.modelId)) {
        resolve(true);
      } else {
        let dataSetQuery = {
          'Type': 'Salesforce',
          'KeyValue': [{
            'Key': 'dataSetId',
            'Value': dataSetId
          }, {
            'Key': 'access_token',
            'Value': access_token
          }, {
            'Key': 'instance_url',
            'Value': instance_url
          }]
        };

        jsapi.logger.info('Creating provider model with access_token on ' + instance_url + ' with ' + dataSetId);
        return jsapi.pv.sendRequest('CreateProviderModel', dataSetQuery).then(function(resp) {
          let status = this.getPVStatus(resp);
          jsapi.sfdc.modelId = status.ModelId;
          resolve(true);
        }.bind(this)).catch(function(err) {
          jsapi.logger.error(this.getPVStatus(err.json), false);
          reject(this.getPVStatus(err.json));
        }.bind(this));
      }
    }.bind(this));
  },

  createMongoProviderModel: function(jsapi, username, appName, dataSetId, options) {
    return new Promise(function(resolve, reject) {
      if (PV.isObject(jsapi.mongo) === false) {
        jsapi.mongo = {};
      }

      if (PV.isString(jsapi.mongo.url) && PV.isString(jsapi.mongo.host) && PV.isString(jsapi.mongo.dbname)) {
        jsapi.logger.info('Provider model id already already exist');
        resolve(this.getProviderModelUrl(jsapi, options));
      } else {
        jsapi.logger.info('Creating provider model with ' + username + ' for ' + appName + ' accessing dataSetId ' + dataSetId);

        let dataSetQuery = {
          'Type': 'MongoDB',
          'KeyValue': [{
            'Key': 'userId',
            'Value': username
          }, {
            'Key': 'appName',
            'Value': appName
          }, {
            'Key': 'dataSetId',
            'Value': dataSetId
          }]
        };
        return jsapi.pv.sendRequest('CreateProviderModel', dataSetQuery).then(function(resp) {
          let status = this.getPVStatus(resp);
          jsapi.mongo.modelId = status.ModelId;
          jsapi.logger.info('Getting provider model url with ' + status.ModelId);
          resolve(this.getProviderModelUrl(jsapi, options));
        }.bind(this)).catch(function(err) {
          jsapi.logger.error(this.getPVStatus(err.json), false);
          jsapi.logger.info('Failed to get provider model url with dataSetId ' + dataSetId);

          let dataSetQuery = {
            'Type': 'MongoDB',
            'KeyValue': [{
              'Key': 'userId',
              'Value': username
            }, {
              'Key': 'appName',
              'Value': appName
            }, {
              'Key': 'mongoDBHostName',
              'Value': dataSetId
            }]
          };
          jsapi.logger.info('Attempting with ' + username + ' for ' + appName + ' accessing mongoDBHostName ' + dataSetId);
          return jsapi.pv.sendRequest('CreateProviderModel', dataSetQuery).then(function(resp) {
            let status = this.getPVStatus(resp);
            jsapi.mongo.modelId = status.ModelId;
            jsapi.logger.info('Getting provider model url with ' + status.ModelId);
            resolve(this.getProviderModelUrl(jsapi, options));
          }.bind(this)).catch(function(err) {
            jsapi.logger.error(this.getPVStatus(err.json), false);
            reject(this.getPVStatus(err.json));
          }.bind(this));
        }.bind(this));
      }
    }.bind(this));
  },

  getProviderModelUrl: function(jsapi, options) {
    return new Promise(function(resolve, reject) {
      if (PV.isString(jsapi.mongo.url) && PV.isString(jsapi.mongo.host) && PV.isString(jsapi.mongo.dbname)) {
        jsapi.logger.info('Mongo Host, Database and Url already exist');
        resolve(true);
      } else {
        return jsapi.pv.sendRequest('GetProviderModelUrl', {
          'ProfitModel': jsapi.mongo.modelId
        }).then(function(resp) {
          let status = this.getPVStatus(resp);
          let info = this.parseProviderModelUrl(status.Url);

          jsapi.mongo.host = info.host;
          jsapi.mongo.dbname = info.dbname;

          let optionsStr = PV.convertObjectToStr(options);
          if (optionsStr !== '') {
            if (status.Url.indexOf('?') === -1) {
              optionsStr = '?' + optionsStr;
            } else {
              optionsStr = '&' + optionsStr;
            }
          }
          jsapi.mongo.url = status.Url + optionsStr;

          if (PV.isObject(info.options)) {
            jsapi.mongo.options = info.options;
          } else {
            jsapi.mongo.options = null;
          }
          if (PV.isString(info.username)) {
            jsapi.mongo.username = info.username;
          } else {
            jsapi.mongo.username = null;
          }
          if (PV.isString(info.password)) {
            jsapi.mongo.password = info.password;
          } else {
            jsapi.mongo.password = null;
          }

          if (PV.isString(info.host) && PV.isString(info.dbname)) {
            jsapi.logger.info('Mongo Host: ' + jsapi.mongo.host);
            jsapi.logger.info('Mongo Database: ' + jsapi.mongo.dbname);
            resolve(true);
          } else {
            jsapi.logger.error({
              message: 'Unable to extract Mongo host from data source url',
              code: 'Parsing Error'
            });
          }
        }.bind(this)).catch(function(err) {
          jsapi.mongo.url = null;
          jsapi.mongo.host = null;
          jsapi.mongo.dbname = null;
          jsapi.mongo.options = null;
          jsapi.mongo.username = null;
          jsapi.mongo.password = null;
          jsapi.logger.error(this.getPVStatus(err.json), false);
          reject(this.getPVStatus(err.json));
        }.bind(this));
      }
    }.bind(this));
  },

  setupMongoDBUrl: function(jsapi, serverHost, serverPort, serverUserId, serverPassword, serverAuthDatabase, database, options) {
    return new Promise(function(resolve, reject) {
      if (PV.isObject(jsapi.mongo) === false) {
        jsapi.mongo = {};
      }
      if (PV.isString(jsapi.mongo.url) && PV.isString(jsapi.mongo.host) && PV.isString(jsapi.mongo.dbname)) {
        jsapi.logger.info('Mongo Host, Database and Url already exist');
        resolve(true);
      } else {
        if (PV.isString(serverHost) && PV.isString(database)) {
          jsapi.mongo.host = serverHost;
          jsapi.mongo.dbname = database;
          let arr = [];
          arr.push('mongodb://');

          if (PV.isString(serverUserId)) {
            arr.push(encodeURIComponent(serverUserId));
            jsapi.mongo.username = serverUserId;
            if (PV.isString(serverPassword)) {
              arr.push(':' + encodeURIComponent(serverPassword));
              jsapi.mongo.password = serverPassword;
            } else {
              jsapi.mongo.password = null;
            }
            arr.push('@');
          } else {
            jsapi.mongo.username = null;
            jsapi.mongo.password = null;
          }
          arr.push(serverHost);

          if (PV.isString(serverPort)) {
            arr.push(':' + serverPort);
          }
          arr.push('/' + database);

          let optionsStr = null;
          if (PV.isString(serverAuthDatabase)) {
            let optionsObj = {};
            if (PV.isObject(options)) {
              for (let k in options) {
                optionsObj[k] = options[k];
              }
            }
            optionsObj.authSource = serverAuthDatabase;

            jsapi.mongo.options = optionsObj;
            optionsStr = PV.convertObjectToStr(optionsObj);
          } else {
            if (PV.isObject(options)) {
              jsapi.mongo.options = options;
              optionsStr = PV.convertObjectToStr(options);
            } else {
              jsapi.mongo.options = null;
            }
          }

          if (optionsStr !== '') {
            arr.push('?' + optionsStr);
          }
          jsapi.mongo.url = arr.join('');
          resolve(true);
        } else {
          jsapi.mongo.url = null;
          jsapi.mongo.host = null;
          jsapi.mongo.dbname = null;
          jsapi.mongo.options = null;
          jsapi.mongo.username = null;
          jsapi.mongo.password = null;
          let err = {
            message: 'Missing data source url parameters',
            code: 'Bad Parameters'
          };
          jsapi.logger.error(err, false);
          reject(err);
        }
      }
    });
  },

  createMongoDB: function(jsapi) {
    return new Promise(function(resolve, reject) {
      if (PV.isObject(jsapi.mongoConn) && PV.isObject(jsapi.mongoConnDb) === false) {
        try {
          jsapi.mongoConnDb = jsapi.mongoConn.db(jsapi.mongo.dbname);
          resolve(true);
        } catch (err) {
          jsapi.mongoConn = null;
          jsapi.mongoConnDb = null;
          jsapi.logger.error(err, false);
          reject(err);
        }
      } else if (PV.isObject(jsapi.mongoConn) === false && PV.isObject(jsapi.mongoConnDb) === false) {
        if (PV.isObject(jsapi.mongo) && PV.isString(jsapi.mongo.url) && PV.isString(jsapi.mongo.dbname)) {
          mongodb.MongoClient.connect(jsapi.mongo.url, {
            useUnifiedTopology: true
          }).then(function(dbconn) {
            jsapi.mongoConn = dbconn;
            try {
              jsapi.mongoConnDb = jsapi.mongoConn.db(jsapi.mongo.dbname);
              resolve(true);
            } catch (err) {
              jsapi.mongoConn = null;
              jsapi.mongoConnDb = null;
              jsapi.logger.error(err, false);
              reject(err);
            }
          });
        } else {
          jsapi.mongoConn = null;
          jsapi.mongoConnDb = null;
          let err = {
            message: 'Missing data source url or database name',
            code: 'No Connection'
          };
          jsapi.logger.error(err, false);
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  },

  getEntityGroupsAndFields: function(entity, entityArray) {
    let result = null;
    entityArray.forEach(function(obj) {
      if (obj.Name === entity) {
        result = obj;
      }
    });

    result.Groups = result.Groups.Group;
    result.Fields = result.Fields.Field;
    return result;
  },

  convertGroupOrFieldArrayForQueryParams: function(arr) {
    let uniqueArr = arr.filter(function(elem, index, self) {
      if (PV.isString(elem)) {
        return index === self.indexOf(elem);
      } else if (PV.isObject(elem) && PV.isString(elem.text) && PV.isString(elem.attrs)) {
        return true;
      } else {
        return false;
      }
    });

    let newArray = [];
    uniqueArr.forEach(function(elem) {
      if (PV.isString(elem)) {
        newArray.push({
          '_attrs': {
            'name': 'Res1'
          },
          '_text': elem
        });
      } else {
        newArray.push({
          '_attrs': {
            'name': elem.attrs
          },
          '_text': elem.text
        });
      }
    }.bind(this));
    return newArray;
  },

  removeEntityRelationshipGroupAndFields: function(meta, entity, relationshipPatterns, not) {
    if (PV.isBoolean(not) === false) {
      not = false;
    }
    relationshipPatterns.forEach(function(pattern) {
      let relationPattern = entity + '_' + pattern;
      let reg = null;
      eval('reg=/' + relationPattern + '.+/i');
      let groups = meta.Groups;
      let i = 0;
      do {
        if (reg.test(groups[i])) {
          if (not) {
            i++;
          } else {
            groups.splice(i, 1);
          }
        } else {
          if (not) {
            groups.splice(i, 1);
          } else {
            i++;
          }
        }
      } while (i < groups.length);

      let fields = meta.Fields;
      let j = 0;
      do {
        if (reg.test(fields[j])) {
          if (not) {
            j++;
          } else {
            fields.splice(j, 1);
          }
        } else {
          if (not) {
            fields.splice(j, 1);
          } else {
            j++;
          }
        }
      } while (j < fields.length);
    });
  },

  getGroupsOrFieldsFromQueryParams: function(groupsOrFieldsParams) {
    let groupsOrFields = [];
    if (PV.isObject(groupsOrFieldsParams)) {
      let values = null;
      if (groupsOrFieldsParams.hasOwnProperty('Group')) {
        values = PV.ensureArray(groupsOrFieldsParams.Group);
      } else if (groupsOrFieldsParams.hasOwnProperty('Field')) {
        values = PV.ensureArray(groupsOrFieldsParams.Field);
      }

      if (PV.isArray(values) && values.length > 0) {
        values.forEach(function(value) {
          if (PV.isString(value)) {
            groupsOrFields.push(value);
          } else if (PV.isObject(value)) {
            if (PV.isString(value._text)) {
              groupsOrFields.push(value._text);
            } else if (PV.isString(value.text)) {
              groupsOrFields.push(value.text);
            }
          }
        });
      }
    }
    return groupsOrFields;
  },

  getGroupValueFromQueryParams: function(queryParams, objectName, groupName) {
    let result = null;
    let regexp = /^([^=]+)=[']([^']+)[']$/i;
    try {
      let dp = queryParams.AndFilter;
      PV.ensureArray(dp.OrFilter).forEach(function(compTerm) {
        let category = compTerm._attrs.category;
        if ((!objectName || (!category || category === objectName))) {
          PV.ensureArray(compTerm.AndFilter).forEach(function(andTerm) {
            PV.ensureArray(andTerm.Filter).forEach(function(filterTerm) {
              let term = filterTerm;
              if (PV.isObject(filterTerm) && filterTerm.hasOwnProperty('text')) {
                term = filterTerm.text;
              }
              let matches = regexp.exec(term);
              if (matches) {
                let group = matches[1];
                let value = matches[2];
                if (group === groupName && value !== '[object Object]') {
                  result = value;
                }
              }
            });
          });
        }
      });
    } catch (ignore) {}
    return result;
  },

  getGroupValuesFromQueryParams: function(queryParams, objectName, groupName) {
    let result = [];
    let regexp = /^([^=]+)=[']([^']+)[']$/i;
    try {
      let dp = queryParams.AndFilter;
      PV.ensureArray(dp.OrFilter).forEach(function(compTerm) {
        let category = compTerm._attrs.category;
        if ((!objectName || (!category || category === objectName))) {
          PV.ensureArray(compTerm.AndFilter).forEach(function(andTerm) {
            PV.ensureArray(andTerm.Filter).forEach(function(filterTerm) {
              let term = filterTerm;
              if (PV.isObject(filterTerm) && filterTerm.hasOwnProperty('text')) {
                term = filterTerm.text;
              }
              let matches = regexp.exec(term);
              if (matches) {
                let group = matches[1];
                let value = matches[2];
                if (group === groupName && value !== '[object Object]') {
                  result.push(value);
                }
              }
            });
          });
        }
      });
    } catch (ignore) {}
    return result;
  },

  getLastComponentSelections: function(components) {
    let comps = PV.ensureArray(components);

    let lastSelections = null;
    for (let i = comps.length - 1; i >= 0; i--) {
      let component = comps[i];

      if (PV.isObject(component) && component.hasOwnProperty('Selection')) {
        let selections = [];
        if (PV.isArray(component.Selection)) {
          selections = component.Selection;
        } else {
          selections.push(component.Selection);
        }
        lastSelections = selections;
        break;
      }
    }
    return lastSelections;
  },

  getGroupValueFromGroupFilters: function(selections, groupName) {
    let values = [];
    let groupFilter = null;
    if (PV.isArray(selections)) {
      for (let i = 0; i < selections.length; i++) {
        if (PV.isObject(selections[i]) && selections[i].hasOwnProperty('GroupFilter')) {
          groupFilter = selections[i].GroupFilter;
          let filters = [];
          if (PV.isArray(groupFilter)) {
            filters = groupFilter;
          } else {
            filters.push(groupFilter);
          }
          for (let j = 0; j < filters.length; j++) {
            groupFilter = filters[j];
            if (PV.isString(groupFilter.Group) && PV.isString(groupFilter.Value) && groupFilter.Group === groupName) {
              values.push(groupFilter.Value);
            }
          }
        }
      }
    }
    if (values.length > 0) {
      return values;
    } else {
      return null;
    }
  },

  getPVStatus: function(response) {
    let PVStatus = null;

    if (PV.isObject(response)) {
      if (PV.isObject(response.PVResponse.PVStatus)) {
        PVStatus = response.PVResponse.PVStatus;
      } else if (PV.isObject(response.PVResponse.OpResponse) && PV.isObject(response.PVResponse.OpResponse.PVStatus)) {
        PVStatus = response.PVResponse.OpResponse.PVStatus;
      }
    }

    return PVStatus;
  },
  getResultCode: function(response) {
    let code = null;

    if (response) {
      let PVStatus = this.getPVStatus(response);
      if (PVStatus) {
        code = PVStatus.Code;
      }
    }

    return code;
  },
  getResultMessage: function(response) {
    let message = null;

    if (response) {
      let PVStatus = this.getPVStatus(response);
      if (PVStatus) {
        message = PVStatus.Message;
      }
    }

    return message;
  },
  getResultScriptMessage: function(response) {
    let message = null;

    if (response) {
      let PVStatus = this.getPVStatus(response);
      if (PVStatus && PV.isString(PVStatus.SCRIPT_ERROR_MSG)) {
        message = PVStatus.SCRIPT_ERROR_MSG;
      }
    }

    return message;
  },
  isResultOk: function(response) {
    let result = false;

    if (response) {
      let codeText = this.getResultCode(response);
      let message = this.getResultMessage(response);
      if (codeText === 'RPM_PE_STATUS_OK' && message === 'Okay') {
        result = true;
      }
    }
    return result;
  },
  isResultTruncated: function(response) {
    let result = false;

    if (response) {
      let codeText = this.getResultCode(response);
      if (codeText === 'RPM_PE_QUERY_RESULT_TRUNCATED') {
        result = true;
      }
    }
    return result;
  },
  isResultTooLarge: function(response) {
    let result = false;

    if (response) {
      let codeText = this.getResultCode(response);
      let messageText = this.getResultMessage(response);
      if (codeText === 'RPM_PE_QUERY_FAILED' && messageText === 'Error: Request Entity Too Large: head') {
        result = true;
      }
    }
    return result;
  },
  isBulkUpsertInProgress: function(response) {
    let result = false;

    if (response) {
      let codeText = this.getResultCode(response);
      if (codeText === 'RPM_PE_QUERY_RESULT_OK_UPSERT_IN_PROGRESS' ||
        codeText === 'RPM_PE_QUERY_RESULT_TRUNCATED_UPSERT_IN_PROGRESS') {
        result = true;
      }
    }
    return result;
  },
  listFiles: function(dir, conditionFunc) {
    let files = [];
    if (fs.existsSync(dir)) {
      let tempList = fs.readdirSync(dir);
      for (let i = 0; i < tempList.length; i++) {
        let filePath = path.join(dir, tempList[i]);
        if (fs.lstatSync(filePath).isDirectory()) {
          let subList = this.listFiles(filePath, conditionFunc);
          files = files.concat(subList);
        } else {
          if (PV.isFunction(conditionFunc)) {
            if (conditionFunc(filePath)) {
              files.push(filePath);
            }
          } else {
            files.push(filePath);
          }
        }
      }
    }
    return files;
  },
  readFirstLine: function(filePath, options) {
    return new Promise(function(resolve, reject) {
      let rs = fs.createReadStream(filePath, options);
      let txt = '';
      let pos = 0;
      let index;
      rs.on('data', function(chunk) {
        index = chunk.indexOf('\n');
        txt += chunk;
        index !== -1 ? rs.close() : pos += chunk.length;
      });
      rs.on('close', function() {
        resolve(txt.slice(0, pos + index));
      });
      rs.on('error', function(err) {
        reject(err);
      });
    });
  }
};