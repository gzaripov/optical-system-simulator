import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import LightbulbIcon from 'mdi-react/LightbulbOnOutlineIcon';
import PlusIcon from 'mdi-react/PlusIcon';
import MinusIcon from 'mdi-react/MinusIcon';
import ImportIcon from 'mdi-react/ImportIcon';
import ExportIcon from 'mdi-react/ExportIcon';
import SettingsIcon from 'mdi-react/SettingsOutlineIcon';
import { connect } from 'react-redux';
import save from 'save-file';
import FileSelect from 'ui/FileSelect';

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

function exportScene(scene) {
  save(JSON.stringify(scene), 'scene.json');
}

const SideMenu = ({
  opened,
  showAddLens,
  showAddPrism,
  removeSelectedLens,
  showSettings,
  showLightSource,
  scene,
  importScene,
}) => (
  <SideMenuStyled opened={opened}>
    <MenuItem icon={<LightbulbIcon />} text="Light Source" onClick={showLightSource} />
    <MenuItem icon={<PlusIcon />} text="Add Lens" onClick={showAddLens} />
    <MenuItem icon={<PlusIcon />} text="Add Prism" onClick={showAddPrism} />
    <MenuItem icon={<MinusIcon />} text="Remove selected" onClick={removeSelectedLens} />
    <FileSelect accept=".json" onSelect={importScene}>
      <MenuItem icon={<ImportIcon />} text="Import scene" />
    </FileSelect>
    <MenuItem icon={<ExportIcon />} text="Export scene" onClick={() => exportScene(scene)} />
    <MenuItem icon={<SettingsIcon />} text="Settings" onClick={showSettings} />
  </SideMenuStyled>
);

SideMenu.defaultProps = {
  opened: false,
  showAddLens: () => {},
  showAddPrism: () => {},
  removeSelectedLens: () => {},
  showSettings: () => {},
  showLightSource: () => {},
  importScene: () => {},
};

SideMenu.propTypes = {
  opened: PropTypes.bool,
  scene: PropTypes.shape({}).isRequired,
  showAddLens: PropTypes.func,
  showAddPrism: PropTypes.func,
  removeSelectedLens: PropTypes.func,
  showSettings: PropTypes.func,
  showLightSource: PropTypes.func,
  importScene: PropTypes.func,
};

const mapState = ({ scene }) => ({ scene });

const mapDispatch = ({ modals, scene }) => ({
  showAddLens: () => modals.showModal('addLens'),
  showAddPrism: () => modals.showModal('addPrism'),
  removeSelectedLens: scene.removeSelectedLens,
  showSettings: () => modals.showModal('settings'),
  showLightSource: () => modals.showModal('lightSource'),
  importScene: files => scene.loadScene(files[0]),
});

export default connect(
  mapState,
  mapDispatch,
)(SideMenu);
