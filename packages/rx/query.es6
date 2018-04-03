import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs/Observable';
import { methods } from './provider';

const queryMethods = [...methods, 'where', 'lte', 'gte'];

const queryObj = {};
queryMethods.forEach(key => {
  queryObj[key] = () => queryObj;
});

const query = (query, project) => {
  if (typeof query !== 'object') {
    query = {
      docs: query
    };
  }
  project = project || (x => x);

  const keys = Object.keys(query);

  const usedCollections = [];
  keys.forEach(key =>
    query[key](name => {
      usedCollections.push(name);
      return queryObj;
    }, {})
  );

  class RxConnect extends Component {
    static contextTypes = {
      collection: PropTypes.func
    };

    constructor(props, context) {
      super(props, context);
      this.state = {};
      this.start(props);
    }

    componentWillReceiveProps(newProps) {
      this.start(newProps);
    }

    start = async props => {
      const { collection } = this.context;
      if (this.sub) {
        this.sub.unsubscribe();
      }

      await Promise.all(usedCollections.map(key => collection(key)));
      const all = keys.map(key => query[key](collection, props));
      const args = all.map(value => {
        let observable = value && value.$ ? value.$ : value;
        if (props.json) {
          observable = observable.map(x => JSON.parse(JSON.stringify(x)));
        }
        return observable;
      });

      if (args.filter(x => !x).length > 0) {
        return setTimeout(() => this.start(props), 100);
      }
      const comb = Observable.combineLatest(...args.filter(x => x));
      this.sub = comb.subscribe(newArgs => {
        const newProps = {};
        newArgs.map((x, i) => {
          newProps[keys[i]] = x || undefined;
        });
        const result = project(newProps);
        this.setState(result);
      });
    };

    render() {
      const { children, ...rest } = this.props;
      return children({ ...rest, ...this.state });
    }
  }
  return RxConnect;
};

query.enhance = (...args) => Wrapped => {
  const Query = query(...args);
  return props => <Query>{p => <Wrapped {...props} {...p} />}</Query>;
};

export const { enhance } = query.enhance;
export default query;
