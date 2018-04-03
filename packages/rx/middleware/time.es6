export default {
  per: 'collection',
  execute: (collection, options) => {
    if (!options.time) return;
    ['preSave', 'preInsert'].map(event =>
      collection[event](doc => {
        if (doc.start) {
          doc.start = +doc.start;
        }
        if (doc.end) {
          doc.end = +doc.end;
        }
        if (doc._data) {
          delete doc._data._type;
        } else {
          delete doc._type;
        }
        return doc;
      })
    );
  }
};
