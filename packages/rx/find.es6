import React, { Component, Fragment, createElement } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual } from 'recompose';

const arr = [];
export default class Find extends Component {
  static contextTypes = {
    collection: PropTypes.func
  };
  state = {};
  subs = [];
  async componentDidMount(props = this.props) {
    const { collection } = this.context;
    const col = await collection(props.type);
    let res = col.find();
    if (res.$) {
      res = res.$;
    }
    const sub = res.subscribe(data => {
      if (!data) {
        return this.setState({ data, isLoaded: true });
      }
      if (props.json) {
        this.setState({
          data: Array.isArray(data)
            ? data.map(x => ({ ...x._data, _type: x?.collection?.name }))
            : { ...data._data, _type: data?.collection?.name },
          isLoaded: true
        });
      } else {
        this.setState({ data, isLoaded: true });
      }
    });
    this.subs.push(sub);
  }
  componentWillReceiveProps(newProps) {
    const reactTo = newProps.reactTo;
    if (
      this.props.collection !== newProps.collection ||
      this.props.type !== newProps.type ||
      !shallowEqual(newProps, this.props)
    ) {
      this.componentDidMount(newProps);
    }
  }
  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
  render() {
    const { children, map } = this.props;

    if (!children) {
      return null;
    }

    let childs = null;
    if (map) {
      childs = (this.state.data || []).map(item =>
        children(item || arr, this.context.rx)
      );
    } else {
      childs = children(this.state.data || arr, this.context.rx);
    }
    return <Fragment>{childs || null}</Fragment>;
  }
}

export const find = (type, reactTo, as = 'docs') => Wrapped => props => (
  <Find {...props} type={type} reactTo={reactTo}>
    {docs => createElement(Wrapped, { ...props, [as]: docs })}
  </Find>
);
