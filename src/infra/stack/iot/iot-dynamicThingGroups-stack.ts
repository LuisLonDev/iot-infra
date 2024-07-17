import { Stack, StackProps } from "aws-cdk-lib";
import { CfnThingGroup } from "aws-cdk-lib/aws-iot";
import { Construct } from "constructs";


export class IotDynamicThingGroupsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Connected thing group
    new CfnThingGroup(this, 'ConnectedThingGroup', {
      thingGroupName: 'ConnectedThings',
      queryString: "connectivity.connected:true",


    });

    // Disconnected thing group
    new CfnThingGroup(this, 'DisconnectedThingGroup', {
      thingGroupName: 'DisconnectedThings',
      queryString: "connectivity.connected:false",
    });
  }
}
