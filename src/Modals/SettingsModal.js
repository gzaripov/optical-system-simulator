import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import set from 'lodash/fp/set';

class SettingsModal extends Component {
  static propTypes = {
    opened: PropTypes.bool,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    opened: false,
    onClose: () => {},
  };

  render() {
    const { opened, onClose } = this.props;
    return (
      <Modal title="Settings" visible={opened} onCancel={onClose} okText="" width={600}>
        <div>dklfjgsdkljgkldfjklgjklsfdjs</div>
      </Modal>
    );
  }
}

const mapState = ({ modals }) => ({
  opened: modals.settings,
});

const mapDispatch = ({ modals, scene }) => ({
  onClose: () => modals.hideModal('settings'),
  setti: scene.loadScene,
});

export default connect(mapState, mapDispatch)(SettingsModal);
