/**
 * Agent Battalion Web Server
 *
 * MGX-style multi-agent app generation with real-time collaboration
 */
import { Server as SocketIOServer } from 'socket.io';
import 'dotenv/config';
declare const app: import("express-serve-static-core").Express;
declare const server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function startServer(port?: number): Promise<void>;
export { app, server, io };
//# sourceMappingURL=server.d.ts.map