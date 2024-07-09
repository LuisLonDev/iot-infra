import { Stack, StackProps } from "aws-cdk-lib";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { CfnTopicRule } from "aws-cdk-lib/aws-iot";
import { CfnDatabase, CfnTable } from "aws-cdk-lib/aws-timestream";
import { Construct } from "constructs";

interface IotStackProps extends StackProps {
  timestreamDatabase: CfnDatabase;
  timestreamTable: CfnTable;
}

export class IotCoreStack extends Stack {
  constructor(scope: Construct, id: string, props: IotStackProps) {
    super(scope, id, props);

    const role = new Role(this, "IoTRuleRole", {
      assumedBy: new ServicePrincipal("iot.amazonaws.com"),
      inlinePolicies: {
        timestreamAccess: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                "timestream:WriteRecords",
                "timestream:DescribeEndpoints",
              ],
              resources: ["*"],
              effect: Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    const rule = new CfnTopicRule(this, "DataIngestionIotRule", {
      ruleName: "DataIngestionIotRule",
      topicRulePayload: {
        sql: "SELECT * FROM 'iot/dataIngestion'",
        ruleDisabled: false,
        actions: [
          {
            timestream: {
              databaseName: "iotDB", //for some reason the refs aren't working, hardcoding values instead 
              tableName: "measurements",
              roleArn: role.roleArn,
              dimensions: [
                {
                  name: "device_id",
                  value: "${device_id}",
                },
              ],
              timestamp: {
                unit: "MILLISECONDS",
                value: "${timestamp()}",
              },
            },
          },
        ],
      },
    });
  }
}
