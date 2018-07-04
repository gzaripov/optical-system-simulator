import { Col, InputNumber, Row, Slider } from "antd";
import * as React from "react";
import styled from "styled-components";

const SliderStyled = styled(Slider)`
  &.ant-slider {
    margin: 10px 0 10px;
  }
`;

interface Props {
  min: number;
  max: number;
  value: number;
  step: number;
  onChange: () => void;
  disabled: boolean;
}

const DecimalStep: React.SFC<Props> = ({
  min,
  max,
  value,
  step,
  onChange,
  disabled
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

DecimalStep.defaultProps = {
  disabled: false,
  onChange: () => void 0,
  step: 0.1
};

export default DecimalStep;
