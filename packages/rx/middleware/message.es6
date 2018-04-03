import { message } from 'antd';

export default {
  per: 'collection',
  execute: (collection, options) => {
    if (!options.notify) return;
    ['postSave', 'postInsert'].map(event =>
      collection[event](doc => {
        message.success('Änderung gespeichert');
        return doc;
      })
    );
  }
};
