import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'; // core-க்கு பதில் @apollo/client பயன்படுத்தவும்
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

// 1. இங்கு நாம் உருவாக்கிய Link chain-ஐ சரியாக அமைக்கிறோம்
const link = from([
  errorLink,
  new HttpLink({ uri: 'http://localhost:4000/graphql' }),
]);

// 2. Client-ல் uri-க்கு பதிலாக நாம் மேலே உருவாக்கிய link-ஐ கொடுக்க வேண்டும்
const client = new ApolloClient({
  link: link, // <- மிக முக்கியமான மாற்றம் இதுதான்
  cache: new InMemoryCache(),
});

export default client;