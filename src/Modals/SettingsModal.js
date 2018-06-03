import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import set from 'lodash/fp/set';
import SliderInput from 'ui/SliderInput';

const Label = styled.p`
  text-align: left;
  margin-top: 16px;
  margin-bottom: 0;
`;

class SettingsModal extends Component {
  static propTypes = {
    opened: PropTypes.bool,
    onClose: PropTypes.func,
    updateSettings: PropTypes.func.isRequired,
  };

  static defaultProps = {
    opened: false,
    onClose: () => {},
  };

  state = {
    maxPathLength: 12,
    maxSampleCount: 100000,
    scale: 1,
  };

  onNumericalChange = type => (e) => {
    this.setState(set(type, e, this.state));
  };

  saveSettings = () => {
    const { updateSettings, onClose } = this.props;
    updateSettings(this.state);
    onClose();
  };

  render() {
    const { opened, onClose } = this.props;
    const { maxPathLength, maxSampleCount, scale } = this.state;
    return (
      <Modal
        title="Settings"
        visible={opened}
        onOk={this.saveSettings}
        onCancel={onClose}
        okText="Save"
        width={600}
      >
        <Label>Light Path Length</Label>
        <SliderInput
          min={0}
          max={19}
          value={maxPathLength}
          step={1}
          onChange={this.onNumericalChange('maxPathLength')}
        />
        <Label>Sample Count</Label>
        <SliderInput
          min={10000}
          max={10000000}
          value={maxSampleCount}
          step={10}
          onChange={this.onNumericalChange('maxSampleCount')}
        />
        <Label>Image quality</Label>
        <SliderInput
          min={0.4}
          max={4}
          value={scale}
          step={0.01}
          onChange={this.onNumericalChange('scale')}
        />
      </Modal>
    );
  }
}

const mapState = ({ modals }) => ({
  opened: modals.settings,
});

const mapDispatch = ({ modals, scene }) => ({
  onClose: () => modals.hideModal('settings'),
  updateSettings: scene.updateSettings,
});

export default connect(mapState, mapDispatch)(SettingsModal);
