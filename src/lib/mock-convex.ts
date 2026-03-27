// Mock Convex client for static generation
class MockConvexReactClient {
  constructor() {
    // Mock client for static generation
  }
  
  watchQuery() {
    return {
      unsubscribe: () => {},
      localQueryResult: () => null,
      update: () => {},
      journal: () => []
    };
  }
  
  mutation() {
    return Promise.resolve({});
  }
  
  action() {
    return Promise.resolve({});
  }
  
  getConnectionState() {
    return { hasInflightRequests: false };
  }
  
  close() {
    // Mock close method
  }
  
  setAuth() {
    // Mock auth method
  }
}

// Mock query function
const mockQuery = () => null;

// Mock mutation function  
const mockMutation = () => ({
  Promise: Promise,
  then: (resolve: any) => resolve({}),
  catch: (reject: any) => Promise.reject()
});

// Mock context value
export const mockConvexContext = {
  query: mockQuery,
  mutation: mockMutation,
  action: mockMutation,
  subscription: () => ({ unsubscribe: () => {} }),
};

export const getConvexClient = () => {
  if (typeof window === 'undefined') {
    // During SSR/static generation, return mock client
    return new MockConvexReactClient() as any;
  }
  
  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    const { ConvexReactClient } = require("convex/react");
    return new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  }
  
  return null;
};
