import { Product, SpotPrices } from '../types';

export async function fetchLivePrices(refresh: boolean = false): Promise<{ spotPrices: SpotPrices; products: Product[] }> {
  try {
    const response = await fetch(`/api/prices${refresh ? '?refresh=true' : ''}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Backend API error, falling back to client calculations:', err);
    // Fallback logic handled gracefully by caller if needed
    throw err;
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
