// https://wiki.apache.org/couchdb/Replication#Filtered_Replication
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import RxDB, { QueryChangeDetector } from 'rxdb';
import { message, time, sync } from './middleware';

QueryChangeDetector.enable();

RxDB.plugin(require('pouchdb-adapter-http'));

let p;
let adapter = null;
if (process.env.IS_ELECTRON) {
  const { remote } = require('electron');
  p = remote.app.getPath('userData');
  RxDB.plugin(require('pouchdb-adapter-node-websql'));
  adapter = 'websql';
} else {
  RxDB.plugin(require('pouchdb-adapter-idb'));
  adapter = 'idb';
}

export default class DB extends Component {
  static childContextTypes = {
    collection: PropTypes.func
  };
  db = null;
  proxies = {};

  constructor(props, context) {
    super(props, context);
    this.initializeDB(props);
  }

  getChildContext() {
    return {
      collection: this.collection
    };
  }

  componentWillUnmount() {
    // this.destroyAll();
  }

  initializeDB = (props = this.props) => {
    const { dbName = 'data' } = props;
    this.db = RxDB.create({
      name: p ? `${p}/${dbName}.db` : dbName,
      // iOSSafari ? 'websql' : 'idb',
      adapter,
      multiInstance: true,
      ignoreDuplicate: true
      /* pouchSettings: {
        foo: 'bar'
      } */
    });
  };

  applyMiddleware = (schema, collection, args) => {
    message.execute(collection, schema.options, args);
    time.execute(collection, schema.options, args);
    sync.execute(collection, schema.options, args);
    return Promise.resolve();
  };

  getKey = (name, schema, props = this.props) => {
    if (schema.options.per && schema.options.per === 'user') {
      if (!props.user) {
        throw new Error('No User');
      }
      if (!props.accessToken) {
        throw new Error('No AccessToken');
      }
      return `user/${props.user}/${name}`;
    } else if (schema.options.per && schema.options.per === 'tenant') {
      if (!props.tenant) {
        throw new Error('No Tenant');
      }
      if (!props.accessToken) {
        throw new Error('No AccessToken');
      }
      return `${props.tenant}/${name}`;
    }
    return name;
  };

  collection = (name, props = {}) => {
    const { collections, accessToken } = this.props;
    const args = {
      ...this.props,
      ...props
    };
    if (!collections[name]) {
      throw new Error(`Collection not found: ${name}`);
    }

    const key = this.getKey(name, collections[name], args);

    if (!this.proxies[key]) {
      const schema = { ...collections[name], name: key };
      let db;
      this.proxies[key] = Promise.resolve(this.db)
        .then(x => {
          db = x;
          return db.collection(schema);
        })
        .then(collection => {
          this.proxies[key] = collection;
          this.applyMiddleware(schema, collection, { accessToken });
          return collection;
        });
    }
    return this.proxies[key];
  };

  destroyAll = () =>
    Promise.all(
      Object.keys(this.collections).map(key =>
        this.collections[key].destroy().then(() => delete this.databases[key])
      )
    );

  render() {
    const { children } = this.props;
    return <Fragment>{children}</Fragment>;
  }
}
