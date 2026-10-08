'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
});

const authLink = setContext((_, { headers }) => {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('campvox_token') || sessionStorage.getItem('campvox_token') || localStorage.getItem('fixmycampus_token');
    if (token && token.split('.').length !== 3) {
      localStorage.removeItem('campvox_token');
      localStorage.removeItem('fixmycampus_token');
      token = null;
    }
  }
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});
