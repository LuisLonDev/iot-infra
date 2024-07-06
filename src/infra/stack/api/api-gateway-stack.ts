import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';

export interface ApiGatewayStackProps extends StackProps {
    lambdaFunction: WebSocketLambdaIntegration
}

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    // Define the WebSocket API
    const webSocketApi = new WebSocketApi(this, 'MyWebSocketApi', {
      connectRouteOptions: {
        integration: props.lambdaFunction,
      },
      disconnectRouteOptions: {
        integration: props.lambdaFunction,
      },
      defaultRouteOptions: {
        integration: props.lambdaFunction,
      },
    });

    webSocketApi.addRoute('messages', {
      integration: props.lambdaFunction,
    })

    // Create a stage for the WebSocket API
    new WebSocketStage(this, 'MyWebSocketStage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    // Output the WebSocket API URL
    new CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketApi.apiEndpoint,
    });
  }
}