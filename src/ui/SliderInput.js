import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Row, Col } from 'antd';

const SliderStyled = styled(Slider)`
  &.ant-slider {
    margin: 10px 0 10px;
  }
`;

const DecimalStep = ({
  min, max, value, step, onChange, disabled,
}) => (
  <Row>
    <Col span={18}>
      <SliderStyled
        min={min}
        max={max}
        onChange={onChange}
        value={value}
        step={step}
        disabled={disabled}
      />
    </Col>
    <Col span={4}>
      <InputNumber
        min={min}
        max={max}
        style={{ marginLeft: 16 }}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </Col>
  </Row>
);

DecimalStep.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  step: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

DecimalStep.defaultProps = {
  step: 0.1,
  onChange: () => {},
  disabled: false,
};

export default DecimalStep;
