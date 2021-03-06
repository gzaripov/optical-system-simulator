import React, { Component } from 'react';
import styled from 'styled-components';
import Graphics from './Graphics';
import RaysTracedProgress from './RaysTracedProgress';

const ProgressLevel = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 10px;
  text-align: right;
  font-size: small;
`;

const SceneStyled = styled.div`
  display: flex;
  flex-direction: column;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: ${p => (p.shown ? '1' : '0')};
`;

class Scene extends Component {
  state = {
    width: 0,
    height: 0,
    raysTraced: 0,
    maxRayCount: 1,
    lenses: [],
  };

  componentWillMount() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.setState({ width, height });
  };

  onProgressChanged = (raysTraced, maxRayCount) => {
    this.setState({ raysTraced, maxRayCount });
  };

  addLens = (lens) => {
    const { lenses } = this.state;
    this.setState({ lenses: [...lenses, lens] });
  };

  render() {
    const {
      width, height, raysTraced, maxRayCount, lenses,
    } = this.state;
    const progress = (raysTraced / maxRayCount) * 100;
    const percent = Math.round(progress);
    return (
      <SceneStyled>
        <Graphics
          width={width}
          height={height}
          lenses={lenses}
          onProgressChanged={this.onProgressChanged}
        />

        <Info shown={progress < 100}>
          <ProgressLevel>
            <span>
              {raysTraced}/{maxRayCount} rays traced
            </span>
            <span>Progress: {percent}%</span>
          </ProgressLevel>
          <RaysTracedProgress percent={progress} showInfo={false} strokeWidth={2} />
        </Info>
      </SceneStyled>
    );
  }
}

export default Scene;
