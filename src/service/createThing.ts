import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import {
  IoTClient,
  CreateThingCommand,
  CreateKeysAndCertificateCommand,
  AttachThingPrincipalCommand,
  CreatePolicyCommand,
  AttachPolicyCommand,
} from "@aws-sdk/client-iot";

async function handler(event: APIGatewayProxyEventV2, context: Context) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Thing name is required" }),
      };
    }

    const { thingName } = JSON.parse(event.body);
    const policyName = `${thingName}_Policy`;

    if (!thingName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Thing name is required" }),
      };
    }

    const client = new IoTClient();
    const createThingCommand = new CreateThingCommand({
      thingName,
    });
    const createThingResponse = await client.send(createThingCommand);

    const createKeaysAndCertificateCommand =
      new CreateKeysAndCertificateCommand({
        setAsActive: true,
      });
    const createKeysAndCertificatesResponse = await client.send(
      createKeaysAndCertificateCommand
    );

    const attachThingPrincipalCommand = new AttachThingPrincipalCommand({
      thingName,
      principal: createKeysAndCertificatesResponse.certificateArn,
    });

    await client.send(attachThingPrincipalCommand);
    const policyDocument = JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Connect",
                    "iot:Publish",
                    "iot:Subscribe",
                    "iot:Receive"
                ],
                "Resource": "*"
            }
        ]
    });
    const createPolicyCommand = new CreatePolicyCommand({ policyName, policyDocument });
    await client.send(createPolicyCommand);
        
        // Attach the policy to the certificate
        const attachPolicyCommand = new AttachPolicyCommand({ policyName, target: createKeysAndCertificatesResponse.certificateArn });
        await client.send(attachPolicyCommand);

    

    return {
      statusCode: 200,
      body: JSON.stringify({
        thingName: createThingResponse.thingName,
        certificateArn: createKeysAndCertificatesResponse.certificateArn,
        certificatePem: createKeysAndCertificatesResponse.certificatePem,
        keyPair: createKeysAndCertificatesResponse.keyPair,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to create thing",
        error: (error as Error).message,
      }),
    };
  }
}

export { handler };
