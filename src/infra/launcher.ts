#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from './stack/lamda/lamda-stack';
import {ApiGatewayStack} from './stack/api/api-gateway-stack'
import { TimestreamStack } from './stack/data/timestreams-stack';
import { IotCoreStack } from './stack/iot/iot-core-stack';
import { GrafanaStack } from './stack/visualization/grafana-stack';

const app = new cdk.App();
const lambdaStack = new LambdaStack(app, 'Lambda')
new ApiGatewayStack(app, 'ApiGatewayStack',{
    websocketLambdaFunction: lambdaStack.websocketLambdaFunction,
    thingCreationLambdaFunction: lambdaStack.thingCreationLambdaFunction
})

const timestreamStack = new TimestreamStack(app, 'TimestreamStack');

new IotCoreStack(app, 'IotStack', {
  timestreamDatabase: timestreamStack.database,
  timestreamTable: timestreamStack.table,
});

// new GrafanaStack(app, 'GrafanaStack', {
//   timestreamDatabase: timestreamStack.database,
//   timestreamTable: timestreamStack.table,
// });

