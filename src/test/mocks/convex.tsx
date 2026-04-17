import { vi } from 'vitest';
import { ConvexProvider } from 'convex/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock del cliente Convex
export const mockConvexClient = {
  query: vi.fn(),
  mutation: vi.fn(),
  action: vi.fn(),
};

// Mock del QueryClient
export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

// Wrapper para componentes que usan Convex
export function createConvexWrapper(client: any = mockConvexClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = createMockQueryClient();
    return (
      <QueryClientProvider client={queryClient}>
        <ConvexProvider client={client}>
          {children}
        </ConvexProvider>
      </QueryClientProvider>
    );
  };
}
