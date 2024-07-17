import { Stack, StackProps } from "aws-cdk-lib";
import { CfnFleetMetric } from "aws-cdk-lib/aws-iot";
import { Construct } from "constructs";

export class IotFleetMetricStack extends Stack {
  public readonly fleetMetricName: string;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fleetMetric = new CfnFleetMetric(this, "FleetMetric", {
      metricName: "ThingConnectivityMetric",
      queryString: "SELECT connectivity.connected FROM AWS_Things",
      aggregationField: "connectivity.connected",
      aggregationType: {
        name: "Statistics",
        values: ["count"],
      },
      period: 60, // 1 minute
      queryVersion: "2017-09-30",
    });

    this.fleetMetricName = fleetMetric.metricName;
  }
}
