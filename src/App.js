import React, { useState } from 'react';
import { ApolloProvider, Mutation, Query } from 'react-apollo';
import client from './client';
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql';

const StarButton = ({ node }) => {
  const totalCount = node.stargazers.totalCount;
  const viewerHasStarred = node.viewerHasStarred;
  const starCount = totalCount === 1 ? '1 star' : `${totalCount} stars`;

  const StarStatus = ({ addOrRemoveStar }) => {
    return (
      <button
        onClick={() =>
          addOrRemoveStar({
            variables: { input: { starrableId: node.id } },
          })
        }
      >
        {starCount} | {viewerHasStarred ? 'starred' : '-'}
      </button>
    );
  };

  return (
    <Mutation mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}>
      {(addOrRemoveStar) => <StarStatus addOrRemoveStar={addOrRemoveStar} />}
    </Mutation>
  );
};

const PER_PAGE = 5;
const DEFAULT_STATE = {
  first: PER_PAGE,
  after: null,
  last: null,
  before: null,
  query: 'フロントエンドエンジニア',
};

const App = () => {
  const [variable, setVariable] = useState(DEFAULT_STATE);
  const { query, first, last, before, after } = variable;

  const handleChange = (e) => {
    setVariable({
      ...variable,
      query: e.target.value,
    });
  };

  const goPrevious = (search) => {
    setVariable({
      ...variable,
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor,
    });
  };

  const goNext = (search) => {
    setVariable({
      ...variable,
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null,
    });
  };

  console.log({ query });

  return (
    <ApolloProvider client={client}>
      <form>
        <input value={query} onChange={handleChange} />
      </form>
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {({ loading, error, data }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;

          const search = data.search;
          const repositoryCount = search.repositoryCount;
          const repositoryUnit =
            repositoryCount === 1 ? 'Repository' : 'Repositories';
          const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`;

          return (
            <React.Fragment>
              <h2>{title}</h2>
              <ul>
                {search.edges.map((edge) => {
                  const node = edge.node;

                  return (
                    <li key={node.id}>
                      <a
                        href={node.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {node.name}
                      </a>
                      &nbsp;
                      <StarButton node={node} />
                    </li>
                  );
                })}
              </ul>

              {search.pageInfo.hasPreviousPage === true ? (
                <button onClick={() => goPrevious(search)}>Previous</button>
              ) : null}

              {search.pageInfo.hasNextPage === true ? (
                <button onClick={() => goNext(search)}>Next</button>
              ) : null}
            </React.Fragment>
          );
        }}
      </Query>
    </ApolloProvider>
  );
};

export default App;
