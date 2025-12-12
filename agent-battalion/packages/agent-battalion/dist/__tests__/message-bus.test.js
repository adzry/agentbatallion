"use strict";
/**
 * Message Bus Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const message_bus_js_1 = require("../communication/message-bus.js");
(0, vitest_1.describe)('MessageBus', () => {
    let bus;
    (0, vitest_1.beforeEach)(() => {
        bus = new message_bus_js_1.MessageBus();
    });
    (0, vitest_1.describe)('send', () => {
        (0, vitest_1.it)('should send messages to specific recipient', () => {
            const handler = vitest_1.vi.fn();
            bus.on('message', handler);
            bus.send('sender', 'recipient', 'Hello');
            (0, vitest_1.expect)(handler).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                from: 'sender',
                to: 'recipient',
                content: 'Hello',
            }));
        });
        (0, vitest_1.it)('should generate message ids', () => {
            const handler = vitest_1.vi.fn();
            bus.on('message', handler);
            bus.send('a', 'b', 'test');
            const message = handler.mock.calls[0][0];
            (0, vitest_1.expect)(message.id).toBeDefined();
        });
    });
    (0, vitest_1.describe)('broadcast', () => {
        (0, vitest_1.it)('should broadcast to all listeners', () => {
            const handler = vitest_1.vi.fn();
            bus.on('broadcast', handler);
            bus.broadcast('sender', 'Announcement');
            (0, vitest_1.expect)(handler).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                from: 'sender',
                content: 'Announcement',
            }));
        });
    });
    (0, vitest_1.describe)('request/reply', () => {
        (0, vitest_1.it)('should handle request-reply pattern', async () => {
            // Set up reply handler
            bus.on('message', (msg) => {
                if (msg.content === 'ping') {
                    bus.reply(msg.id, 'recipient', 'pong');
                }
            });
            const response = await bus.request('sender', 'recipient', 'ping');
            (0, vitest_1.expect)(response).toBe('pong');
        });
        (0, vitest_1.it)('should timeout if no reply', async () => {
            await (0, vitest_1.expect)(bus.request('sender', 'recipient', 'no-reply', 100)).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('history', () => {
        (0, vitest_1.it)('should track message history', () => {
            bus.send('a', 'b', 'message 1');
            bus.send('b', 'c', 'message 2');
            bus.broadcast('a', 'broadcast');
            const history = bus.getHistory();
            (0, vitest_1.expect)(history.length).toBe(3);
        });
        (0, vitest_1.it)('should limit history size', () => {
            for (let i = 0; i < 150; i++) {
                bus.send('a', 'b', `message ${i}`);
            }
            const history = bus.getHistory();
            (0, vitest_1.expect)(history.length).toBeLessThanOrEqual(100);
        });
    });
});
//# sourceMappingURL=message-bus.test.js.map