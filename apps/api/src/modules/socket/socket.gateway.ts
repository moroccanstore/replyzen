import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'events',
})
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  handleConnection(client: Socket) {
    const workspaceId = client.handshake.query.workspaceId as string;
    if (workspaceId) {
      client.join(`workspace:${workspaceId}`);
      this.logger.log(`Client ${client.id} joined workspace ${workspaceId} automatically`);
    } else {
      this.logger.log(`Client connected: ${client.id} (No workspaceId)`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-workspace')
  async handleJoinWorkspace(client: Socket, workspaceId: string) {
    await client.join(`workspace:${workspaceId}`);
    this.logger.log(`Client ${client.id} joined workspace ${workspaceId}`);
    return { event: 'joined', data: workspaceId };
  }

  emitToWorkspace(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }
}
