import gql from 'graphql-tag';

export const ME = gql`
  query me {
    user(login: "suzuki0430") {
      name
      avatarUrl
    }
  }
`;
