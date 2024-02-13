import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

@WebSocketGateway({ cors: true })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleDisconnect(client: any) {
    console.log('client disconnected', client);
  }
  handleConnection(client: any, ...args: any[]) {
    console.log('client connected', client, args);
  }
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('events')
  handleMessage(@MessageBody() data: any) {
    this.server.emit('events', data);
  }
}
