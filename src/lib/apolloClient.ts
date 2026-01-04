import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';
import { getCookie } from 'cookies-next';
import { getSession } from 'next-auth/react';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (process.env.NODE_ENV === 'development') {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, path }) => {
        console.error('❌ GraphQL Error:', message, 'at', path);
      });
    }
    if (networkError) {
      console.error('❌ Network Error:', networkError);
    }
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
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Apollo Auth - Error getting session:', error);
    }
  }

  if (!token) {
    token = getCookie('token');
  }

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