import React from 'react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { ProductReviews } from './ProductReviews';

export const HomeRiceReviewsSection: React.FC = () => {
  const { publishedConfig } = useAdminConfig();
  const rice = publishedConfig.products.find((product) => product.id === 'r1');
  if (!rice?.reviewsList?.some((review) => review.enabled !== false && review.userName.trim() && review.comment.trim())) return null;
  return <section className="home-rice-reviews-section"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><p className="home-rice-reviews-eyebrow">FARMINIX FAMILY CHOICE RICE</p><ProductReviews reviews={rice.reviewsList} title="Word from the kitchen" compact /></div></section>;
};
