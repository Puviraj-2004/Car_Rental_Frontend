import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';
import { getCookie } from 'cookies-next';
import { getSession } from 'next-auth/react';

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path, extensions }) => {
      console.log(`[GraphQL error]: Message: ${message}, Path: ${path}, Extensions:`, extensions);
      
      // Log authentication errors specifically
            if (
        extensions?.code === 'UNAUTHENTICATED' ||
        (extensions?.http as { status?: number })?.status === 401
      ) {
        console.error('Authentication failed for operation:', operation.operationName);
      }
    });
  }
  
  if (networkError) {
    console.error('[Network error]:', networkError);
  }
});

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
  headers: { 
    "Apollo-Require-Preflight": "true" 
  },
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  // The type for session is augmented in `types/next-auth.d.ts`
  const accessToken = session?.accessToken;

  console.log('Auth token check (Final Attempt):', accessToken ? 'Token found' : 'No token found');

  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
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