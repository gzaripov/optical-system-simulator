import React, { Component } from "react";
import styled from "styled-components";
import Graphics from "./Graphics";

const Canvas = styled.canvas``;

class Scene extends Component {
  state = {
    tantalum: null,
    width: 0,
    height: 0
  };

  componentWillMount() {
    const width = window.innerWidth;
    const height = Math.floor(width / 16 * 9);
    this.setState({ width, height });
  }

  componentDidMount() {
    this.setState({
      tantalum: new Graphics(this.canvas)
    });
  }

  render() {
    const { width, height } = this.state;
    return (
      <Canvas
        innerRef={c => (this.canvas = c)}
        width={width + "px"}
        height={height + "px"}
      />
    );
  }
}

export default Scene;
