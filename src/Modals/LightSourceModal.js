import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Radio } from 'antd';
import set from 'lodash/fp/set';
import SliderInput from 'ui/SliderInput';
import LightSource from '../Scene/Graphics/core/LightSource';

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

function radiansToDegrees(rad) {
  return rad * 180 / Math.PI;
}

function degreesToRadians(deg) {
  return deg / 180 * Math.PI;
}

class LightSourceModal extends Component {
  static propTypes = {
    opened: PropTypes.bool,
    onClose: PropTypes.func,
    updateLightSource: PropTypes.func,
    spreadType: PropTypes.number.isRequired,
    emitterPower: PropTypes.number.isRequired,
    spatialSpread: PropTypes.number.isRequired,
    angularSpread: PropTypes.number.isRequired,
  };

  static defaultProps = {
    opened: false,
    onClose: () => {},
    updateLightSource: () => {},
  };

  state = {
    spreadType: this.props.spreadType,
    emitterPower: this.props.emitterPower,
    spatialSpread: this.props.spatialSpread,
    angularSpreadDegrees: radiansToDegrees(this.props.angularSpread),
    spatialSpreadSliderEnabled: true,
    angularSpreadSliderEnabled: true,
  };

  componentWillMount() {
    this.checkType();
  }

  onLightSourceTypeChange = (e) => {
    const { value } = e.target;
    this.setState({ spreadType: value }, () => this.checkType());
  };

  onNumericalChange = type => (e) => {
    this.setState(set(type, e, this.state));
  };

  checkType() {
    switch (this.state.spreadType) {
      case LightSource.SPREAD.POINT:
        this.setState({
          emitterPower: 0.1,
          spatialSpread: 0.0,
          angularSpreadDegrees: radiansToDegrees(Math.PI * 2.0),
          spatialSpreadSliderEnabled: true,
          angularSpreadSliderEnabled: false,
        });
        break;
      case LightSource.SPREAD.CONE:
        this.setState({
          emitterPower: 0.03,
          spatialSpread: 0.0,
          angularSpreadDegrees: radiansToDegrees(Math.PI * 0.3),
          spatialSpreadSliderEnabled: true,
          angularSpreadSliderEnabled: true,
        });
        break;
      case LightSource.SPREAD.BEAM:
        this.setState({
          emitterPower: 0.03,
          spatialSpread: 0.4,
          angularSpreadDegrees: 0.0,
          spatialSpreadSliderEnabled: true,
          angularSpreadSliderEnabled: true,
        });
        break;
      case LightSource.SPREAD.LASER:
        this.setState({
          emitterPower: 0.05,
          spatialSpread: 0.0,
          angularSpreadDegrees: 0.0,
          spatialSpreadSliderEnabled: false,
          angularSpreadSliderEnabled: false,
        });
        break;
      case LightSource.SPREAD.AREA:
        this.setState({
          emitterPower: 0.1,
          spatialSpread: 0.4,
          angularSpreadDegrees: radiansToDegrees(Math.PI),
          spatialSpreadSliderEnabled: true,
          angularSpreadSliderEnabled: false,
        });
        break;
      default:
        throw new Error(`Unknwown Spread type: ${this.state.spreadType}`);
    }
  }

  updateLightSource = () => {
    const { updateLightSource, onClose } = this.props;
    updateLightSource({
      ...this.state,
      angularSpread: degreesToRadians(this.state.angularSpreadDegrees),
    });
    onClose();
  };

  render() {
    const { opened, onClose } = this.props;
    const {
      spreadType,
      emitterPower,
      spatialSpread,
      angularSpreadDegrees,
      spatialSpreadSliderEnabled,
      angularSpreadSliderEnabled,
    } = this.state;
    return (
      <Modal
        title="Select light source"
        visible={opened}
        onOk={this.updateLightSource}
        onCancel={onClose}
        okText="Select"
        width={600}
        maskClosable={false}
      >
        <LensType>Spread type:</LensType>
        <RadioGroup onChange={this.onLightSourceTypeChange} value={spreadType}>
          <RadioButton value={LightSource.SPREAD.POINT}>Point</RadioButton>
          <RadioButton value={LightSource.SPREAD.CONE}>Cone</RadioButton>
          <RadioButton value={LightSource.SPREAD.BEAM}>Beam</RadioButton>
          <RadioButton value={LightSource.SPREAD.LASER}>Laser</RadioButton>
          <RadioButton value={LightSource.SPREAD.AREA}>Area</RadioButton>
        </RadioGroup>
        <Label>Emitter Power:</Label>
        <SliderInput
          min={0.01}
          max={0.3}
          value={emitterPower}
          step={0.001}
          onChange={this.onNumericalChange('emitterPower')}
        />
        <Label>Spatial Spread:</Label>
        <SliderInput
          min={0.0}
          max={2}
          value={spatialSpread}
          step={0.001}
          disabled={!spatialSpreadSliderEnabled}
          onChange={this.onNumericalChange('spatialSpread')}
        />
        <Label>Angular Spread:</Label>
        <SliderInput
          min={0}
          max={360}
          value={angularSpreadDegrees}
          step={0.001}
          disabled={!angularSpreadSliderEnabled}
          onChange={this.onNumericalChange('angularSpreadDegrees')}
        />
      </Modal>
    );
  }
}

const mapState = ({
  modals: { lightSource },
  scene: {
    lightSource: {
      spreadType, emitterPower, spatialSpread, angularSpread,
    },
  },
}) => ({
  opened: lightSource,
  spreadType,
  emitterPower,
  spatialSpread,
  angularSpread,
});

const mapDispatch = ({ modals, scene: { updateLightSource } }) => ({
  onClose: () => modals.hideModal('lightSource'),
  updateLightSource,
});

export default connect(mapState, mapDispatch)(LightSourceModal);
