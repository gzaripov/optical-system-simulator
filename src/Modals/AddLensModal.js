import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-responsive-modal';

const AddLensModal = ({ opened, onClose }) => (
  <Modal open={opened} onClose={onClose} center>
    <h2>Simple centered modal</h2>
  </Modal>
);

AddLensModal.propTypes = {
  opened: PropTypes.bool,
  onClose: PropTypes.func,
};

AddLensModal.defaultProps = {
  opened: false,
  onClose: () => {},
};

const mapState = ({ modals }) => ({
  opened: modals.addLens,
  sd: console.log(modals.addLens),
});

const mapDispatch = ({ modals }) => ({
  onClose: () => modals.hideModal('addLens'),
});

export default connect(mapState, mapDispatch)(AddLensModal);
