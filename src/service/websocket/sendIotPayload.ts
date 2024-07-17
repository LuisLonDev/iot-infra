import { APIGatewayProxyWebsocketEventV2, Context } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";

async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE!;
  const ddbClient = new DynamoDBClient();
  const apiGatewayClient = new ApiGatewayManagementApiClient();
  const encoder = new TextEncoder();

  const thingName = event.body!;

  const getConnectionIdResponse = await ddbClient.send(
    new GetItemCommand({
      TableName: CONNECTIONS_TABLE,
      Key: {
        thingName: { S: thingName },
      },
    })
  );

  const input: PostToConnectionCommandInput = {
    Data: encoder.encode("this is a response from "),
    ConnectionId: "123",
  };

  const postCmd = new PostToConnectionCommand(input);

  await apiGatewayClient.send(postCmd);
}

export { handler };
