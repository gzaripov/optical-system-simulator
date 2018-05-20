import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Radio } from 'antd';
import set from 'lodash/fp/set';
import SliderInput from 'ui/SliderInput';
import Lens from '../Scene/Graphics/core/Lens';

const RadioButton = Radio.Button;
const RadioGroup = styled(Radio.Group)`
  &.ant-radio-group {
    display: flex;
  }
`;

const Label = styled.p`
  text-align: left;
  margin-top: 16px;
  margin-bottom: 0;
`;

const LensType = Label.extend`
  margin-top: 0;
  margin-bottom: 16px;
`;

class AddLensModal extends Component {
  propTypes = {
    opened: PropTypes.bool,
    onClose: PropTypes.func,
    addLens: PropTypes.func,
  };

  defaultProps = {
    opened: false,
    onClose: () => {},
    addLens: () => {},
  };

  state = {
    type: Lens.TYPE.BICONVEX,
    width: 0.15,
    height: 0.375,
    leftRadius: 0.75,
    rightRadius: 0.75,
  };

  onLensTypeChange = (e) => {
    const { value } = e.target;
    this.setState({ type: value });
  };

  onNumericalChange = type => (e) => {
    this.setState(set(type, e, this.state));
  };

  addLens = () => {
    this.props.addLens(new Lens({ ...this.state, pos: [0, 0] }));
  };

  render() {
    const { opened, onClose } = this.props;
    const {
      type, width, height, leftRadius, rightRadius,
    } = this.state;
    const isLensPlane = type === Lens.TYPE.PLANOCONVEX || type === Lens.TYPE.PLANOCONCAVE;
    return (
      <Modal
        title="Add lens"
        visible={opened}
        onOk={this.addLens}
        onCancel={onClose}
        okText="Add"
        width={600}
      >
        <LensType>Lens type:</LensType>
        <RadioGroup onChange={this.onLensTypeChange} value={type}>
          <RadioButton value={Lens.TYPE.BICONVEX}>Biconvex</RadioButton>
          <RadioButton value={Lens.TYPE.PLANOCONVEX}>Planoconvex</RadioButton>
          <RadioButton value={Lens.TYPE.MENISCUS}>Meniscus</RadioButton>
          <RadioButton value={Lens.TYPE.PLANOCONCAVE}>Planoconcave</RadioButton>
          <RadioButton value={Lens.TYPE.BICONCAVE}>Biconcave</RadioButton>
        </RadioGroup>
        <Label>Width:</Label>
        <SliderInput
          min={0.05}
          max={0.5}
          value={width}
          step={0.001}
          onChange={this.onNumericalChange('width')}
        />
        <Label>Height:</Label>
        <SliderInput
          min={0.05}
          max={0.5}
          value={height}
          step={0.001}
          onChange={this.onNumericalChange('height')}
        />
        <Label>{isLensPlane ? 'Radius:' : 'Left Radius:'}</Label>
        <SliderInput
          min={0.1}
          max={2}
          value={leftRadius}
          step={0.01}
          onChange={this.onNumericalChange('leftRadius')}
        />
        {!isLensPlane && <Label>Right Radius:</Label>}
        {!isLensPlane && (
          <SliderInput
            min={0.1}
            max={2}
            value={rightRadius}
            step={0.01}
            onChange={this.onNumericalChange('rightRadius')}
          />
        )}
      </Modal>
    );
  }
}

const mapState = ({ modals, scene }) => ({
  opened: modals.addLens,
  sd: console.log(scene.lenses),
});

const mapDispatch = ({ modals, scene }) => ({
  onClose: () => modals.hideModal('addLens'),
  addLens: scene.addLens,
});

export default connect(mapState, mapDispatch)(AddLensModal);
