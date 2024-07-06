import { Stack, StackProps } from "aws-cdk-lib";
import { CfnTopicRule } from "aws-cdk-lib/aws-iot";
import { Construct } from "constructs";

export class IotCoreStack extends Stack {

    constructor(scope: Construct, id: string, props: StackProps){
        super(scope, id, props )

        const rule = new CfnTopicRule(this, 'MyIotTopicRule', {
            ruleName: 'MyIotRule',
            topicRulePayload: {
              sql: "SELECT * FROM 'my/iot/topic'",
              actions: [],
            },
          });
    }
}