import { CfnDatabase, CfnTable } from "aws-cdk-lib/aws-timestream";
import { CfnWorkspace } from "aws-cdk-lib/aws-grafana";
import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

interface GrafanaStackProps extends StackProps {
  timestreamDatabase: CfnDatabase;
  timestreamTable: CfnTable;
}

export class GrafanaStack extends Stack {
  constructor(scope: Construct, id: string, props: GrafanaStackProps) {
    super(scope, id, props);

    // Define the IAM role for Grafana
    const grafanaRole = new Role(this, "GrafanaRole", {
      assumedBy: new ServicePrincipal("grafana.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonTimestreamReadOnlyAccess"
        ),
      ],
    });

    // Define the Grafana workspace
    const grafanaWorkspace = new CfnWorkspace(this, 'MyGrafanaWorkspace', {
      accountAccessType: 'CURRENT_ACCOUNT',
      authenticationProviders: [],
      permissionType: 'SERVICE_MANAGED',
      roleArn: grafanaRole.roleArn,
      dataSources: ['TIMESTREAM'],
    });

    const dashboard = {
      panels: [
        {
          title: "Device Data by Device ID",
          type: "timeseries",
          datasource: {
            type: "TIMESTREAM",
          },
          targets: [
            {
              query: `SELECT time, measure_value::double AS value FROM ${props.timestreamDatabase.databaseName}.${props.timestreamTable.tableName} WHERE device_id = 'your_device_id'`,
            },
          ],
        },
        {
          title: "Measure Type Data",
          type: "timeseries",
          datasource: {
            type: "TIMESTREAM",
          },
          targets: [
            {
              query: `SELECT time, measure_value::double AS value FROM ${props.timestreamDatabase.databaseName}.${props.timestreamTable.tableName} WHERE measure_name = 'your_measure_name'`,
            },
          ],
        },
      ],
    };

    // Output the Grafana workspace URL
    new CfnOutput(this, "GrafanaWorkspaceUrl", {
      value: `https://${grafanaWorkspace.attrEndpoint}/`,
    });
  }
}
