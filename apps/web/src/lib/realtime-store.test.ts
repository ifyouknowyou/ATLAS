import { describe, expect, it, beforeEach } from '@jest/globals';
import { useRealtimeStore } from './realtime-store';

function msg(partial: Record<string, unknown>) {
  return {
    id: 1,
    type: 'heartbeat',
    investigationId: null,
    message: null,
    createdAt: new Date().toISOString(),
    ...partial,
  } as never;
}

describe('realtime store', () => {
  beforeEach(() => {
    useRealtimeStore.setState({
      presence: {},
      notifications: [],
      unreadCount: 0,
      activity: [],
      reportDeltas: {},
      connectionState: 'idle',
      lastEventId: 0,
    });
  });

  it('tracks presence per resource', () => {
    const store = useRealtimeStore.getState();
    store.apply(msg({ type: 'presence', resourceType: 'INVESTIGATION', resourceId: 'inv1', presence: { userId: 'u1', displayName: 'A', resourceType: 'INVESTIGATION', resourceId: 'inv1', status: 'ACTIVE', lastSeenAt: 'x' } }));
    store.apply(msg({ type: 'presence', resourceType: 'INVESTIGATION', resourceId: 'inv1', presence: { userId: 'u2', displayName: 'B', resourceType: 'INVESTIGATION', resourceId: 'inv1', status: 'ACTIVE', lastSeenAt: 'x' } }));
    expect(useRealtimeStore.getState().presence['INVESTIGATION:inv1']).toHaveLength(2);
  });

  it('marks a user offline when presence leaves', () => {
    const store = useRealtimeStore.getState();
    store.apply(msg({ type: 'presence', resourceType: 'INVESTIGATION', resourceId: 'inv1', presence: { userId: 'u1', displayName: 'A', resourceType: 'INVESTIGATION', resourceId: 'inv1', status: 'ACTIVE', lastSeenAt: 'x' } }));
    store.apply(msg({ type: 'presence', resourceType: 'INVESTIGATION', resourceId: 'inv1', presence: { userId: 'u1', displayName: 'A', resourceType: 'INVESTIGATION', resourceId: 'inv1', status: 'OFFLINE', lastSeenAt: 'x' } }));
    expect(useRealtimeStore.getState().presence['INVESTIGATION:inv1']).toHaveLength(0);
  });

  it('increments unread count on notification events', () => {
    const store = useRealtimeStore.getState();
    store.apply(msg({ type: 'notification' }));
    expect(useRealtimeStore.getState().unreadCount).toBe(1);
  });

  it('keeps a bounded activity buffer', () => {
    const store = useRealtimeStore.getState();
    for (let i = 0; i < 150; i += 1) {
      store.apply(msg({ type: 'activity', id: i }));
    }
    expect(useRealtimeStore.getState().activity.length).toBeLessThanOrEqual(100);
  });

  it('records report deltas keyed by report id', () => {
    const store = useRealtimeStore.getState();
    store.apply(msg({ type: 'report', report: { reportId: 'r1', version: 2, op: 'upsert' } }));
    expect(useRealtimeStore.getState().reportDeltas.r1.report?.version).toBe(2);
  });

  it('updates connection state truthfully', () => {
    useRealtimeStore.getState().setConnectionState('reconnecting');
    expect(useRealtimeStore.getState().connectionState).toBe('reconnecting');
  });
});
