import React, { useEffect } from 'react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultManufacturerConfig } from '../admin/defaultConfig';
import { ManufacturerDetails } from './ManufacturerDetails';
import { StorefrontPageHero } from './StorefrontPageHero';

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
    <div className="store-information-page store-manufacturer-page min-h-[70vh]">
      <StorefrontPageHero eyebrow="The people behind the grain" title="Rooted in quality." description="Meet the manufacturing and marketing teams bringing Farminix from our farms to your family's table." />
      <div className="store-container store-section">
        <ManufacturerDetails manufacturer={manufacturer} />
      </div>
    </div>
  );
};
