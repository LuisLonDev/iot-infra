import { Stack, StackProps } from "aws-cdk-lib";
import { Dashboard, GraphWidget, GraphWidgetView, Metric } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";

interface CloudwatchDashboardStackPorps extends StackProps {
    connectionMetricName: string;
}

export class CloudwatchDashboardStack extends Stack {
    constructor(scope: Construct, id: string, props: CloudwatchDashboardStackPorps) {
      super(scope, id, props);
  
      const dashboard = new Dashboard(this, 'IotConnectivityDashboard', {
        dashboardName: 'IoTConnectivityDashboard'
      });
  
      const connectedMetric = new Metric({
        namespace: 'AWS/IoT',
        metricName: props.connectionMetricName,
        dimensionsMap: {
          FleetMetricName: 'ThingConnectivityMetric'
        },
        statistic: 'SampleCount'
      });
  
      dashboard.addWidgets(
        new GraphWidget({
          title: 'IoT Things Connectivity',
          left: [connectedMetric],
          view: GraphWidgetView.PIE,
        })
      );
    }
  }