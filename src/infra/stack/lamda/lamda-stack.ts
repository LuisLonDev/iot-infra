import { Stack, StackProps } from "aws-cdk-lib";
import { HttpLambdaIntegration, WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

export class LambdaStack extends Stack {
  public readonly websocketLambdaFunction: WebSocketLambdaIntegration;
  public readonly thingCreationLambdaFunction: HttpLambdaIntegration;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sendIotPayload = new NodejsFunction(this, "sendIotPayload", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(__dirname, "..", "..", "..", "service", "sendIotPayload.ts"),
    });

    sendIotPayload.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["*"], // TODO: refine access policies
        resources: ["*"],
      })
    );

    this.websocketLambdaFunction = new WebSocketLambdaIntegration(id, sendIotPayload);

    const createNewThing = new NodejsFunction(this, "createThingFunction", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(__dirname, "..", "..", "..", "service", "createThing.ts"),
    });

    createNewThing.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "iot:CreateThing",
          "iot:CreateKeysAndCertificate",
          "iot:AttachThingPrincipal",
        ],
        resources: ["*"],
      })
    );

    this.thingCreationLambdaFunction = new HttpLambdaIntegration(id, createNewThing)
  }
}
