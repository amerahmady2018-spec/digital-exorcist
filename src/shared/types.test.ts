import { describe, it, expect } from 'vitest';
import { MonsterType, ActionType, IPC_CHANNELS } from './types';

describe('Shared Types', () => {
  it('should have correct MonsterType enum values', () => {
    expect(MonsterType.Ghost).toBe('ghost');
    expect(MonsterType.Demon).toBe('demon');
    expect(MonsterType.Zombie).toBe('zombie');
  });

  it('should have correct ActionType enum values', () => {
    expect(ActionType.Banish).toBe('banish');
    expect(ActionType.Resurrect).toBe('resurrect');
    expect(ActionType.Restore).toBe('restore');
  });

  it('should have IPC channel constants defined', () => {
    expect(IPC_CHANNELS.SELECT_DIRECTORY).toBe('select-directory');
    expect(IPC_CHANNELS.START_SCAN).toBe('start-scan');
    expect(IPC_CHANNELS.BANISH_FILE).toBe('banish-file');
  });
});
