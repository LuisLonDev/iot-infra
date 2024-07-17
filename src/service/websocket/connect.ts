import { APIGatewayProxyWebsocketEventV2, Context } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

async function handler(
  event: APIGatewayProxyWebsocketEventV2,
  ddbClient: DynamoDBClient
) {
  const connectionId = event.requestContext.connectionId;
  const thingName = event.body;

  if (thingName) {
    try {
      const result = await ddbClient.send(
        new PutItemCommand({
          TableName: process.env.CONNECTIONS_TABLE,
          Item: {
            thingName: {
              S: thingName,
            },
            connectionId: {
              S: connectionId,
            },
          },
        })
      );

      console.log(result);

      return {
        statusCode: 201,
        body: JSON.stringify({ thingName, connectionId }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: "Failed to connect: " + JSON.stringify((err as Error).message),
      };
    }
  }

  return {
    statusCode: 400,
    body: "Please prove a Thing Name",
  };
}
