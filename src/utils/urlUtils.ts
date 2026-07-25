import React from 'react';
import { Product, RetailerId } from '../types';
import { RETAILERS } from '../data/bullionData';

/**
 * Generates direct listing/order URL for a specific product at a specific retailer.
 */
export function getRetailerListingUrl(retailerId: RetailerId, product: Product): string {
  // If the product has a specific dealUrl or custom retailer link for a promo
  const specialOffer = product.prices?.[retailerId]?.specialOffer;
  if (specialOffer?.dealUrl) {
    return specialOffer.dealUrl;
  }

  const query = encodeURIComponent(product.name);

  switch (retailerId) {
    case 'silverbullion':
      return `https://www.silverbullion.com.sg/Buy?search=${query}`;
    case 'bullionstar':
      return `https://www.bullionstar.com/buy/products?search=${query}`;
    case 'lpm':
      return `https://www.lpm.hk/en/catalogsearch/result/?q=${query}`;
    default: {
      const ret = RETAILERS[retailerId as keyof typeof RETAILERS];
      return ret?.website || 'https://www.google.com/search?q=' + query;
    }
  }
}

/**
 * Safely opens a retailer's listing page in a new tab.
 */
export function openRetailerListing(retailerId: RetailerId, product: Product, e?: React.MouseEvent): void {
  if (e) {
    e.stopPropagation();
  }
  const url = getRetailerListingUrl(retailerId, product);
  window.open(url, '_blank', 'noopener,noreferrer');
}
