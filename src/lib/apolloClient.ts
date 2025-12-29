import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';
import { getCookie } from 'cookies-next';
import { getSession } from 'next-auth/react';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Path: ${path}`)
    );
  }
});

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
  headers: { 
    "Apollo-Require-Preflight": "true" 
  },
});

const authLink = setContext(async (_, { headers }) => {
  let token = null;
  try {
    const session: any = await getSession();
    token = session?.accessToken;
    console.log('🔑 Apollo Auth - Session token:', token ? 'Found' : 'Not found');
  } catch (error) {
    console.error('❌ Apollo Auth - Error getting session:', error);
  }

  if (!token) {
    token = getCookie('token');
    console.log('🍪 Apollo Auth - Cookie token:', token ? 'Found' : 'Not found');
  }

  console.log('🔐 Apollo Auth - Final token for request:', token ? `Bearer ${token.substring(0, 20)}...` : 'None');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cars: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', 
      nextFetchPolicy: 'cache-first',  
    },
    query: {
      fetchPolicy: 'cache-first',
    },
  },
});

export default client;