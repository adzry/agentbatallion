/**
 * Message Bus Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessageBus, MessageBus } from '../communication/message-bus.js';

describe('MessageBus', () => {
  let messageBus: MessageBus;

  beforeEach(() => {
    messageBus = createMessageBus({ enableLogging: false });
  });

  describe('subscribe', () => {
    it('should subscribe to a channel', () => {
      const handler = vi.fn();
      
      messageBus.subscribe('test-channel', handler);
      messageBus.send('test-channel', { type: 'test', data: 'hello' });

      expect(handler).toHaveBeenCalledTimes(1);
      // Handler receives full message object, not just the data
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'test', data: 'hello' }),
        })
      );
    });

    it('should allow multiple subscribers to same channel', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      messageBus.subscribe('test-channel', handler1);
      messageBus.subscribe('test-channel', handler2);
      messageBus.send('test-channel', { type: 'test' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should return subscription ID', () => {
      const handler = vi.fn();
      
      const subscriptionId = messageBus.subscribe('test-channel', handler);
      
      expect(typeof subscriptionId).toBe('string');
      expect(subscriptionId.length).toBeGreaterThan(0);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from channel', () => {
      const handler = vi.fn();
      
      const subscriptionId = messageBus.subscribe('test-channel', handler);
      
      messageBus.send('test-channel', { type: 'test1' });
      expect(handler).toHaveBeenCalledTimes(1);
      
      messageBus.unsubscribe('test-channel', subscriptionId);
      
      messageBus.send('test-channel', { type: 'test2' });
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should unsubscribe all handlers from channel', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      messageBus.subscribe('test-channel', handler1);
      messageBus.subscribe('test-channel', handler2);
      
      messageBus.send('test-channel', { type: 'test1' });
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      
      messageBus.unsubscribe('test-channel');
      
      messageBus.send('test-channel', { type: 'test2' });
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('send', () => {
    it('should send message to specific channel', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      messageBus.subscribe('channel-1', handler1);
      messageBus.subscribe('channel-2', handler2);
      
      messageBus.send('channel-1', { type: 'test' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(0);
    });

    it('should return message ID', () => {
      const messageId = messageBus.send('test-channel', { type: 'test' });
      
      expect(typeof messageId).toBe('string');
      expect(messageId.length).toBeGreaterThan(0);
    });

    it('should queue messages for unsubscribed agents', () => {
      // Send before subscribing
      messageBus.send('future-channel', { type: 'queued' });
      
      const handler = vi.fn();
      messageBus.subscribe('future-channel', handler);
      
      // The queued message should be delivered
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('broadcast', () => {
    it('should broadcast to all channels', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      messageBus.subscribe('channel-1', handler1);
      messageBus.subscribe('channel-2', handler2);
      messageBus.subscribe('channel-3', handler3);
      
      messageBus.broadcast({ type: 'broadcast', data: 'hello everyone' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });
  });

  describe('message tracking', () => {
    it('should send messages successfully', () => {
      const msgId1 = messageBus.send('channel-1', { type: 'msg1' });
      const msgId2 = messageBus.send('channel-2', { type: 'msg2' });
      
      expect(msgId1).toBeDefined();
      expect(msgId2).toBeDefined();
    });
  });

  describe('logging', () => {
    it('should not log when disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const bus = createMessageBus({ enableLogging: false });
      
      bus.subscribe('test', () => {});
      bus.send('test', { type: 'test' });
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const bus = createMessageBus({ enableLogging: true });
      
      bus.subscribe('test', () => {});
      bus.send('test', { type: 'test' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
