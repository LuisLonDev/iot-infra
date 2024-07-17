import { Stack, StackProps } from "aws-cdk-lib";
import { CfnThingType } from "aws-cdk-lib/aws-iot";
import { Construct } from "constructs";

export class IotThingTypeStack extends Stack {
  public readonly thingTypeName: string;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create IoT Thing Type
    const thingType = new CfnThingType(this, "GasLevelSensorThingType", {
      thingTypeName: "gasLevelSensor",
    });

    this.thingTypeName = thingType.thingTypeName!;
  }
}
