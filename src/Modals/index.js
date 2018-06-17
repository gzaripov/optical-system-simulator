import React from 'react';
import AddLensModal from './AddLensModal';
import AddPrismModal from './AddPrismModal';
import SettingsModal from './SettingsModal';
import LightSourceModal from './LightSourceModal';

export default () => (
  <div>
    <AddLensModal />
    <AddPrismModal />
    <SettingsModal />
    <LightSourceModal />
  </div>
);
