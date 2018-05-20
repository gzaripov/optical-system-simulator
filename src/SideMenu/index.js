import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import PlusIcon from 'mdi-react/PlusIcon';
import MinusIcon from 'mdi-react/MinusIcon';
import { connect } from 'react-redux';

const SideMenuStyled = styled.div`
  position: fixed;
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

const MenuItemText = styled.p`
  margin-left: 56px;
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

const MenuItem = ({
  icon, text, onClick, className,
}) => (
  <MenuItemStyled className={className} onClick={onClick}>
    {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
    <MenuItemText>{text}</MenuItemText>
  </MenuItemStyled>
);

MenuItem.defaultProps = {
  icon: '',
  className: '',
  onClick: () => {},
};

MenuItem.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.element,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

const SideMenu = ({ opened, showAddLens }) => (
  <SideMenuStyled opened={opened}>
    <MenuItem icon={<PlusIcon />} text="Add Lens" onClick={showAddLens} />
    <MenuItem icon={<MinusIcon />} text="Remove Lens" />
    <MenuItem icon={<MinusIcon />} text="Settings" />
    <MenuItem icon={<MinusIcon />} text="Load scene" />
    <MenuItem icon={<MinusIcon />} text="Export scene" />
  </SideMenuStyled>
);

SideMenu.defaultProps = {
  opened: false,
  showAddLens: () => {},
};

SideMenu.propTypes = {
  opened: PropTypes.bool,
  showAddLens: PropTypes.func,
};

const mapDispatch = ({ modals }) => ({
  showAddLens: () => modals.showModal('addLens'),
});

export default connect(null, mapDispatch)(SideMenu);
