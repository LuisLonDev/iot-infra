#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStarterStack } from '../../lib/cdk-starter-stack';
import { LambdaStack } from './stack/lamda/lamda-stack';

const app = new cdk.App();
new LambdaStack(app, 'Lambda')