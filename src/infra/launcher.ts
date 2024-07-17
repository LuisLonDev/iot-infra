#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LambdaStack } from "./stack/lamda/lamda-stack";
import { ApiGatewayStack } from "./stack/api/api-gateway-stack";
import { TimestreamStack } from "./stack/data/timestreams-stack";
import { IotCoreStack } from "./stack/iot/iot-core-stack";
import { GrafanaStack } from "./stack/visualization/grafana-stack";
import { IotThingTypeStack } from "./stack/iot/iot-thingType-stack";
import { DynamoDBStack } from "./stack/data/dynamodb-stack";
import { IotDynamicThingGroupsStack } from "./stack/iot/iot-dynamicThingGroups-stack";
import { IotFleetMetricStack } from "./stack/iot/iot-fleetMetric-stack";
import { CloudwatchDashboardStack } from "./stack/visualization/cloudWatch-stack";

const app = new cdk.App();

const thingType = new IotThingTypeStack(app, "ThingType");
const lambdaStack = new LambdaStack(app, "LambdaStack", {
  thingTypeName: thingType.thingTypeName,
});

new DynamoDBStack(app, "DynamoDbStack");
new ApiGatewayStack(app, "ApiGatewayStack", {
  websocketConnectLambdaFunction: lambdaStack.websocketConnectLambdaFunction,
  websocketDisconnectLambdaFunction:
    lambdaStack.websocketDisconnectLambdaFunction,
  websocketSendIotPayloadLambdaFunction:
    lambdaStack.websocketSendIotDataLambdaFunction,
  thingCreationLambdaFunction: lambdaStack.thingCreationLambdaFunction,
});

const timestreamStack = new TimestreamStack(app, "TimestreamStack");

new IotCoreStack(app, "IotStack", {
  timestreamDatabase: timestreamStack.database,
  timestreamTable: timestreamStack.table,
});

new IotDynamicThingGroupsStack(app, "IotDynamicThingGroupsStack");

// paid
// const fleetMetric = new IotFleetMetricStack(app, "IotFleetMetricStack"); 
// new CloudwatchDashboardStack(app, "CloudWatch", {
//   connectionMetricName: fleetMetric.fleetMetricName,
// });
// new GrafanaStack(app, 'GrafanaStack', {
//   timestreamDatabase: timestreamStack.database,
//   timestreamTable: timestreamStack.table,
// });
