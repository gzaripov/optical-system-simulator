import styled from "styled-components";
import { Progress } from "antd";

const RaysTracedProgress = styled(Progress)`
  .ant-progress-outer {
    display: flex;
  }

  .ant-progress-bg {
    background-color: rgba(24, 144, 255, 0.5);
  }

  &.ant-progress-status-success .ant-progress-bg {
    background-color: rgba(0, 0, 0, 0);
  }

  .ant-progress-inner {
    background-color: rgba(0, 0, 0, 0);
  }
`;

export default RaysTracedProgress;
