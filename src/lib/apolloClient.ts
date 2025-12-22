import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// பழைய .mjs வரியை நீக்கிவிட்டு இதை மட்டும் பயன்படுத்தவும்
// @ts-ignore
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Path: ${path}`)
    );
  }
});

// HttpLink-க்கு பதிலாக createUploadLink
const uploadLink = createUploadLink({
  uri: 'http://localhost:4000/graphql',
  headers: {
    "Apollo-Require-Preflight": "true",
  },
});

const client = new ApolloClient({
  link: from([errorLink, uploadLink]),
  cache: new InMemoryCache(),
});

export default client;