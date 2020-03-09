/*global*/
'use strict';

const pvh = require('pvserverhelper');
require('pvjs');
const fs = require('fs-extra');
const path = require('path');
const sim = require('simload');

const socketTimeoutMS = 600000;
let totalRequests = 0;
let totalFailedRequests = 0;
let requestTimings = [];
let totalTime = process.hrtime();

const printSummary = function(jsapi) {
  totalTime = process.hrtime(totalTime);

  let sum = 0;
  let max = 0;
  let min = Infinity;

  requestTimings.sort(function(a, b){return a - b});
  requestTimings.forEach(function(time) {
    sum = sum + time;
    max = Math.max(max, time);
    min = Math.min(min, time);
  });
  let n = requestTimings.length;

  let mean = sum / n;
  let median = 0;
  if (n % 2 === 1) {
    median = requestTimings[Math.floor(n / 2)];
  } else {
    let halfIdx = n / 2;
    median = (requestTimings[halfIdx] + requestTimings[halfIdx - 1]) / 2;
  }

  let percentile = .9;
  let percentileValue = 0;
  if (percentile > 0 && percentile <= 1.0 && n > 0) {
    // Replicate Excel Percentile formula

    // i = 1 + INT((20-1)*85%) = 17
    // f = MOD((20-1)*85%,1) = 0.15
    // p = INDEX(A1:A20,i) + f * (INDEX(A1:A20,i+1) - INDEX(A1:A20,i))

    let idx = (n - 1) * percentile;
    let p = 0.0;
    if ((idx % 1) !== 0) {
      // We need to perform interpolation
      let i = Math.floor(idx);
      let f = idx - i;

      let iV = parseFloat(requestTimings[i]);
      let iiV = iV;

      if (i + 1 < n) {
        iiV = parseFloat(requestTimings[i + 1]);
      }
      p = iV + f * (iiV - iV);
    } else {
      p = parseFloat(requestTimings[idx]);
    }
    percentileValue = p;
  }

  sum = PV.round(sum, 2);
  mean = PV.round(mean, 2);
  median = PV.round(median, 2);
  max = PV.round(max, 2);
  min = PV.round(min, 2);
  percentileValue = PV.round(percentileValue, 2);

  jsapi.logger.info(`summary in secs - sum: ${sum} - mean: ${mean} - median: ${median} - max: ${max} - min: ${min} - percentile: ${percentileValue}`);
  jsapi.logger.info(`totals - requests: ${totalRequests} - failed requests ${totalFailedRequests} - elapsed time ${totalTime[0]} secs`);
};

const testCaseSimulate = function(jsapi, concurrent, meanIntervalBetweenRequest, duration, workFunction) {
  // run test case under a concurrent number of users, for a duration with meanIntervalBetweenRequest
  let startTime = new Date().getTime();
  return sim.simulate(concurrent, meanIntervalBetweenRequest, duration, function(userIndex) {
    return function() {
      // run test case under this context
      return workFunction.apply(jsapi, [userIndex]).then(function(result) {
        if (result) {
          if (result.exact > 0) {
            totalRequests++;
          }
          if (result.exact > 0) {
            requestTimings.push(result.exact);
          } else {
            totalFailedRequests++;
          }
          let elapsed = ((new Date().getTime()) - startTime) / 1000.0;
          let reqPerMin = totalRequests * 60.0 / elapsed;
          reqPerMin = PV.round(reqPerMin, 2);

          let message = '';
          if (PV.isObject(result.json) && PV.isString(result.json.message)) {
            message = result.json.message + ' - ';
          }
          jsapi.logger.info(`user: ${userIndex} - ${message}time: ${result.timing} secs - throughput: ${reqPerMin} rpm`);
        }
        return result;
      }).catch(function(e) {
        let error = e;
        if (e.json) {
          error = pvh.getPVStatus(e.json);
        }
        let message = pvh.getErrorMessage(error);
        jsapi.logger.info(`user: ${userIndex} - ${message}`);
        return e;
      });
    };
  }).finally(function() {
    printSummary(jsapi);
  });
};

const testCaseExecute = function(jsapi, workFunction, workParams) {
  let start = process.hrtime();
  if (PV.isArray(workParams) === false) {
    workParams = [];
  }
  // run test case under provided context
  return workFunction.apply(jsapi, workParams).then(function(result) {
    var diff = process.hrtime(start);
    var exact = (diff[0] * 1e9 + diff[1]) / 1e9;
    var timing = PV.round(exact, 2);
    return {
      timing: timing,
      exact: exact,
      json: result
    };
  }).catch(function(e) {
    var diff = process.hrtime(start);
    var exact = (diff[0] * 1e9 + diff[1]) / 1e9;
    var timing = PV.round(exact, 2);

    let error = e;
    if (e.json) {
      error = pvh.getPVStatus(e.json);
    }
    let message = pvh.getErrorMessage(error);
    return {
      timing: timing,
      exact: -1.0,
      json: { message: message }
    };
  });
};

const testCaseDelayedValidation = function(jsapi, delay, workFunction, workParams, timeoutInSeconds,
  errorMessage, start, extendedDelay) {
  return new Promise(function(resolve, reject) {
    try {
      if (PV.isNumber(start) === false) {
        start = new Date().getTime();
      }
      if (PV.isNumber(extendedDelay) === false) {
        extendedDelay = delay;
      }
      extendedDelay = Math.min(extendedDelay, 2000);
      if (PV.isArray(workParams) === false) {
        workParams = [];
      }
      // on a reoccuring timeout, run a validation function for test cases were resulting
      // request do not provide a valid response since they fire jobs
      return workFunction.apply(jsapi, workParams).then(function(isDone) {
        if (isDone) {
          resolve();
        } else {
          let now = new Date().getTime();
          if (now - start > timeoutInSeconds * 1000) {
            let message = `Delayed validation test has taken longer than ${timeoutInSeconds} seconds`;
            if (PV.isString(errorMessage)) {
              message = message + ': ' + errorMessage;
            }
            reject({
              code: 'JSAPI2_SEMANTIC_ERROR',
              message: message
            });
          } else {
            setTimeout(function() {
              resolve(testCaseDelayedValidation(jsapi, delay, workFunction, workParams, timeoutInSeconds,
                errorMessage, start, extendedDelay + delay));
            }, extendedDelay);
          }
        }
      }).catch(function(e) {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
};

const doExcelDataPoints = function(jsapi, roundId) {
  // perform query that is typically used to get an excel data dump for DataPoints
  let groups = ['DataPoints__id', 'DataPoints_segmentName', 'DataPoints_productManagerTarget',
    'DataPoints_salesRep', 'DataPoints_bu', 'DataPoints_subActivity', 'DataPoints_subActivitySP',
    'DataPoints_endUse', 'DataPoints_endUseSP', 'DataPoints_market', 'DataPoints_marketSP',
    'DataPoints_marketSegment', 'DataPoints_marketingMarket', 'DataPoints_application', 'DataPoints_plant',
    'DataPoints_plantOrigin', 'DataPoints_plantRegion', 'DataPoints_manufacturingPlant', 'DataPoints_packagingType',
    'DataPoints_formulaContract', 'DataPoints_productFamily', 'DataPoints_productHierarchy', 'DataPoints_pif',
    'DataPoints_pifDot', 'DataPoints_pifSP', 'DataPoints_pifCode', 'DataPoints_materialName',
    'DataPoints_materialCode', 'DataPoints_lastTransactionCurrency', 'DataPoints_microRegion', 'DataPoints_subRegion',
    'DataPoints_region', 'DataPoints_regionSP', 'DataPoints_country', 'DataPoints_customerClassification',
    'DataPoints_soldToName', 'DataPoints_soldToNameDot', 'DataPoints_soldToCode', 'DataPoints_tier',
    'DataPoints_mappingKey', 'DataPoints_isNewCustomer', 'DataPoints_reviewRetainedTargets', 'DataPoints_overallExclusion',
    'DataPoints_targetExclusion', 'DataPoints_exceptionReason', 'DataPoints_financialIndicator', 'DataPoints_userSetTarget'
  ];
  let fields = ['DataPoints_quantitySold_KG', 'DataPoints_netSales_EUR', 'DataPoints_netSalesEURPUnit', 'DataPoints_netSalesFCTPUnit',
    'DataPoints_exWorksNetSales', 'DataPoints_exWorksNetSalesPUnit', 'DataPoints_exWorksNetSalesFCTPUnit', 'DataPoints_contributionMargin',
    'DataPoints_cmPUnit', 'DataPoints_cmPercent', 'DataPoints_rockBottom', 'DataPoints_target',
    'DataPoints_targetOverride', 'DataPoints_targetReviewedWAVG', 'DataPoints_grossImpact', 'DataPoints_netImpact',
    'DataPoints_targetGrossImpact', 'DataPoints_targetNetImpact', 'DataPoints_targetRecommendedPrice', 'DataPoints_salesBudgetSalesPUnit',
    'DataPoints_salesBudgetSalesFCTPUnit', 'DataPoints_priceListSalesPUnit', 'DataPoints_priceListSalesFCTPUnit', 'DataPoints_targetRecommendedEXWPrice',
    'DataPoints_salesBudgetExWorksPUnit', 'DataPoints_salesBudgetExWorksFCTPUnit', 'DataPoints_priceListExWorksPUnit', 'DataPoints_priceListExWorksFCTPUnit',
    'DataPoints_targetRecommendedCmPUnit', 'DataPoints_salesBudgetCmPUnit', 'DataPoints_priceListCmPUnit', 'DataPoints_targetRecommendedCmPercent',
    'DataPoints_salesBudgetCmPercent', 'DataPoints_priceListCmPercent', 'DataPoints_salesPriceVariation', 'DataPoints_priceGuidelinePUnit',
    'DataPoints_salesBudgetPUnit', 'DataPoints_priceListPUnit', 'DataPoints_avgFX', 'DataPoints_latestPriceWAVG',
    'DataPoints_latestFX', 'DataPoints_targetRecommendedPrice_CO', 'DataPoints_commitmentPrice_CO', 'DataPoints_variableCoGsFCT',
    'DataPoints_variableCoGsFCTPUnit', 'DataPoints_variableCoGs', 'DataPoints_variableCoGsPUnit', 'DataPoints_costForecastPUnit',
    'DataPoints_deltaCoGsPUnit', 'DataPoints_variableLogCost', 'DataPoints_variableLogCostPUnit'
  ];
  let params = {
    ProfitModel: jsapi.mongo.modelId,
    Category: 'DataPoints',
    Groups: {
      Group: pvh.convertGroupOrFieldArrayForQueryParams(groups)
    },
    Fields: {
      Field: pvh.convertGroupOrFieldArrayForQueryParams(fields)
    },
    SearchCriteria: {
      AndFilter: {
        OrFilter: [{
          _attrs: {
            category: 'Rounds'
          },
          AndFilter: [{
            Filter: [
              `Rounds__id='${roundId}'`
            ]
          }]
        }]
      }
    }
  };

  return jsapi.pv.sendRequest('Query', params);
};

const getSegments = function(jsapi, roundId, segmentIds) {
  // perform query that is typically used to get all Segment details
  let orFilter = [{
    _attrs: {
      category: 'Rounds'
    },
    AndFilter: [{
      Filter: [
        `Rounds__id='${roundId}'`
      ]
    }]
  }];

  if (PV.isArray(segmentIds) && segmentIds.length > 0) {
    let andFilter = [];
    segmentIds.forEach(function(segId) {
      andFilter.push({
        Filter: `Segments__id='${segId}'`
      });
    });
    orFilter.push({
      _attrs: {
        category: 'Segments'
      },
      AndFilter: andFilter
    })
  }

  let dimensions = ['Segments_marketSP', 'Segments_regionSP', 'Segments_endUseSP', 'Segments_pifSP',
    'Segments_subActivitySP', 'Segments_productFamily', 'Segments_bu', 'Segments_soldToNameDot'
  ];
  let params = {
    ProfitModel: jsapi.mongo.modelId,
    Category: 'Segments',
    Groups: {
      Group: pvh.convertGroupOrFieldArrayForQueryParams(dimensions.concat(['Segments__id', 'Segments_config']))
    },
    SearchCriteria: {
      AndFilter: {
        OrFilter: orFilter
      }
    }
  };

  return jsapi.pv.sendRequest('Query', params).then(function(result) {
    let segments = PV.ensureArray(result.PVResponse.Res1).map(function(seg) {
      let config = JSON.parse(seg.Segments_config).config;
      let res = {
        _id: seg.Segments__id,
        groups: config.groups,
        fields: config.fields
      };
      dimensions.forEach(function(dim) {
        res[dim] = seg[dim];
      });
      return res
    });
    return segments;
  });
};

const doScatterPlotQuery = function(jsapi, roundId, segments) {
  // perform scatter plot query on a random segment
  let segment = segments[Math.floor(Math.random() * (segments.length))];

  let params = {
    ScriptFunction: 'ScatterPlotQuery',
    ScriptParameter: {
      QueryParameters: {
        Currency: 'USD',
        ProfitModel: jsapi.mongo.modelId,
        Category: 'DataPoints',
        Groups: {
          Group: pvh.convertGroupOrFieldArrayForQueryParams(segment.groups)
        },
        Fields: {
          Field: pvh.convertGroupOrFieldArrayForQueryParams(segment.fields)
        },
        SearchCriteria: {
          AndFilter: {
            OrFilter: [{
              _attrs: {
                category: 'Rounds'
              },
              AndFilter: [{
                Filter: [
                  `Rounds__id='${roundId}'`
                ]
              }]
            }, {
              _attrs: {
                category: 'DataPoints'
              },
              AndFilter: [{
                Filter: [
                  `DataPoints_overallExclusion='false'`
                ]
              }]
            }, {
              _attrs: {
                category: 'Segments'
              },
              AndFilter: [{
                Filter: [
                  `Segments__id='${segment._id}'`
                ]
              }]
            }]
          }
        }
      }
    }
  };

  return jsapi.pv.sendRequest('ExecScript2', params);
};

const findRoundAdjustments = function(jsapi, name) {
  // provide default round adjustment objects for round creation
  let findDefaultRoundAdjustment = function(entity) {
    let params = {
      ProfitModel: jsapi.mongo.modelId,
      Category: entity,
      Groups: {
        Group: pvh.convertGroupOrFieldArrayForQueryParams([`${entity}__id`])
      },
      SearchCriteria: {
        AndFilter: {
          OrFilter: [{
            _attrs: {
              category: entity
            },
            AndFilter: [{
              Filter: [
                `${entity}_name='${name}'`
              ]
            }]
          }]
        }
      }
    };
    return jsapi.pv.sendRequest('Query', params);
  };

  let roundAdjustments = ['CostForecasts', 'PriceGuidelines', 'SalesBudgets', 'PriceLists'];
  let promises = [];
  roundAdjustments.forEach(function(roundAdjustment) {
    promises.push(findDefaultRoundAdjustment(roundAdjustment));
  });
  return Promise.all(promises).then(function(results) {
    let roundAdjustmentIds = {};
    results.forEach(function(result, i) {
      let roundAdjustment = roundAdjustments[i];
      let roundAdjustmentObj = PV.ensureArray(result.PVResponse.Res1)[0];
      roundAdjustmentIds[roundAdjustment] = roundAdjustmentObj[`${roundAdjustment}__id`];
    });
    return roundAdjustmentIds;
  });
};

const doCreateRound = function(jsapi, name, startDate, endDate, roundAdjustmentIds) {
  // create a round
  let fields = [{
    attrs: 'Rounds_name',
    text: `${name}-${new Date().getTime()}`
  }, {
    attrs: 'Rounds_phase',
    text: 'Segment Generation'
  }, {
    attrs: 'Rounds_startDate',
    text: startDate
  }, {
    attrs: 'Rounds_endDate',
    text: endDate
  }, {
    attrs: 'Rounds_currency',
    text: 'EUR'
  }, {
    attrs: 'Rounds_retainTargets',
    text: 'false'
  }, {
    attrs: 'Rounds_costForecast',
    text: roundAdjustmentIds.CostForecasts
  }, {
    attrs: 'Rounds_priceGuideline',
    text: roundAdjustmentIds.PriceGuidelines
  }, {
    attrs: 'Rounds_salesBudget',
    text: roundAdjustmentIds.SalesBudgets
  }, {
    attrs: 'Rounds_priceList',
    text: roundAdjustmentIds.PriceLists
  }];

  let orFilter = [];
  for (let roundAdjustment in roundAdjustmentIds) {
    orFilter.push({
      _attrs: {
        category: roundAdjustment
      },
      AndFilter: [{
        Filter: [
          `${roundAdjustment}__id='${roundAdjustmentIds[roundAdjustment]}'`
        ]
      }]
    });
  }
  let createParams = {
    ProfitModel: jsapi.mongo.modelId,
    Category: 'Rounds',
    Fields: {
      Field: pvh.convertGroupOrFieldArrayForQueryParams(fields)
    },
    SearchCriteria: {
      AndFilter: {
        OrFilter: orFilter
      }
    }
  }
  return jsapi.pv.sendRequest('CreateProviderModelEntity', createParams).then(function(result) {
    return pvh.getPVStatus(result).KeyValue.Value;
  });
};

const isRoundDone = function(jsapi, roundId) {
  // validation test to see if round is fully completed
  let params = {
    ProfitModel: jsapi.mongo.modelId,
    Category: 'Rounds',
    Groups: {
      Group: pvh.convertGroupOrFieldArrayForQueryParams(['Rounds__id', 'Rounds_status'])
    },
    SearchCriteria: {
      AndFilter: {
        OrFilter: [{
          _attrs: {
            category: 'Rounds'
          },
          AndFilter: [{
            Filter: [
              `Rounds__id='${roundId}'`
            ]
          }]
        }]
      }
    }
  };
  return jsapi.pv.sendRequest('Query', params).then(function(result) {
    let newRound = result.PVResponse.Res1;
    if (PV.isObject(newRound) && PV.isString(newRound.Rounds_status)) {
      if (newRound.Rounds_status === 'Segment Generation Startup Finished') {
        return true;
      } else if (newRound.Rounds_status.startsWith('Error: ')) {
        throw {
          code: 'JSAPI2_SEMANTIC_ERROR',
          message: newRound.Rounds_status
        };
      } else {
        return false;
      }
    } else {
      throw {
        code: 'JSAPI2_SEMANTIC_ERROR',
        message: `Could not query round: ${roundId}`
      };
    }
  });
}

const deleteRounds = function(jsapi, roundIds) {
  // delete round for clean up
  let promises = [];
  roundIds.forEach(function(roundId) {
    let params = {
      ProfitModel: jsapi.mongo.modelId,
      Category: 'Rounds',
      SearchCriteria: {
        AndFilter: {
          OrFilter: [{
            _attrs: {
              category: 'Rounds'
            },
            AndFilter: [{
              Filter: [
                `Rounds__id='${roundId}'`
              ]
            }]
          }]
        }
      }
    }
    promises.push(jsapi.pv.sendRequest('DeleteProviderModelEntity', params));
  })
  return Promise.all(promises);
};

const getDimValues = function(jsapi, roundId, dimensions) {
  // dimension values for segment generation based on dimensions map, value indicates max number of values selected
  let promises = [];
  for (let dim in dimensions) {
    let params = {
      ProfitModel: jsapi.mongo.modelId,
      Category: 'DataPoints',
      Groups: {
        Group: pvh.convertGroupOrFieldArrayForQueryParams([dim])
      },
      SearchCriteria: {
        AndFilter: {
          OrFilter: [{
            _attrs: {
              category: 'Rounds'
            },
            AndFilter: [{
              Filter: [
                `Rounds__id='${roundId}'`
              ]
            }]
          }]
        }
      }
    };
    promises.push(jsapi.pv.sendRequest('Query', params));
  }
  return Promise.all(promises).then(function(results) {
    let dimValues = [];
    let dims = Object.keys(dimensions);
    for (let i = 0; i < dims.length; i++) {
      let dim = dims[i];
      let allDimValues = PV.ensureArray(results[i].PVResponse.Res1);
      let groupValues = [];
      for (let j = 0; j < dimensions[dim] || (i === dims.length - 1 && j < allDimValues.length); j++) {
        if (allDimValues.length > j) {
          groupValues.push(allDimValues[j][dim]);
        }
      }
      dimValues.push({
        dim: dim,
        values: groupValues
      })
    }
    return dimValues;
  });
};

const doSegmentGeneration = function(jsapi, roundId, dimValues) {
  // perform segment generation
  let dimAndFilter = [];
  let dpAndFilter = [];
  dimValues.forEach(function(dimObj) {
    dimAndFilter.push({
      Filter: [
        `Dimensions_group='${dimObj.dim}'`
      ]
    });

    if (dimObj.values.length > 0) {
      let dpFilter = [];
      dimObj.values.forEach(function(value) {
        dpFilter.push(`${dimObj.dim}='${value}'`)
      });
      dpAndFilter.push({
        Filter: dpFilter
      });
    }
  });

  let orFilter = [{
    _attrs: {
      category: 'Rounds'
    },
    AndFilter: [{
      Filter: [
        `Rounds__id='${roundId}'`
      ]
    }]
  }, {
    _attrs: {
      category: 'Dimensions'
    },
    AndFilter: dimAndFilter
  }];

  if (dpAndFilter.length > 0) {
    orFilter.push({
      _attrs: {
        category: 'DataPoints'
      },
      AndFilter: dpAndFilter
    });
  }

  let createParams = {
    ScriptFunction: 'SegmentGeneration',
    ScriptParameter: {
      ProfitModel: jsapi.mongo.modelId,
      SearchCriteria: {
        AndFilter: {
          OrFilter: orFilter
        }
      }
    }
  };

  return jsapi.pv.sendRequest('ExecScript2', createParams);
};

const deleteSegments = function(jsapi, segmentIds) {
  // delete segments for clean up
  let promises = [];
  segmentIds.forEach(function(segId) {
    let params = {
      ProfitModel: jsapi.mongo.modelId,
      Category: 'Segments',
      SearchCriteria: {
        AndFilter: {
          OrFilter: [{
            _attrs: {
              category: 'Segments'
            },
            AndFilter: [{
              Filter: [
                `Segments__id='${segId}'`
              ]
            }]
          }]
        }
      }
    }
    promises.push(jsapi.pv.sendRequest('DeleteProviderModelEntity', params));
  })
  return Promise.all(promises);
};

const testExcelDataPoints = function(jsapi, concurrent, meanIntervalBetweenRequest, duration, roundId) {
  // execute test case for typically excel data dump for DataPoints
  return testCaseSimulate(jsapi, concurrent, meanIntervalBetweenRequest, duration, function() {
    return testCaseExecute(jsapi, doExcelDataPoints, [jsapi, roundId]);
  });
};

const testScatterPlotQuery = function(jsapi, concurrent, meanIntervalBetweenRequest, duration, roundId, segmentIds) {
  // prepare list of segments
  return getSegments(jsapi, roundId, segmentIds).then(function(segments) {
    // execute test case for scatter plot query
    return testCaseSimulate(jsapi, concurrent, meanIntervalBetweenRequest, duration, function() {
      return testCaseExecute(jsapi, doScatterPlotQuery, [jsapi, roundId, segments]);
    });
  });
};

const testRoundCreation = function(jsapi, concurrent, meanIntervalBetweenRequest, duration) {
  // prepare round creation parameters
  let roundIds = [];
  return findRoundAdjustments(jsapi, '- N/A -').then(function(result) {
    let roundAdjustmentIds = result;
    // execute test case for round creation
    return testCaseSimulate(jsapi, concurrent, meanIntervalBetweenRequest, duration, function() {
      return testCaseExecute(jsapi, function() {
        return doCreateRound(jsapi,
          'simtest-RoundCreation', '2017-01-01T00:00:00.000+0000', '2017-12-01T00:00:00.000+0000',
          roundAdjustmentIds).then(function(roundId) {
          roundIds.push(roundId);
          return testCaseDelayedValidation(jsapi, 200, isRoundDone, [jsapi, roundId], 180, `RoundId: ${roundId}`);
        });
      });
    });
  }).then(function() {
    // clean up created rounds
    return deleteRounds(jsapi, roundIds).catch(function(e) {
      let error = e;
      if (e.json) {
        error = pvh.getPVStatus(e.json);
      }
      jsapi.logger.info('RoundsDeletion Failed: ' + pvh.getErrorMessage(error));
      return;
    });
  });
};

const testSegmentGeneration = function(jsapi, concurrent, meanIntervalBetweenRequest, duration, roundId, dimensions) {
  // create a round for each segment to be generated on
  let roundIds = [];
  let dimValues = [];

  let promises = [];
  promises.push(findRoundAdjustments(jsapi, '- N/A -'));
  promises.push(getDimValues(jsapi, roundId, dimensions));
  return Promise.all(promises).then(function(results) {
    let roundAdjustmentIds = results[0];
    dimValues = results[1];

    let promises = [];
    for (let i = 0; i < concurrent; i++) {
      promises.push(doCreateRound(jsapi,
        'simtest-SegmentGeneration', '2017-01-01T00:00:00.000+0000', '2017-12-01T00:00:00.000+0000',
        roundAdjustmentIds).then(function(roundId) {
        roundIds.push(roundId);
        return testCaseDelayedValidation(jsapi, 200, isRoundDone, [jsapi, roundId], 180, `RoundId: ${roundId}`);
      }));
    }

    return Promise.all(promises);
  }).then(function() {
    // execute test case for segment generation and deletion each round
    return testCaseSimulate(jsapi, concurrent, meanIntervalBetweenRequest, duration, function(userIndex) {
      return testCaseExecute(jsapi, function() {
        let roundId = roundIds[userIndex];
        return doSegmentGeneration(jsapi, roundId, dimValues).then(function(result) {
          if (result) {
            let segmentIds = PV.ensureArray(result.PVResponse.SegmentsGenerated.SegmentGenerated).map(seg => seg['MongoDB.Segments._id']);
            return deleteSegments(jsapi, segmentIds).then(function() {
              return result;
            });
          } else {
            return result;
          }
        });
      });
    }).then(function() {
      // clean up created rounds
      return deleteRounds(jsapi, roundIds).catch(function(e) {
        let error = e;
        if (e.json) {
          error = pvh.getPVStatus(e.json);
        }
        jsapi.logger.info('RoundsDeletion Failed: ' + pvh.getErrorMessage(error));
        return;
      });
    });
  });
};

const testMaxLoad = function(jsapi, concurrent, meanIntervalBetweenRequest, duration, roundId, dimensions) {
  // prepare parameters for round creation
  let roundIds = [];
  let promises = [];
  promises.push(findRoundAdjustments(jsapi, '- N/A -'));
  promises.push(getDimValues(jsapi, roundId, dimensions));
  return Promise.all(promises).then(function(results) {
    let roundAdjustmentIds = results[0];
    let dimValues = results[1];

    // perform max load test case
    return testCaseSimulate(jsapi, concurrent, meanIntervalBetweenRequest, duration, function() {
      return testCaseExecute(jsapi, function() {
        // create 1 round
        return doCreateRound(jsapi,
          'simtest-MaxLoad', '2017-01-01T00:00:00.000+0000', '2017-12-01T00:00:00.000+0000',
          roundAdjustmentIds).then(function(roundId) {
          roundIds.push(roundId);
          return testCaseDelayedValidation(jsapi, 200, isRoundDone, [jsapi, roundId], 180,
            `RoundId: ${roundId}`).then(function() {
            // create 66 segments
            return doSegmentGeneration(jsapi, roundId, dimValues).then(function(result) {
              let segmentIds = PV.ensureArray(result.PVResponse.SegmentsGenerated.SegmentGenerated).map(seg => seg['MongoDB.Segments._id']);
              return getSegments(jsapi, roundId, segmentIds).then(function(segments) {
                // scatter plot query on 5 of the segments
                let promises = [];
                for (let i = 0; i < Math.min(segments.length, 5); i++) {
                  promises.push(doScatterPlotQuery(jsapi, roundId, segments).catch(function(e) {
                    let error = e;
                    if (e.json) {
                      error = pvh.getPVStatus(e.json);
                    }
                    return { message: `ScatterPlotQuery Failed for ${roundId}: ${pvh.getErrorMessage(error)}` };
                  }));
                }
                return Promise.all(promises);
              }).then(function(results) {
                let message = [];
                results.forEach(function(e) {
                  if (PV.isString(e.message)) {
                    message.push(e.message);
                  }
                });
                if (message.length > 0) {
                  return { message: message.join('; ') };
                } else {
                  return results;
                }
              });
            }).catch(function(e) {
              let error = e;
              if (e.json) {
                error = pvh.getPVStatus(e.json);
              }
              return { message: `SegmentGeneration Failed for ${roundId}: ${pvh.getErrorMessage(error)}` };
            });
          });
        }).catch(function(e) {
          let error = e;
          if (e.json) {
            error = pvh.getPVStatus(e.json);
          }
          return { message: `RoundsCreation Failed: ${pvh.getErrorMessage(error)}` };
        }).then(function(result) {
          if (PV.isObject(result) && PV.isString(result.message)) {
            throw result;
          } else {
            return result;
          }
        });
      });
    });
  }).then(function() {
    // clean up created rounds
    return deleteRounds(jsapi, roundIds).catch(function(e) {
      let error = e;
      if (e.json) {
        error = pvh.getPVStatus(e.json);
      }
      jsapi.logger.info('RoundsDeletion Failed: ' + pvh.getErrorMessage(error));
      return;
    });
  });
};

const testTypicalLoad = function(jsapi, concurrent, meanIntervalBetweenRequest, duration, roundId, dimensions) {
  // get list of dimensions for segment generation
  let promises = [];
  promises.push(getDimValues(jsapi, roundId, dimensions));
  promises.push(getSegments(jsapi, roundId));
  return Promise.all(promises).then(function(results) {
    let dimValues = results[0];
    let segments = results[1].filter(function(segObj) {
      let pass = true;
      for (let i = 0; i < dimValues.length; i++) {
        let dim = dimValues[i].dim;
        let values = dimValues[i].values;
        if (dimensions[dim] !== 0) {
          if (values.includes(segObj[dim.replace(/^DataPoints_/, 'Segments_')])) {
            pass = false;
            break;
          }
        }
      }
      return pass;
    });

    // perform typical load test case
    return testCaseSimulate(jsapi, concurrent, meanIntervalBetweenRequest, duration, function() {
      return testCaseExecute(jsapi, function() {
        //randonly select a typical situation based on distribution
        let random = Math.random();
        // query existing scatter plot - 75% of the time
        if (random >= 0 && random < .75) {
          return doScatterPlotQuery(jsapi, roundId, segments).then(function() {
            return { message: 'test: ScatterPlotQuery' };
          }).catch(function(e) {
            let error = e;
            if (e.json) {
              error = pvh.getPVStatus(e.json);
            }
            throw { message: 'ScatterPlotQuery Failed: ' + pvh.getErrorMessage(error) };
          });
        // create a segment - 15% of the time
        } else if (random >= .75 && random < .9) {
          return doSegmentGeneration(jsapi, roundId, dimValues).then(function() {
            return { message: 'test: SegmentGeneration' };
          }).catch(function(e) {
            let error = e;
            if (e.json) {
              error = pvh.getPVStatus(e.json);
            }
            throw { message: 'SegmentGeneration Failed: ' + pvh.getErrorMessage(error) };
          });
        // query excel data dump for all DataPoints - 10%  of the time
        } else {
          return doExcelDataPoints(jsapi, roundId).then(function() {
            return { message: 'test: ExcelDataPoints' };
          }).catch(function(e) {
            let error = e;
            if (e.json) {
              error = pvh.getPVStatus(e.json);
            }
            throw { message: 'ExcelDataPoints Failed: ' + pvh.getErrorMessage(error) };
          });
        }
      });
    });
  });
};

function main(pvconfigs, service, endpoint,
  sfdcUsername, sfdcPassword, apiKey,
  testCase, concurrent, meanIntervalBetweenRequest, duration) {
  //set up context for test cases
  let jsapi = this;
  try {
    pvh.setupLogger(jsapi);
    const services = fs.readJsonSync(path.join(pvconfigs, 'services.json'));
    const serverInfoURL = services[service].engine.webXml.ServerInfoURL;
    const protocol = serverInfoURL.split('://')[0];

    const hostPort = serverInfoURL.split('/')[2];
    const host = hostPort.split(':')[0];
    const port = hostPort.split(':')[1];

    const apps = fs.readJsonSync(path.join(pvconfigs, service,
      'AppConfig', 'apps', 'apps.json'));
    const appName = apps[endpoint].appName;
    const version = apps[endpoint].version;
    const mongoDataSetId = apps[endpoint].mongoDataSetId;
    const sfdcDataSetId = apps[endpoint].sfdcDataSetId;

    if (PV.isString(apiKey) === false || apiKey === 'null' || PV.isEmptyValue(apiKey)) {
      apiKey = null;
    }

    jsapi.logger.info(`Starting simtest ${PV.getTimestamp()}...`);
    return pvh.login(jsapi, protocol, host, port, sfdcUsername, sfdcPassword, apiKey, {
      html5AppName: appName,
      html5AppVersion: version
    }).then(function() {
      return pvh.createSalesforceProviderModel(jsapi, sfdcDataSetId, sfdcUsername, sfdcPassword);
    }).then(function() {
      return pvh.createMongoProviderModel(jsapi, sfdcUsername,
        appName, mongoDataSetId, {
          socketTimeoutMS: socketTimeoutMS
        });
    }).then(function() {
      let params = {
        ProfitModel: jsapi.mongo.modelId,
        Category: 'Rounds',
        Groups: {
          Group: pvh.convertGroupOrFieldArrayForQueryParams(['Rounds__id'])
        },
        SearchCriteria: {
          AndFilter: {
            OrFilter: [{
              _attrs: {
                category: 'Rounds'
              },
              AndFilter: [{
                Filter: [
                  `Rounds_name='Demo 2017 - Target Setting'`
                ]
              }]
            }]
          }
        }
      };
      return jsapi.pv.sendRequest('Query', params);
    }).then(function(result) {
      let round = result.PVResponse.Res1;
      concurrent = parseInt(concurrent, 10);
      meanIntervalBetweenRequest = parseFloat(meanIntervalBetweenRequest);
      duration = parseInt(duration, 10);

      // perform requested test case
      if (testCase.toLowerCase() === 'MaxLoad'.toLowerCase()) {
        jsapi.logger.info(`Starting MaxLoad test...`);
        return testMaxLoad(jsapi, concurrent, meanIntervalBetweenRequest, duration, round.Rounds__id, {
          DataPoints_marketSP: 0,
          DataPoints_regionSP: 0,
          DataPoints_pifSP: 0
        });
      } else if (testCase.toLowerCase() === 'TypicalLoad'.toLowerCase()) {
        jsapi.logger.info(`Starting TypicalLoad test...`);
        return testTypicalLoad(jsapi, concurrent, meanIntervalBetweenRequest, duration, round.Rounds__id, {
          DataPoints_marketSP: 1,
          DataPoints_regionSP: 0
        });
      } else if (testCase.toLowerCase() === 'ExcelDataPoints'.toLowerCase()) {
        jsapi.logger.info(`Starting ExcelDataPoints test...`);
        return testExcelDataPoints(jsapi, concurrent, meanIntervalBetweenRequest, duration, round.Rounds__id);
      } else if (testCase.toLowerCase() === 'ScatterPlotQuery'.toLowerCase()) {
        jsapi.logger.info(`Starting ScatterPlotQuery test...`);
        return testScatterPlotQuery(jsapi, concurrent, meanIntervalBetweenRequest, duration, round.Rounds__id);
      } else if (testCase.toLowerCase() === 'RoundsCreation'.toLowerCase()) {
        jsapi.logger.info(`Starting RoundsCreation test...`);
        return testRoundCreation(jsapi, concurrent, meanIntervalBetweenRequest, duration);
      } else if (testCase.toLowerCase() === 'SegmentGeneration'.toLowerCase()) {
        jsapi.logger.info(`Starting SegmentGeneration test...`);
        return testSegmentGeneration(jsapi, concurrent, meanIntervalBetweenRequest, duration, round.Rounds__id, {
          DataPoints_marketSP: 1,
          DataPoints_regionSP: 0
        });
      } else if (testCase.toLowerCase() === 'SegmentGenerationAll'.toLowerCase()) {
        jsapi.logger.info(`Starting SegmentGenerationAll test...`);
        return testSegmentGeneration(jsapi, concurrent, meanIntervalBetweenRequest, duration, round.Rounds__id, {
          DataPoints_marketSP: 0,
          DataPoints_regionSP: 0,
          DataPoints_pifSP: 0
        });
      } else {
        throw {
          code: 'JSAPI2_SEMANTIC_ERROR',
          message: 'No valid test case found...'
        };
      }
    }).then(function() {
      pvh.cleanup(jsapi);
      process.exit(0);
    }).catch(function(e) {
      jsapi.logger.error(e, false);
      pvh.cleanup(jsapi);
      process.exit(1);
    });
  } catch (e) {
    jsapi.logger.error(e, false);
    try {
      pvh.cleanup(jsapi);
    } catch (e2) {}
    process.exit(1);
  }
}

var nodename = process.argv[0].replace(/^.*[/]/, '');
var procname = process.argv[1].replace(/^.*[/]/, '');
var args = process.argv.slice(2);
if (args.length !== 10) {
  console.log(`usage: ${nodename} ${procname} pvconfigs service endpoint sdfcUsername sfdcPassword apiKey testName concurrent meanIntervalBetweenRequest duration`);
  process.exit(1);
}

main.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);