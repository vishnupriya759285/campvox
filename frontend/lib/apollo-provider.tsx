'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo-client';

export function ApolloAppProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
