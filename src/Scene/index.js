import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { HamburgerSlider } from 'react-animated-burgers';
import PlusIcon from 'mdi-react/PlusIcon';
import MinusIcon from 'mdi-react/MinusIcon';
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

const SideMenu = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 256px;
  transform: ${p => (p.opened ? '' : 'translate3d(-100%, 0px, 0px)')};
  background-color: rgba(0, 0, 0, 0.4);
  transition: 0.5s;
  padding-top: 60px;
`;

const MenuItemStyled = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: 20px 0;
  cursor: pointer;

  &:hover {
    background-color: white;
  }
`;

const MenuItemText = styled.p`
  margin-left: 56px;
  margin-bottom: 0;
  user-select: none;
`;

const MenuItemIcon = styled.span`
  display: flex;
  position: absolute;
  left: 24px;
  margin: auto 24px auto 0;
`;

const MenuItem = ({ icon, text, className }) => (
  <MenuItemStyled className={className}>
    {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
    <MenuItemText>{text}</MenuItemText>
  </MenuItemStyled>
);

MenuItem.defaultProps = {
  icon: '',
  className: '',
};

MenuItem.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.element,
  className: PropTypes.string,
};

const HamburgerContainer = styled(Button)`
  position: absolute;
  left: 0;
  top: 2px;
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

        <SideMenu opened={paneOpened}>
          <MenuItem icon={<PlusIcon />} text="Add Lens" />
          <MenuItem icon={<MinusIcon />} text="Remove Lens" />
          <MenuItem icon={<MinusIcon />} text="Settings" />
          <MenuItem icon={<MinusIcon />} text="Load scene" />
          <MenuItem icon={<MinusIcon />} text="Export scene" />
        </SideMenu>

        <HamburgerContainer onClick={this.togglePane}>
          <HamburgerSlider className="hamburger-slider" isActive={paneOpened} barColor="#fff" />
        </HamburgerContainer>
      </SceneStyled>
    );
  }
}

export default Scene;
