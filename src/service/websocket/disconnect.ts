import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent,
  ddbClient: DynamoDBClient
) {
  const connectionId = event.requestContext.connectionId;

  if (connectionId) {
    try {
      await ddbClient.send(
        new DeleteItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: {
            connectionId: { S: connectionId },
          },
        })
      );

      return { statusCode: 200, body: "Disconnected." };
    } catch (err) {
      return {
        statusCode: 500,
        body: "Failed to disconnect: " + JSON.stringify((err as Error).message),
      };
    }
  }
  return {
    statusCode: 500,
    body: "Failed to disconnect: no connectionId provided ",
  };
}
