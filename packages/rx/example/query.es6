import React from 'react';
import Provider from '../provider';
import query from '../query';

const collections = {
  insurance: {
    options: {
      via: null,
      time: false,
      notify: true,
      live: false,
      retry: true,
      pull: true,
      push: false
    },
    schema: {
      disableKeyCompression: true,
      version: 0,
      type: 'object',
      properties: {
        name: { type: 'string' },
        ref: { type: 'string' },
        type: { type: 'string' }
      }
    }
  }
};

const DefaultQuery = query({
  insurances: q => q('insurance').find()
});

const ShortQuery = query(q => q('insurance').find());

const ProjectedQuery = query(
  {
    insurances: q => q('insurance').find()
  },
  ({ insurances = [] }) => ({
    data: insurances
  })
);

const EnhancedQuery = query.enhance(
  {
    insurances: q => q('insurance').find()
  },
  ({ insurances = [] }) => ({
    data: insurances
  })
)(({ data }) => <span>{data.length}</span>);

export default () => (
  <Provider
    collections={collections}
    accessToken={null}
    userId={null}
    tenant={null}
  >
    <ShortQuery>
      {({ docs = [] }) =>
        docs.map(item => <span key={item._id}>{item.name}</span>)
      }
    </ShortQuery>
    <ProjectedQuery>
      {({ insurances = [] }) =>
        insurances.map(item => <span key={item._id}>{item.name}</span>)
      }
    </ProjectedQuery>
    <EnhancedQuery />
  </Provider>
);
