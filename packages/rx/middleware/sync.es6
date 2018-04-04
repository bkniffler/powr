import PouchDB from 'pouchdb-core';

const url = process.env.COUCH_URL;
export default {
  per: 'collection',
  execute: (collection, options = {}, { accessToken } = {}) => {
    if (options.pull || options.push) {
      const syncName = (options.syncTo || collection.name).split('/').join('-');
      const remote = new PouchDB(`${url}/${syncName}`, {
        // skip_setup: true,
        ajax: {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`
              }
            : {}
        }
      });
      collection.sync({
        remote,
        waitForLeadership: true,
        direction: {
          pull: options.pull,
          push: options.push
        },
        options: {
          live: options.live,
          retry: options.retry
        }
      });
    }
  }
};
