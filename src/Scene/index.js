import React, { Component } from 'react';
import styled from 'styled-components';
import { HamburgerSlider } from 'react-animated-burgers';
// import AddIcon from 'mdi-react/MenuIcon';
import Button from '../ui/Button';
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
  position: relative;
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

const Pane = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: ${p => (p.opened ? '300px' : '0')};
  background-color: rgba(0, 0, 0, 0.4);
  transition: 0.5s;
`;

const HamburgerContainer = styled(Button)`
  position: absolute;
  right: 0;
  top: 0;
  transform: scale(0.5);
`;

class Scene extends Component {
  state = {
    width: 0,
    height: 0,
    scale: 1,
    raysTraced: 0,
    maxRayCount: 1,
    paneOpened: false,
    lenses: [],
  };

  componentWillMount() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = 1 / window.devicePixelRatio;
    this.setState({ width, height, scale });
  }

  onProgressChanged = (raysTraced, maxRayCount) => {
    this.setState({ raysTraced, maxRayCount });
  };

  addLens = (lens) => {
    const { lenses } = this.state;
    this.setState({ lenses: [...lenses, lens] });
  };

  togglePane = () => {
    const { paneOpened } = this.state;
    console.log(`toggle ${paneOpened}`);
    this.setState({ paneOpened: !paneOpened });
  };

  render() {
    const {
      width, height, scale, raysTraced, maxRayCount, lenses, paneOpened,
    } = this.state;
    const progress = raysTraced / maxRayCount * 100;
    const percent = Math.round(progress);
    return (
      <SceneStyled>
        <Graphics
          width={width}
          height={height}
          scale={scale}
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
        <Pane opened={paneOpened} />
        <HamburgerContainer onClick={this.togglePane}>
          <HamburgerSlider className="hamburger-slider" isActive={paneOpened} barColor="#fff" />
        </HamburgerContainer>
      </SceneStyled>
    );
  }
}

export default Scene;
