import { APIGatewayProxyWebsocketEventV2, Context } from "aws-lambda";

async function handler(event: APIGatewayProxyWebsocketEventV2, context: Context ) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    
    let response;
    
    switch (event.requestContext.routeKey) {
        case '$connect':
            response = { statusCode: 200 };
            break;
        case '$disconnect':
            response = { statusCode: 200 };
            break;
        case '$default':
            response = {
                statusCode: 200,
                body: JSON.stringify({ message: "Hello from Lambda through WebSocket!" }),
            };
            break;
        default:
            response = { statusCode: 400, body: 'Invalid route' };
    }
    
    return response;
}

export { handler }