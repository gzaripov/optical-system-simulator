import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import set from 'lodash/fp/set';
import SliderInput from 'ui/SliderInput';
import Prism from '../Scene/Graphics/core/Prism';

const Label = styled.p`
  text-align: left;
  margin-top: 16px;
  margin-bottom: 0;
`;

class AddPrismModal extends Component {
  static propTypes = {
    opened: PropTypes.bool,
    onClose: PropTypes.func,
    onOk: PropTypes.func,
  };

  static defaultProps = {
    opened: false,
    onClose: () => {},
    onOk: () => {},
  };

  state = {
    radius: 0.5,
  };

  onNumericalChange = type => (e) => {
    this.setState(set(type, e, this.state));
  };

  onOk = () => {
    this.props.onOk(new Prism({ ...this.state, pos: [0, 0] }));
  };

  render() {
    const { opened, onClose } = this.props;
    const { radius } = this.state;
    return (
      <Modal
        title="Add prism"
        visible={opened}
        onOk={this.onOk}
        onCancel={onClose}
        okText="Add"
        width={600}
        maskClosable={false}
      >
        <Label>Radius:</Label>
        <SliderInput
          min={0.05}
          max={1}
          value={radius}
          step={0.001}
          onChange={this.onNumericalChange('radius')}
        />
      </Modal>
    );
  }
}

const mapState = ({ modals }) => ({
  opened: modals.addPrism,
});

const mapDispatch = ({ modals, scene }) => ({
  onClose: () => modals.hideModal('addPrism'),
  onOk: scene.addPrism,
});

export default connect(
  mapState,
  mapDispatch,
)(AddPrismModal);
