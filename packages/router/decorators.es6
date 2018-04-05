import React from 'react';
import { connect } from 'react-redux';
import { compose, withPropsOnChange } from 'recompose';
import { format } from 'date-fns';
import { upperFirst } from 'lodash';
import {
  createPush,
  createReplace,
  createPushPathname,
  createUpdateQuery,
  createReplaceQuery
} from './redux';

export const withRouterActions = connect(null, dispatch => ({
  push: createPush(dispatch),
  replace: createReplace(dispatch),
  pushPathname: createPushPathname(dispatch),
  updateQuery: createUpdateQuery(dispatch),
  replaceQuery: createReplaceQuery(dispatch)
}));

export const withPush = connect(null, dispatch => ({
  push: createPush(dispatch)
}));

export const withReplace = connect(null, dispatch => ({
  replace: createPush(dispatch)
}));

export const withPushPathname = connect(null, dispatch => ({
  pushPathname: createPushPathname(dispatch)
}));

export const withQueryActions = connect(null, dispatch => ({
  updateQuery: createUpdateQuery(dispatch),
  replaceQuery: createReplaceQuery(dispatch)
}));

export const withUpdateQuery = connect(null, dispatch => ({
  updateQuery: createUpdateQuery(dispatch)
}));

export const withReplaceQuery = connect(null, dispatch => ({
  replaceQuery: createReplaceQuery(dispatch)
}));

export const withPathname = connect(({ location }) => ({
  pathname: location.pathname
}));

export const withQuery = connect(({ location }) => ({
  query: location.query
}));

export const withLocation = connect(({ location }) => ({
  location
}));

export const withQueryParam = key =>
  connect(({ location }) => ({
    [key]: location.query[key]
  }));

export const withQueryParams = arrayOfParams =>
  connect(({ location }) => ({
    ...arrayOfParams.reduce(
      (state, key) => ({ ...state, [key]: location.query[key] }),
      {}
    )
  }));

export const withRouter = WrappedComponent => {
  const inner = (props, context) => {
    const { pathname, query, search, url, push, replace, ...rest } = props;
    return (
      <WrappedComponent
        {...rest}
        location={{ pathname, query, search, url }}
        router={{
          push,
          replace
        }}
        query={query}
        pathname={pathname}
      />
    );
  };
  return connect(
    ({ location }) => ({
      pathname: location.pathname,
      query: location.query,
      search: location.search,
      url: location.url
    }),
    dispatch => ({
      push: createPush(dispatch),
      replace: createReplace(dispatch)
    })
  )(inner);
};

const empty = [];
export const withQueryState = (
  key,
  { type, defaultValue, replace = false } = {}
) => {
  if (!type && defaultValue instanceof Date) {
    type = 'date';
  } else if (!type && defaultValue instanceof Number) {
    type = 'number';
  } else if (!type && Array.isArray(defaultValue)) {
    type = 'array';
  }
  const upper = upperFirst(key);
  const getValue = value => {
    if (type === 'date') {
      return { [key]: value ? format(value, 'YYYY-MM-DD') : undefined };
    } else if (type === 'array') {
      return { [key]: value ? value.join('!') : undefined };
    }
    return { [key]: value };
  };

  const method = replace ? createReplaceQuery : createUpdateQuery;
  const enhancers = [
    connect(
      ({ location }) => ({
        [key]: location.query[key]
      }),
      dispatch => ({
        [`update${upper}`]: value => method(dispatch)(getValue(value)),
        [`remove${upper}`]: () => method(dispatch)(getValue(undefined))
      })
    )
  ];
  if (type === 'date') {
    enhancers.push(
      withPropsOnChange([key], props => ({
        [key]: props[key] ? new Date(props[key]) : null
      }))
    );
  } else if (type === 'number') {
    enhancers.push(
      withPropsOnChange([key], props => ({
        [key]: props[key] ? parseInt(props[key]) : null
      }))
    );
  } else if (type === 'array') {
    enhancers.push(
      withPropsOnChange([key], props => ({
        [key]: props[key] ? props[key].split('!') : empty
      }))
    );
  }
  return compose(...enhancers);
};
