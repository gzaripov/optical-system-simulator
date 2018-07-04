import * as React from "react";
import styled from "styled-components";
import DefaultProps from "../util/DefaultProps";

interface Props extends DefaultProps {
  icon: JSX.Element;
  text: string;
  onClick: () => void;
}

const MenuItemText = styled.p`
  margin-left: 62px;
  margin-bottom: 0;
  user-select: none;
  color: #ffffffbd;
`;

const MenuItemIcon = styled.span`
  display: flex;
  position: absolute;
  left: 24px;
  margin: auto 24px auto 0;

  & > svg {
    fill: #ffffffbd;
  }
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

  &:hover ${MenuItemText} {
    color: black;
  }

  &:hover ${MenuItemIcon} {
    & > svg {
      fill: black;
    }
  }
`;

const MenuItem: React.SFC<Props> = ({ icon, text, onClick, className }) => (
  <MenuItemStyled className={className} onClick={onClick}>
    {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
    <MenuItemText>{text}</MenuItemText>
  </MenuItemStyled>
);

MenuItem.defaultProps = {
  onClick: () => void 0
};

export default MenuItem;
