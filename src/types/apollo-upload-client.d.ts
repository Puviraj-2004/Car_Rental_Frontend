declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client/core';
  
  interface UploadLinkOptions {
    uri?: string;
    useGETForQueries?: boolean;
    isExtractableFile?: (value: any) => boolean;
    FormData?: any;
    formDataAppendFile?: (form: FormData, i: number, file: any) => void;
    fetch?: any;
    fetchOptions?: any;
    credentials?: RequestCredentials;
    headers?: any;
    includeExtensions?: boolean;
  }

  export function createUploadLink(options?: UploadLinkOptions): ApolloLink;
}