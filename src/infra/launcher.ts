#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from './stack/lamda/lamda-stack';
import {ApiGatewayStack} from './stack/api/api-gateway-stack'

const app = new cdk.App();
const lambdaStack = new LambdaStack(app, 'Lambda')
new ApiGatewayStack(app, 'ApiGatewayStack',{
    lambdaFunction: lambdaStack.lambdaIntegration
})
