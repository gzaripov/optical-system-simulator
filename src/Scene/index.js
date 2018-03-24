import React from "react";
import styled from "styled-components";
import Graphics from "./Graphics";

const Canvas = styled.canvas``;

class Scene extends React.Component {
  state = {
    tantalum: null
  };

  componentDidMount() {
    this.setState({
      tantalum: new Graphics(this.canvas)
    });
  }

  render() {
    return <div />;
  }
}

export default Scene;
