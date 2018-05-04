import React, { Component } from "react";
import styled from "styled-components";
import { Progress } from "antd";
import Graphics from "./Graphics";

const ProgressLevel = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.5);
  margin: 6px 10px;
  text-align: right;
  font-size: small;
`;

const SceneStyled = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`;

const RayTracedProgress = styled(Progress)`
  .ant-progress-outer {
    display: flex;
  }
`;

class Scene extends Component {
  state = {
    width: 0,
    height: 0,
    raysTraced: 0,
    maxRayCount: 1
  };

  componentWillMount() {
    const width = window.innerWidth;
    const height = Math.floor(width / 16 * 9);
    this.setState({ width, height });
  }

  onProgressChanged = (raysTraced, maxRayCount) => {
    this.setState({ raysTraced, maxRayCount });
  };

  render() {
    const { width, height, raysTraced, maxRayCount } = this.state;
    const progress = raysTraced / maxRayCount * 100;
    const percent = Math.round(progress);
    return (
      <SceneStyled>
        <Graphics
          width={width}
          height={height}
          onProgressChanged={this.onProgressChanged}
        />
        <Info>
          <ProgressLevel>
            <span>
              {raysTraced}/{maxRayCount} rays traced
            </span>
            <span>Progress: {percent}%</span>
          </ProgressLevel>
          <RayTracedProgress
            percent={progress}
            showInfo={false}
            strokeWidth={2}
          />
        </Info>
      </SceneStyled>
    );
  }
}

export default Scene;
