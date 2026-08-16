import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null, loading: true }) }));

describe('ProtectedRoute', () => {
  it('shows the loading state while auth is resolving', () => {
    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
