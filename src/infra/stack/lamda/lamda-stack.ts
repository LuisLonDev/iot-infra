import { Stack, StackProps } from 'aws-cdk-lib'
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Runtime} from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export class LambdaStack extends Stack{

    public readonly lambdaIntegration: WebSocketLambdaIntegration;

    constructor(scope: Construct, id: string, props?: StackProps){
        super(scope, id, props)

        const sendIotPayload = new NodejsFunction(this, 'sendIotPayload', {
            runtime: Runtime.NODEJS_20_X,
            handler: 'handler',
            entry: (join(__dirname, '..', '..', '..', 'service', 'sendIotPayload.ts'))
        })

        sendIotPayload.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['*'], // TODO: refine access policies
            resources: ['*']
        }))

        this.lambdaIntegration = new WebSocketLambdaIntegration(id,sendIotPayload)
    }
}