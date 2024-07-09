import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { HttpApi, HttpMethod, WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration, HttpLambdaIntegration  } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';

export interface ApiGatewayStackProps extends StackProps {
    websocketLambdaFunction: WebSocketLambdaIntegration,
    thingCreationLambdaFunction: HttpLambdaIntegration
}

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    // Define the WebSocket API
    const webSocketApi = new WebSocketApi(this, 'WebSocketApi', {
      connectRouteOptions: {
        integration: props.websocketLambdaFunction,
      },
      disconnectRouteOptions: {
        integration: props.websocketLambdaFunction,
      },
      defaultRouteOptions: {
        integration: props.websocketLambdaFunction,
      },
    });

    webSocketApi.addRoute('messages', {
      integration: props.websocketLambdaFunction,
    })

    // Create a stage for the WebSocket API
    new WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    const httpApi = new HttpApi(this, 'ThingCreationAPI', {
      apiName: 'ThingCreationApi',
    })

    httpApi.addRoutes({
      path:'/create-thing',
      integration: props.thingCreationLambdaFunction,
      methods: [HttpMethod.POST],
    })

    // Output the WebSocket API URL
    new CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketApi.apiEndpoint,
    });

    // Output the HttP API URL
    new CfnOutput(this, 'HttpApiEndpointUrl', {
      value: httpApi.url || '',
    });
  }
}