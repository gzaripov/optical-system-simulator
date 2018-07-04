import * as React from "react";
import styled from "styled-components";
import DefaultProps from "../util/DefaultProps";

const ButtonStyled = styled.button`
  padding: 0;
  border: 0;
  cursor: pointer;
  background: none;
`;

interface Props extends DefaultProps {
  onClick?: () => void;
}

const Button: React.SFC<Props> = ({ children, onClick, className }) => (
  <ButtonStyled type="button" onClick={onClick} className={className}>
    {children}
  </ButtonStyled>
);

Button.defaultProps = {
  onClick: () => void 0
};

export default Button;
