import * as React from "react";
import { HamburgerSlider } from "react-animated-burgers";
import styled from "styled-components";
import Modals from "./Modals";
import Scene from "./Scene";
import SideMenu from "./SideMenu";

const HamburgerContainer = styled.div`
  position: absolute;
  left: 0;
  top: 2px;
  transform: scale(0.5);
`;

interface State {
  menuOpened: boolean;
}

class App extends React.Component<{}, State> {
  public render() {
    const { menuOpened } = this.state;
    return (
      <div>
        <Scene />
        <SideMenu opened={menuOpened} />
        <HamburgerContainer onClick={this.togglePane}>
          <HamburgerSlider
            className="hamburger-slider"
            isActive={menuOpened}
            barColor="#fff"
          />
        </HamburgerContainer>
        <Modals />
      </div>
    );
  }

  private togglePane = () => {
    const { menuOpened } = this.state;
    this.setState({ menuOpened: !menuOpened });
  };
}

export default App;
