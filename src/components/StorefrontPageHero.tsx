import type { ReactNode } from 'react';
import { ChevronRight, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  image?: string;
}

export function StorefrontPageHero({ eyebrow, title, description, children, image = '/home-farm-hero.png' }: Props) {
  const { navigate } = useApp();
  return (
    <header className="store-page-hero">
      <img className="store-page-hero-image" src={image} alt="" aria-hidden="true" />
      <div className="store-container store-page-hero-inner">
        <nav className="store-breadcrumb" aria-label="Breadcrumb"><button onClick={() => navigate('/')}>Home</button><ChevronRight size={13} /><span>{eyebrow}</span></nav>
        <span className="store-eyebrow"><Leaf size={15} />{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </header>
  );
}
