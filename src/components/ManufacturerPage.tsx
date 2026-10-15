import React, { useEffect } from 'react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultManufacturerConfig } from '../admin/defaultConfig';
import { ManufacturerDetails } from './ManufacturerDetails';

export const ManufacturerPage: React.FC = () => {
  const { publishedConfig } = useAdminConfig();
  const manufacturer = {
    ...defaultManufacturerConfig,
    ...publishedConfig.manufacturer,
    manufacturedBy: publishedConfig.manufacturer?.manufacturedBy || defaultManufacturerConfig.manufacturedBy,
    marketedBy: publishedConfig.manufacturer?.marketedBy || defaultManufacturerConfig.marketedBy,
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = 'Manufacturer — Farminix';
  }, []);

  return (
    <div className="w-full min-h-[70vh] bg-gradient-to-b from-purple-50/60 via-white to-white px-4 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <ManufacturerDetails manufacturer={manufacturer} />
      </div>
    </div>
  );
};
