import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { IoTDataPlaneClient, UpdateThingShadowCommand, UpdateThingShadowCommandInput, UpdateThingShadowRequest } from "@aws-sdk/client-iot-data-plane";
import {
  IoTClient,
  CreateThingCommand,
  CreateKeysAndCertificateCommand,
  AttachThingPrincipalCommand,
  CreatePolicyCommand,
  AttachPolicyCommand,
} from "@aws-sdk/client-iot";
import { get } from 'https'

//Gets the Amazon CA Certificate
const downloadCaCert = (url: string) => {
  return new Promise((resolve, reject) => {
      get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => {
              data += chunk;
          });
          res.on('end', () => {
              resolve(data);
          });
      }).on('error', (err) => {
          reject(err);
      });
  });
};
 // unique url to download Ca certificate from AWS
const CA_URL = "https://www.amazontrust.com/repository/AmazonRootCA1.pem";

async function handler(event: APIGatewayProxyEventV2, context: Context) {
  try {

    // all of the sensors have a the same name followed by a random hash
    // by now all of them are the same thing type, this might change in the future
    const hash = Math.floor(100000 + Math.random() * 900000)
    const thingName = `gas_level_sensor-${hash}`
    const thingTypeName = process.env.THING_TYPE_NAME; 
    const policyName = `${thingName}_Policy`;

    const iotCoreClient = new IoTClient();
    const iotDataPlaneClient = new IoTDataPlaneClient();

    const encoder = new TextEncoder();


    const createThingCommand = new CreateThingCommand({
      thingName,
      thingTypeName, 
    });
    const createThingResponse = await iotCoreClient.send(createThingCommand);

    const createKeaysAndCertificateCommand =
      new CreateKeysAndCertificateCommand({
        setAsActive: true,
      });
    const createKeysAndCertificatesResponse = await iotCoreClient.send(
      createKeaysAndCertificateCommand
    );

    const attachThingPrincipalCommand = new AttachThingPrincipalCommand({
      thingName,
      principal: createKeysAndCertificatesResponse.certificateArn,
    });

    await iotCoreClient.send(attachThingPrincipalCommand);
    const policyDocument = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "iot:Connect",
            "iot:Publish",
            "iot:Subscribe",
            "iot:Receive",
          ],
          Resource: "*",
        },
      ],
    });
    const createPolicyCommand = new CreatePolicyCommand({
      policyName,
      policyDocument,
    });
    await iotCoreClient.send(createPolicyCommand);

    // Attach the policy to the certificate
    const attachPolicyCommand = new AttachPolicyCommand({
      policyName,
      target: createKeysAndCertificatesResponse.certificateArn,
    });
    await iotCoreClient.send(attachPolicyCommand);

    const input: UpdateThingShadowCommandInput= { 
      thingName, // required
      payload: encoder.encode(JSON.stringify({
        state: {
          reported: {
            maintence: false,
            fw_version: "1.0",
          },
        }
      }))
    };

    //update thing shadow
    const command = new UpdateThingShadowCommand(input);
    await iotDataPlaneClient.send(command);

    const caCert = await downloadCaCert(CA_URL);

    return {
      statusCode: 200,
      body: JSON.stringify({
        thingName: createThingResponse.thingName,
        caCert,
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
