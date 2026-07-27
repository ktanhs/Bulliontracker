import { UserProfile, UserOwnedItem, MetalType, FormFactor } from '../types';

const STORAGE_USERS_KEY = 'bullion_tracker_users_v1';
const STORAGE_ACTIVE_USER_KEY = 'bullion_tracker_active_user_v1';
const STORAGE_ITEMS_KEY = 'bullion_tracker_user_items_v1';

// Default Demo User Account for immediate rich out-of-the-box experience
const DEFAULT_DEMO_USER: UserProfile = {
  id: 'user-demo-1',
  name: 'Alex Tan',
  email: 'alex.tan@sgbullion.com',
  avatarEmoji: '👑',
  investorType: 'Physical Stacker',
  preferredCurrency: 'SGD',
  vaultLocation: 'Silver Bullion The Safe, SG',
  bio: 'Long-term physical gold & silver stacker based in Singapore. Hedging currency inflation with IPM GST-free bullion.',
  createdAt: '2025-01-15T08:00:00.000Z',
};

// Initial stack items for the demo account
const DEFAULT_DEMO_ITEMS: UserOwnedItem[] = [
  {
    id: 'item-1',
    userId: 'user-demo-1',
    productId: 'g-coin-1',
    productName: '1 oz American Gold Eagle Coin',
    brand: 'US Mint',
    metal: 'Gold',
    formFactor: 'Coin',
    weightOz: 1.0,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
    isOwned: true,
    quantity: 2,
    purchasePriceSgd: 3320.0,
    purchasePriceUsd: 2462.9,
    purchaseCurrency: 'USD',
    purchaseDate: '2025-11-10',
    retailerAcquired: 'Silver Bullion SG',
    storageNote: 'Safe Deposit Box #A12',
    createdAt: '2025-11-10T10:00:00.000Z',
  },
  {
    id: 'item-2',
    userId: 'user-demo-1',
    productId: 's-bar-100oz',
    productName: '100 oz Silver Cast Bar .9999',
    brand: 'Silver Bullion / LBMA',
    metal: 'Silver',
    formFactor: 'Bar',
    weightOz: 100.0,
    imageUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=400&q=80',
    isOwned: true,
    quantity: 1,
    purchasePriceSgd: 4150.0,
    purchasePriceUsd: 3078.6,
    purchaseCurrency: 'SGD',
    purchaseDate: '2026-02-14',
    retailerAcquired: 'BullionStar',
    storageNote: 'Silver Bullion The Safe Vault',
    createdAt: '2026-02-14T14:30:00.000Z',
  },
  {
    id: 'item-3',
    userId: 'user-demo-1',
    productId: 's-coin-1',
    productName: '1 oz American Silver Eagle Coin',
    brand: 'US Mint',
    metal: 'Silver',
    formFactor: 'Coin',
    weightOz: 1.0,
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80',
    isOwned: false, // Item of Interest / Wishlist
    quantity: 20, // 1 Tube
    purchasePriceSgd: 46.5,
    purchasePriceUsd: 34.5,
    purchaseCurrency: 'USD',
    purchaseDate: '2026-07-01',
    retailerAcquired: 'LPM HK',
    storageNote: 'Target buy when premium drops below 12%',
    createdAt: '2026-07-01T09:15:00.000Z',
  },
];

export function getUsers(): UserProfile[] {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (!data) {
      const initial = [DEFAULT_DEMO_USER];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (e) {
    return [DEFAULT_DEMO_USER];
  }
}

export function getActiveUser(): UserProfile | null {
  try {
    const userId = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
    const users = getUsers();
    if (!userId) {
      // Default to demo user
      localStorage.setItem(STORAGE_ACTIVE_USER_KEY, DEFAULT_DEMO_USER.id);
      return DEFAULT_DEMO_USER;
    }
    const found = users.find((u) => u.id === userId);
    return found || DEFAULT_DEMO_USER;
  } catch (e) {
    return DEFAULT_DEMO_USER;
  }
}

export function setActiveUser(userId: string): void {
  localStorage.setItem(STORAGE_ACTIVE_USER_KEY, userId);
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_ACTIVE_USER_KEY);
}

export function registerNewUser(
  name: string,
  email: string,
  investorType: UserProfile['investorType'],
  preferredCurrency: 'SGD' | 'USD' = 'SGD',
  vaultLocation: string = 'Home Safe'
): UserProfile {
  const users = getUsers();

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    setActiveUser(existing.id);
    return existing;
  }

  const avatars = ['👑', '🥇', '🥈', '🛡️', '⚡', '💎', '🦁', '🌟'];
  const avatarEmoji = avatars[Math.floor(Math.random() * avatars.length)];

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    email,
    avatarEmoji,
    investorType,
    preferredCurrency,
    vaultLocation,
    bio: `Physical metals investor tracking portfolio in ${preferredCurrency}.`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  setActiveUser(newUser.id);
  return newUser;
}

export function updateUserProfile(updated: Partial<UserProfile>): UserProfile | null {
  const active = getActiveUser();
  if (!active) return null;

  const users = getUsers();
  const index = users.findIndex((u) => u.id === active.id);
  if (index === -1) return null;

  const merged = { ...users[index], ...updated };
  users[index] = merged;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  return merged;
}

export function getUserOwnedItems(userId: string): UserOwnedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    let items: UserOwnedItem[] = raw ? JSON.parse(raw) : [];

    // Seed initial demo items if none exist for user-demo-1
    if (!raw && userId === DEFAULT_DEMO_USER.id) {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(DEFAULT_DEMO_ITEMS));
      return DEFAULT_DEMO_ITEMS;
    }

    return items.filter((item) => item.userId === userId);
  } catch (e) {
    return userId === DEFAULT_DEMO_USER.id ? DEFAULT_DEMO_ITEMS : [];
  }
}

export function addOrUpdateOwnedItem(item: Omit<UserOwnedItem, 'id' | 'createdAt'> & { id?: string }): UserOwnedItem {
  const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
  let items: UserOwnedItem[] = raw ? JSON.parse(raw) : (DEFAULT_DEMO_ITEMS as UserOwnedItem[]);

  if (item.id) {
    // Edit existing item
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      items[idx] = {
        ...items[idx],
        ...item,
      };
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
      return items[idx];
    }
  }

  // Create new item
  const newItem: UserOwnedItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
  return newItem;
}

export function deleteUserOwnedItem(itemId: string): void {
  const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
  if (!raw) return;
  const items: UserOwnedItem[] = JSON.parse(raw);
  const filtered = items.filter((i) => i.id !== itemId);
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(filtered));
}

export function toggleProductInterest(
  userId: string,
  product: { id: string; name: string; metal: MetalType; formFactor: FormFactor; weightOz: number; imageUrl: string },
  defaultPriceSgd: number = 0
): { item: UserOwnedItem; action: 'added' | 'removed' } {
  const userItems = getUserOwnedItems(userId);
  const existing = userItems.find((i) => i.productId === product.id && !i.isOwned);

  if (existing) {
    deleteUserOwnedItem(existing.id);
    return { item: existing, action: 'removed' };
  }

  const newItem = addOrUpdateOwnedItem({
    userId,
    productId: product.id,
    productName: product.name,
    metal: product.metal,
    formFactor: product.formFactor,
    weightOz: product.weightOz,
    imageUrl: product.imageUrl,
    isOwned: false, // Item of Interest
    quantity: 1,
    purchasePriceSgd: defaultPriceSgd,
    purchasePriceUsd: defaultPriceSgd / 1.348,
    purchaseCurrency: 'SGD',
    purchaseDate: new Date().toISOString().split('T')[0],
    retailerAcquired: 'Watchlist Interest',
    storageNote: 'Marked as Item of Interest from Market Catalog',
  });

  return { item: newItem, action: 'added' };
}
