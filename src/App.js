import React, { Component } from 'react';
import styled from 'styled-components';
import { HamburgerSlider } from 'react-animated-burgers';
import Button from 'ui/Button';
import Scene from './Scene';
import SideMenu from './SideMenu';
import Modals from './Modals';

const HamburgerContainer = styled(Button)`
  position: absolute;
  left: 0;
  top: 2px;
  transform: scale(0.5);
`;

class App extends Component {
  state = {
    menuOpened: false,
  };

  togglePane = () => {
    const { menuOpened } = this.state;
    this.setState({ menuOpened: !menuOpened });
  };

  render() {
    const { menuOpened } = this.state;
    return (
      <div>
        <Scene />
        <SideMenu opened={menuOpened} />
        <HamburgerContainer onClick={this.togglePane}>
          <HamburgerSlider className="hamburger-slider" isActive={menuOpened} barColor="#fff" />
        </HamburgerContainer>
        <Modals />
      </div>
    );
  }
}

export default App;
