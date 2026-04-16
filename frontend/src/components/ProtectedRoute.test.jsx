import { describe, it, expect } from 'vitest';

describe('ProtectedRoute', () => {
  it('should export ProtectedRoute component', async () => {
    const mod = await import('./ProtectedRoute');
    expect(mod.ProtectedRoute).toBeDefined();
    expect(typeof mod.ProtectedRoute).toBe('function');
  });

  it('should export RoleRoute component', async () => {
    const mod = await import('./ProtectedRoute');
    expect(mod.RoleRoute).toBeDefined();
    expect(typeof mod.RoleRoute).toBe('function');
  });
});
