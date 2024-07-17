import { Stack, StackProps } from "aws-cdk-lib";
import {
  HttpLambdaIntegration,
  WebSocketLambdaIntegration,
} from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface LambdaStackProps extends StackProps{
  thingTypeName: string;
}

export class LambdaStack extends Stack{
  public readonly websocketConnectLambdaFunction: WebSocketLambdaIntegration;
  public readonly websocketDisconnectLambdaFunction: WebSocketLambdaIntegration;
  public readonly websocketSendIotDataLambdaFunction: WebSocketLambdaIntegration;
  public readonly thingCreationLambdaFunction: HttpLambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const connect = new NodejsFunction(this, "connectHandler", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(__dirname, "..", "..", "..", "service","websocket", "connect.ts"),
    });


    connect.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["*"], // TODO: refine access policies
        resources: ["*"],
      })
    );

    const discoconnect = new NodejsFunction(this, "disconnectHandler", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(__dirname, "..", "..", "..", "service","websocket", "disconnect.ts"),
    });

    discoconnect.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["*"], // TODO: refine access policies
        resources: ["*"],
      })
    );

    const sendIotPayload = new NodejsFunction(this, "sendIotPayload", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(__dirname, "..", "..", "..", "service","websocket", "sendIotPayload.ts"),
    });

    sendIotPayload.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["*"], // TODO: refine access policies
        resources: ["*"],
      })
    );

    this.websocketConnectLambdaFunction = new WebSocketLambdaIntegration(
      id,
      connect
    );

    this.websocketDisconnectLambdaFunction = new WebSocketLambdaIntegration(
      id,
      discoconnect
    );

    this.websocketSendIotDataLambdaFunction = new WebSocketLambdaIntegration(
      id,
      sendIotPayload
    );

    const createNewThing = new NodejsFunction(this, "createThingFunction", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(__dirname, "..", "..", "..", "service", "createThing.ts"),
      environment: {
        THING_TYPE_NAME: props.thingTypeName
      }
    });

    createNewThing.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "iot:CreateThing",
          "iot:CreateKeysAndCertificate",
          "iot:AttachThingPrincipal",
          "iot:CreatePolicy",
          "iot:AttachPolicy",
          "iot:DescribeThingType",
          "iot:UpdateThingShadow"
        ],
        resources: ["*"],
      })
    );

    this.thingCreationLambdaFunction = new HttpLambdaIntegration(
      id,
      createNewThing
    );
  }
}
