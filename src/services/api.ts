import { Product, SpotPrices, RetailerApiStatus } from '../types';

export async function fetchLivePrices(refresh: boolean = false): Promise<{
  spotPrices: SpotPrices;
  products: Product[];
  retailerApiStatus?: RetailerApiStatus[];
}> {
  try {
    const response = await fetch(`/api/prices${refresh ? '?refresh=true' : ''}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Backend API error, falling back to client calculations:', err);
    throw err;
  }
}

export async function fetchRetailerApiStatus(): Promise<RetailerApiStatus[]> {
  try {
    const response = await fetch('/api/retailer-status');
    if (!response.ok) {
      throw new Error(`Failed to fetch retailer API status: ${response.statusText}`);
    }
    const data = await response.json();
    return data.retailerApiStatus || [];
  } catch (err) {
    console.warn('Error fetching retailer API status:', err);
    return [];
  }
}

export async function updateCustomSpotPrices(custom: {
  goldUsdPerOz: number;
  silverUsdPerOz: number;
  usdToSgdRate: number;
}): Promise<{ spotPrices: SpotPrices; products: Product[] }> {
  try {
    const response = await fetch('/api/prices/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custom),
    });
    if (!response.ok) {
      throw new Error(`Failed to update custom spot prices: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Error updating custom spot prices:', err);
    throw err;
  }
}

export async function fetchMarketInsights(params: {
  selectedMetal?: string;
  selectedRetailer?: string;
  userQuery?: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/market-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return data.analysis || 'No analysis available.';
  } catch (err) {
    console.error('Error fetching market insights:', err);
    return 'Unable to connect to market insights service. Please check network connection.';
  }
}
