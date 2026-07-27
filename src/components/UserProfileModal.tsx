import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Coins,
  Building2,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Edit3,
  Bookmark,
  Check,
  Calendar,
  Sparkles,
  LogOut,
  Layers,
  DollarSign,
  PieChart as PieChartIcon,
  Tag,
  CheckCircle2,
  PackageCheck,
  FolderHeart,
  PlusCircle,
  ExternalLink,
  Search,
  Upload,
  FileText,
  FileCheck,
  Calculator,
  Globe,
  Download,
  Eye,
  RefreshCw,
  Scale,
  CreditCard,
} from 'lucide-react';
import { UserProfile, UserOwnedItem, ComputedProductMetrics, Currency, MetalType, FormFactor, Product } from '../types';
import {
  updateUserProfile,
  addOrUpdateOwnedItem,
  deleteUserOwnedItem,
  logoutUser,
  getUserOwnedItems,
} from '../utils/userAuth';
import { getHistoricalSpotPrice, HistoricalPriceResult } from '../utils/historicalPrices';

export const ALL_BULLION_BRANDS = [
  'US Mint',
  'Royal Canadian Mint',
  'Perth Mint',
  'PAMP Suisse',
  'Valcambi Suisse',
  'Heraeus / Argor-Heraeus',
  'Metalor',
  'Silver Bullion / LBMA',
  'BullionStar Mint',
  'Royal Mint (UK)',
  'Austrian Mint',
  'South African Mint',
  'Mexican Mint',
  'Singapore Mint',
  'Scottsdale Mint',
  'Asahi Refining',
  'Credit Suisse',
  'Sunshine Minting',
  'Geiger Edelmetalle',
  'Umicore',
  'Nadir Refining',
  'Royal Australian Mint',
  'Other / Custom Refiner',
];

export function detectProductBrand(productName: string): string {
  const n = productName.toLowerCase();
  if (n.includes('eagle') || n.includes('buffalo') || n.includes('us mint') || n.includes('american')) return 'US Mint';
  if (n.includes('maple') || n.includes('rcm') || n.includes('canadian')) return 'Royal Canadian Mint';
  if (n.includes('kangaroo') || n.includes('perth') || n.includes('kookaburra') || n.includes('koala') || n.includes('lunar')) return 'Perth Mint';
  if (n.includes('pamp')) return 'PAMP Suisse';
  if (n.includes('valcambi') || n.includes('combibar')) return 'Valcambi Suisse';
  if (n.includes('heraeus')) return 'Heraeus / Argor-Heraeus';
  if (n.includes('metalor')) return 'Metalor';
  if (n.includes('bullionstar')) return 'BullionStar Mint';
  if (n.includes('silver bullion') || n.includes('safe house')) return 'Silver Bullion / LBMA';
  if (n.includes('britannia') || n.includes('royal mint') || n.includes('sovereign')) return 'Royal Mint (UK)';
  if (n.includes('philharmonic') || n.includes('austrian')) return 'Austrian Mint';
  if (n.includes('krugerrand') || n.includes('south african')) return 'South African Mint';
  if (n.includes('libertad') || n.includes('mexican')) return 'Mexican Mint';
  if (n.includes('merlion') || n.includes('singapore mint')) return 'Singapore Mint';
  if (n.includes('scottsdale') || n.includes('stacker')) return 'Scottsdale Mint';
  if (n.includes('asahi')) return 'Asahi Refining';
  if (n.includes('credit suisse')) return 'Credit Suisse';
  if (n.includes('sunshine') || n.includes('smi')) return 'Sunshine Minting';
  if (n.includes('geiger')) return 'Geiger Edelmetalle';
  if (n.includes('umicore')) return 'Umicore';
  if (n.includes('nadir')) return 'Nadir Refining';
  return 'LBMA Accredited Refiner';
}

interface UserProfileModalProps {
  user: UserProfile;
  computedProducts: ComputedProductMetrics[];
  currency: Currency;
  onClose: () => void;
  onUserUpdated: (user: UserProfile | null) => void;
  onItemsUpdated: () => void;
  spotPrices?: {
    goldUsdPerOz: number;
    silverUsdPerOz: number;
    usdToSgdRate: number;
  };
  initialAddProduct?: { product: Product; defaultPriceSgd: number } | null;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  computedProducts,
  currency,
  onClose,
  onUserUpdated,
  onItemsUpdated,
  spotPrices,
  initialAddProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'STACK' | 'INTEREST' | 'SETTINGS'>('STACK');

  // Filters for Stack view
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'SGD' | 'USD'>('ALL');
  const [formFactorFilter, setFormFactorFilter] = useState<'ALL' | 'Coin' | 'Bar'>('ALL');

  // Owned & Interest items state
  const [items, setItems] = useState<UserOwnedItem[]>(() => getUserOwnedItems(user.id));

  // Edit Profile Form state
  const [name, setName] = useState(user.name);
  const [investorType, setInvestorType] = useState(user.investorType);
  const [preferredCurrency, setPreferredCurrency] = useState(user.preferredCurrency);
  const [vaultLocation, setVaultLocation] = useState(user.vaultLocation);
  const [bio, setBio] = useState(user.bio || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Add / Edit Item Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserOwnedItem | null>(null);

  // Form Fields
  const [formIsOwned, setFormIsOwned] = useState(true);
  const [formSearchQuery, setFormSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [selectedMetalFilter, setSelectedMetalFilter] = useState<string>('ALL');
  const [selectedWeightFilter, setSelectedWeightFilter] = useState<string>('ALL');

  const [formProductId, setFormProductId] = useState<string>(computedProducts[0]?.product.id || '');
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [formCustomProductName, setFormCustomProductName] = useState('');
  const [formBrand, setFormBrand] = useState('US Mint');
  const [formMetal, setFormMetal] = useState<MetalType>('Gold');
  const [formFormFactor, setFormFormFactor] = useState<FormFactor>('Coin');
  const [formWeightOz, setFormWeightOz] = useState('1.0');
  const [weightUnitInput, setWeightUnitInput] = useState<'oz' | 'g'>('oz');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formPurchasePrice, setFormPurchasePrice] = useState('');
  const [formPurchaseCurrency, setFormPurchaseCurrency] = useState<'SGD' | 'USD'>('SGD');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRetailer, setFormRetailer] = useState('Silver Bullion SG');
  const [formNote, setFormNote] = useState('');
  const [formInvoiceFileName, setFormInvoiceFileName] = useState<string | undefined>(undefined);
  const [formInvoiceDataUrl, setFormInvoiceDataUrl] = useState<string | undefined>(undefined);

  // Invoice OCR Scanning State
  const [isScanningInvoice, setIsScanningInvoice] = useState(false);
  const [invoiceScanStatus, setInvoiceScanStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Historical Spot Lookup State
  const [historicalInfo, setHistoricalInfo] = useState<HistoricalPriceResult | null>(null);

  // Preview Invoice Modal
  const [previewInvoice, setPreviewInvoice] = useState<{ fileName: string; dataUrl: string } | null>(null);

  // Listen to initialAddProduct prop to pre-fill form when opened from catalog
  React.useEffect(() => {
    if (initialAddProduct && initialAddProduct.product) {
      const prod = initialAddProduct.product;
      const priceSgd = initialAddProduct.defaultPriceSgd;
      setEditingItem(null);
      setFormIsOwned(true);
      setIsCustomProduct(false);
      setFormProductId(prod.id);
      setFormBrand(detectProductBrand(prod.name));
      setFormMetal(prod.metal);
      setFormFormFactor(prod.formFactor);
      setFormWeightOz(prod.weightOz.toString());
      setFormQuantity('1');
      setFormPurchaseCurrency('SGD');
      setFormPurchasePrice(priceSgd.toFixed(2));
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormRetailer('Silver Bullion SG');
      setFormNote(`Selected from dealer catalog (Live Listed Price: S$${priceSgd.toFixed(2)})`);
      setFormInvoiceFileName(undefined);
      setFormInvoiceDataUrl(undefined);
      setHistoricalInfo(null);
      setIsFormOpen(true);
      setActiveTab('STACK');
    }
  }, [initialAddProduct]);

  const refreshItems = () => {
    const updated = getUserOwnedItems(user.id);
    setItems(updated);
    onItemsUpdated();
  };

  const usdRate = spotPrices?.usdToSgdRate || 1.348;

  // Filter products by keyword (brand, metal, weight, name)
  const filteredCatalogProducts = useMemo(() => {
    return computedProducts.filter((p) => {
      const prod = p.product;
      const q = formSearchQuery.toLowerCase().trim();
      const detectedBrand = detectProductBrand(prod.name);

      // Brand match
      let brandMatch = true;
      if (selectedBrandFilter !== 'ALL') {
        const bFilter = selectedBrandFilter.toLowerCase();
        brandMatch =
          detectedBrand.toLowerCase() === bFilter ||
          prod.name.toLowerCase().includes(bFilter) ||
          bFilter.split(/[\/\(\)]+/).some((part) => {
            const trimmed = part.trim();
            return trimmed.length >= 3 && prod.name.toLowerCase().includes(trimmed);
          });
      }

      // Metal match
      let metalMatch = true;
      if (selectedMetalFilter !== 'ALL') {
        metalMatch = prod.metal === selectedMetalFilter;
      }

      // Weight match
      let weightMatch = true;
      if (selectedWeightFilter !== 'ALL') {
        const targetWeight = parseFloat(selectedWeightFilter);
        const diff = Math.abs(prod.weightOz - targetWeight);
        const tolerance = targetWeight < 0.5 ? 0.015 : targetWeight < 5 ? 0.08 : 0.2;
        weightMatch = diff <= tolerance;
      }

      // Multi-word token Query match across name, metal, form factor, weight, brand
      let queryMatch = true;
      if (q) {
        const tokens = q.split(/\s+/).filter(Boolean);
        let kiloTerms = '';
        if (Math.abs(prod.weightOz - 32.15) < 0.2) {
          kiloTerms = '1kg 1 kg kilo kilogram';
        }
        const searchableText = `${prod.name} ${prod.metal} ${prod.formFactor} ${prod.weightOz}oz ${prod.weightOz} oz ${prod.weightOz} ounce ${kiloTerms} ${detectedBrand}`.toLowerCase();
        queryMatch = tokens.every((token) => searchableText.includes(token));
      }

      return brandMatch && metalMatch && weightMatch && queryMatch;
    });
  }, [computedProducts, formSearchQuery, selectedBrandFilter, selectedMetalFilter, selectedWeightFilter]);

  // Synchronize form fields if currently selected formProductId is no longer in filteredCatalogProducts
  React.useEffect(() => {
    if (isFormOpen && !isCustomProduct && filteredCatalogProducts.length > 0) {
      const exists = filteredCatalogProducts.some((p) => p.product.id === formProductId);
      if (!exists) {
        const first = filteredCatalogProducts[0];
        setFormProductId(first.product.id);
        setFormBrand(detectProductBrand(first.product.name));
        setFormMetal(first.product.metal);
        setFormFormFactor(first.product.formFactor);
        setFormWeightOz(first.product.weightOz.toString());
        const bestBuySgd = first.retailerMetrics[first.bestBuyRetailerId].buyPriceSgd;
        setFormPurchasePrice(
          formPurchaseCurrency === 'USD' ? (bestBuySgd / usdRate).toFixed(2) : bestBuySgd.toFixed(2)
        );
      }
    }
  }, [filteredCatalogProducts, isFormOpen, isCustomProduct, formProductId, formPurchaseCurrency, usdRate]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUserProfile({
      name,
      investorType,
      preferredCurrency,
      vaultLocation,
      bio,
    });
    if (updated) {
      onUserUpdated(updated);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    }
  };

  const handleOpenAddForm = (isOwned: boolean = true) => {
    setEditingItem(null);
    setFormIsOwned(isOwned);
    setIsCustomProduct(false);
    setFormSearchQuery('');
    setSelectedBrandFilter('ALL');
    setSelectedMetalFilter('ALL');
    setSelectedWeightFilter('ALL');

    const defaultProd = computedProducts[0];
    if (defaultProd) {
      setFormProductId(defaultProd.product.id);
      setFormBrand(detectProductBrand(defaultProd.product.name));
      setFormMetal(defaultProd.product.metal);
      setFormFormFactor(defaultProd.product.formFactor);
      setFormWeightOz(defaultProd.product.weightOz.toString());
      const bestBuySgd = defaultProd.retailerMetrics[defaultProd.bestBuyRetailerId].buyPriceSgd;
      setFormPurchasePrice(bestBuySgd.toFixed(2));
    } else {
      setFormPurchasePrice('100.00');
    }

    setFormPurchaseCurrency('SGD');
    setFormQuantity('1');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormRetailer('Silver Bullion SG');
    setFormNote('');
    setFormInvoiceFileName(undefined);
    setFormInvoiceDataUrl(undefined);
    setHistoricalInfo(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: UserOwnedItem) => {
    setEditingItem(item);
    setFormIsOwned(item.isOwned);
    setFormSearchQuery('');

    const matchedProd = computedProducts.find((p) => p.product.id === item.productId);
    if (matchedProd) {
      setIsCustomProduct(false);
      setFormProductId(matchedProd.product.id);
    } else {
      setIsCustomProduct(true);
      setFormCustomProductName(item.productName);
    }

    setFormBrand(item.brand || 'LBMA Refiner');
    setFormMetal(item.metal);
    setFormFormFactor(item.formFactor);
    setFormWeightOz(item.weightOz.toString());
    setFormQuantity(item.quantity.toString());

    const curr = item.purchaseCurrency || 'SGD';
    setFormPurchaseCurrency(curr);
    setFormPurchasePrice(curr === 'USD' ? item.purchasePriceUsd.toString() : item.purchasePriceSgd.toString());

    setFormDate(item.purchaseDate);
    setFormRetailer(item.retailerAcquired);
    setFormNote(item.storageNote || '');
    setFormInvoiceFileName(item.invoiceFileName);
    setFormInvoiceDataUrl(item.invoiceDataUrl);
    setHistoricalInfo(null);
    setIsFormOpen(true);
  };

  // Fetch / Download historical price based on selected date & metal
  const handleFetchHistoricalPrice = (dateStr?: string) => {
    const targetDate = dateStr || formDate;
    const weight = parseFloat(formWeightOz) || 1.0;
    const hist = getHistoricalSpotPrice(targetDate, formMetal, weight, formFormFactor);
    setHistoricalInfo(hist);

    // Auto-fill price field if empty or requested
    if (formPurchaseCurrency === 'USD') {
      setFormPurchasePrice(hist.estimatedPriceUsd.toFixed(2));
    } else {
      setFormPurchasePrice(hist.estimatedPriceSgd.toFixed(2));
    }
  };

  // Optical Invoice Scanner Upload Handler
  const handleInvoiceFileUpload = async (file: File) => {
    setIsScanningInvoice(true);
    setInvoiceScanStatus('Analyzing invoice image & running AI optical character recognition...');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setFormInvoiceDataUrl(dataUrl);
      setFormInvoiceFileName(file.name);

      try {
        const response = await fetch('/api/parse-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType: file.type || 'image/jpeg',
            fileName: file.name,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.invoice) {
            const inv = data.invoice;
            setFormCustomProductName(inv.productName);
            setFormBrand(inv.brand || 'LBMA Accredited');
            setFormMetal(inv.metal || 'Gold');
            setFormFormFactor(inv.formFactor || 'Coin');
            setFormWeightOz(inv.weightOz ? inv.weightOz.toString() : '1.0');
            setFormQuantity(inv.quantity ? inv.quantity.toString() : '1');
            setFormPurchaseCurrency(inv.purchaseCurrency === 'USD' ? 'USD' : 'SGD');
            setFormPurchasePrice(inv.purchasePrice ? inv.purchasePrice.toFixed(2) : '3300.00');
            setFormRetailer(inv.retailerAcquired || 'Silver Bullion SG');
            if (inv.purchaseDate) setFormDate(inv.purchaseDate);
            setFormNote(`Auto-scanned invoice #${inv.invoiceNumber || 'INV-01'}`);
            setIsCustomProduct(true);
            setInvoiceScanStatus('✅ Invoice scanned successfully! Form fields populated.');
          }
        }
      } catch (err) {
        setInvoiceScanStatus('Note: Invoice saved as attachment.');
      } finally {
        setIsScanningInvoice(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    let productName = formCustomProductName;
    let metal = formMetal;
    let formFactor = formFormFactor;
    let weightOz = parseFloat(formWeightOz) || 1.0;
    let imageUrl = 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80';
    let productId = isCustomProduct ? `custom-${Date.now()}` : formProductId;

    if (!isCustomProduct) {
      const prodMetric = computedProducts.find((p) => p.product.id === formProductId);
      if (prodMetric) {
        productName = prodMetric.product.name;
        metal = prodMetric.product.metal;
        formFactor = prodMetric.product.formFactor;
        weightOz = prodMetric.product.weightOz;
        imageUrl = prodMetric.product.imageUrl;
      }
    }

    if (metal === 'Silver' && imageUrl.includes('1610375461246')) {
      imageUrl = 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=400&q=80';
    }

    const qty = Math.max(1, parseInt(formQuantity) || 1);
    let rawPrice = parseFloat(formPurchasePrice) || 0;

    // If purchase price was left empty, auto-compute historical price on purchase date!
    if (rawPrice <= 0) {
      const hist = getHistoricalSpotPrice(formDate, metal, weightOz, formFactor);
      rawPrice = formPurchaseCurrency === 'USD' ? hist.estimatedPriceUsd : hist.estimatedPriceSgd;
    }

    let priceSgd = rawPrice;
    let priceUsd = rawPrice;

    if (formPurchaseCurrency === 'USD') {
      priceUsd = rawPrice;
      priceSgd = rawPrice * usdRate;
    } else {
      priceSgd = rawPrice;
      priceUsd = rawPrice / usdRate;
    }

    addOrUpdateOwnedItem({
      id: editingItem?.id,
      userId: user.id,
      productId,
      productName,
      brand: formBrand,
      metal,
      formFactor,
      weightOz,
      imageUrl,
      isOwned: formIsOwned,
      quantity: qty,
      purchasePriceSgd: priceSgd,
      purchasePriceUsd: priceUsd,
      purchaseCurrency: formPurchaseCurrency,
      purchaseDate: formDate,
      retailerAcquired: formRetailer,
      storageNote: formNote,
      invoiceFileName: formInvoiceFileName,
      invoiceDataUrl: formInvoiceDataUrl,
    });

    setIsFormOpen(false);
    refreshItems();
  };

  const handleDeleteItem = (itemId: string) => {
    deleteUserOwnedItem(itemId);
    refreshItems();
  };

  const handleToggleOwnedStatus = (item: UserOwnedItem) => {
    addOrUpdateOwnedItem({
      ...item,
      isOwned: !item.isOwned,
    });
    refreshItems();
  };

  const handleLogout = () => {
    logoutUser();
    onUserUpdated(null);
    onClose();
  };

  // Filter list by owned vs interest and currency filter
  const ownedList = items.filter((i) => i.isOwned);
  const interestList = items.filter((i) => !i.isOwned);

  const filteredOwnedList = ownedList.filter((item) => {
    let currencyMatch = true;
    if (currencyFilter === 'SGD') currencyMatch = item.purchaseCurrency !== 'USD';
    if (currencyFilter === 'USD') currencyMatch = item.purchaseCurrency === 'USD';

    let formFactorMatch = true;
    if (formFactorFilter !== 'ALL') formFactorMatch = item.formFactor === formFactorFilter;

    return currencyMatch && formFactorMatch;
  });

  // Calculate Currency Segregation & Stack Financials
  let sgdPurchasedCount = 0;
  let sgdPurchasedCostSgd = 0;
  let sgdPurchasedLiveValueSgd = 0;

  let usdPurchasedCount = 0;
  let usdPurchasedCostUsd = 0;
  let usdPurchasedLiveValueUsd = 0;

  let totalLiveValueSgd = 0;
  let totalCostBasisSgd = 0;

  let goldTotalCostUsd = 0;
  let goldTotalCostSgd = 0;
  let goldTotalOz = 0;

  let silverTotalCostUsd = 0;
  let silverTotalCostSgd = 0;
  let silverTotalOz = 0;

  let coinsCount = 0;
  let coinsTotalOz = 0;
  let barsCount = 0;
  let barsTotalOz = 0;

  ownedList.forEach((item) => {
    const qty = item.quantity;
    const isUsd = item.purchaseCurrency === 'USD';

    // Find current live dealer market value
    const prodMetric = computedProducts.find((p) => p.product.id === item.productId);
    let unitMarketSgd = item.purchasePriceSgd;
    if (prodMetric) {
      unitMarketSgd = prodMetric.retailerMetrics[prodMetric.bestBuyRetailerId].buyPriceSgd;
    }
    const unitMarketUsd = unitMarketSgd / usdRate;

    const itemTotalCostSgd = item.purchasePriceSgd * qty;
    const itemTotalCostUsd = item.purchasePriceUsd * qty;

    const itemTotalMarketSgd = unitMarketSgd * qty;
    const itemTotalMarketUsd = unitMarketUsd * qty;

    totalCostBasisSgd += itemTotalCostSgd;
    totalLiveValueSgd += itemTotalMarketSgd;

    if (isUsd) {
      usdPurchasedCount += qty;
      usdPurchasedCostUsd += itemTotalCostUsd;
      usdPurchasedLiveValueUsd += itemTotalMarketUsd;
    } else {
      sgdPurchasedCount += qty;
      sgdPurchasedCostSgd += itemTotalCostSgd;
      sgdPurchasedLiveValueSgd += itemTotalMarketSgd;
    }

    if (item.metal === 'Gold') {
      goldTotalOz += item.weightOz * qty;
      goldTotalCostSgd += itemTotalCostSgd;
      goldTotalCostUsd += itemTotalCostUsd;
    } else {
      silverTotalOz += item.weightOz * qty;
      silverTotalCostSgd += itemTotalCostSgd;
      silverTotalCostUsd += itemTotalCostUsd;
    }

    if (item.formFactor === 'Coin') {
      coinsCount += qty;
      coinsTotalOz += item.weightOz * qty;
    } else {
      barsCount += qty;
      barsTotalOz += item.weightOz * qty;
    }
  });

  const totalLiveValueUsd = totalLiveValueSgd / usdRate;
  const totalCostBasisUsd = totalCostBasisSgd / usdRate;
  const totalGainSgd = totalLiveValueSgd - totalCostBasisSgd;
  const totalGainPct = totalCostBasisSgd > 0 ? (totalGainSgd / totalCostBasisSgd) * 100 : 0;

  // Average Price per Ounce (oz) calculations
  const goldAvgPriceUsdPerOz = goldTotalOz > 0 ? goldTotalCostUsd / goldTotalOz : 0;
  const goldAvgPriceSgdPerOz = goldTotalOz > 0 ? goldTotalCostSgd / goldTotalOz : 0;

  const silverAvgPriceUsdPerOz = silverTotalOz > 0 ? silverTotalCostUsd / silverTotalOz : 0;
  const silverAvgPriceSgdPerOz = silverTotalOz > 0 ? silverTotalCostSgd / silverTotalOz : 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-6 cursor-default flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-xl border border-amber-300/40">
              {user.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user.investorType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400 font-mono">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Primary Vault: {user.vaultLocation}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-2 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('STACK')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'STACK'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>My Bullion Stack ({ownedList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('INTEREST')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'INTEREST'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span>Items of Interest ({interestList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'SETTINGS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'STACK' && (
            <div className="space-y-6">
              {/* Financial Dashboard: Combined Totals & Average Price per Ounce */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Combined Value & Profit */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-extrabold text-amber-400 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Total Portfolio Value</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Live Dealer Spot</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Value (SGD)</span>
                      <span className="text-base font-extrabold text-amber-300">
                        S${totalLiveValueSgd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Value (USD)</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        ${totalLiveValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Unrealized P/L:</span>
                    <span className={`font-extrabold ${totalGainSgd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalGainSgd >= 0 ? `+S$${totalGainSgd.toFixed(2)} (+${totalGainPct.toFixed(2)}%)` : `-S$${Math.abs(totalGainSgd).toFixed(2)} (${totalGainPct.toFixed(2)}%)`}
                    </span>
                  </div>
                </div>

                {/* 2. Gold Stack & Average Cost / OZ */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/20 space-y-2">
                  <div className="text-xs font-extrabold text-amber-300 flex items-center justify-between">
                    <span>🥇 Gold Stack & Avg Price / OZ</span>
                    <span className="text-xs font-mono font-extrabold text-amber-400">{goldTotalOz.toFixed(2)} oz</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold">Avg Cost / OZ (USD)</span>
                      <span className="text-sm font-extrabold text-white">
                        {goldTotalOz > 0 ? `$${goldAvgPriceUsdPerOz.toFixed(2)}` : '$0.00'} / oz
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold">Avg Cost / OZ (SGD)</span>
                      <span className="text-sm font-extrabold text-amber-300">
                        {goldTotalOz > 0 ? `S$${goldAvgPriceSgdPerOz.toFixed(2)}` : 'S$0.00'} / oz
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-850 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Gold Total Cost Basis:</span>
                    <span className="font-bold text-slate-200">S${goldTotalCostSgd.toFixed(2)} (${goldTotalCostUsd.toFixed(2)})</span>
                  </div>
                </div>

                {/* 3. Silver Stack & Average Cost / OZ */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700/50 space-y-2">
                  <div className="text-xs font-extrabold text-slate-300 flex items-center justify-between">
                    <span>🥈 Silver Stack & Avg Price / OZ</span>
                    <span className="text-xs font-mono font-extrabold text-slate-300">{silverTotalOz.toFixed(2)} oz</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold">Avg Cost / OZ (USD)</span>
                      <span className="text-sm font-extrabold text-white">
                        {silverTotalOz > 0 ? `$${silverAvgPriceUsdPerOz.toFixed(2)}` : '$0.00'} / oz
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold">Avg Cost / OZ (SGD)</span>
                      <span className="text-sm font-extrabold text-amber-300">
                        {silverTotalOz > 0 ? `S$${silverAvgPriceSgdPerOz.toFixed(2)}` : 'S$0.00'} / oz
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-850 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Silver Total Cost Basis:</span>
                    <span className="font-bold text-slate-200">S${silverTotalCostSgd.toFixed(2)} (${silverTotalCostUsd.toFixed(2)})</span>
                  </div>
                </div>

                {/* 4. Sovereign Coins vs Bullion Bars Breakdown */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700/50 space-y-2 col-span-1 md:col-span-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-white flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Bullion Holdings Breakdown (Sovereign Coins vs Minted Bars)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Total Stack: {(coinsTotalOz + barsTotalOz).toFixed(2)} oz ({coinsCount + barsCount} units)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans font-semibold">🪙 Sovereign Coins</span>
                        <span className="text-sm font-extrabold text-amber-300">{coinsCount} Coins ({coinsTotalOz.toFixed(2)} oz)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {coinsTotalOz + barsTotalOz > 0 ? ((coinsTotalOz / (coinsTotalOz + barsTotalOz)) * 100).toFixed(1) : '0'}% of Stack
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans font-semibold">🧱 Minted & Cast Bars</span>
                        <span className="text-sm font-extrabold text-slate-200">{barsCount} Bars ({barsTotalOz.toFixed(2)} oz)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {coinsTotalOz + barsTotalOz > 0 ? ((barsTotalOz / (coinsTotalOz + barsTotalOz)) * 100).toFixed(1) : '0'}% of Stack
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency Segregation Breakdown Cards (SGD vs USD Purchases) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SGD Holdings */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🇸🇬</span>
                      <h4 className="text-xs font-extrabold text-white">SGD Purchased Holdings</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {sgdPurchasedCount} Items
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Total Cost</span>
                      <span className="font-bold text-slate-200">S${sgdPurchasedCostSgd.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Live Value</span>
                      <span className="font-bold text-amber-300">S${sgdPurchasedLiveValueSgd.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">P/L (SGD)</span>
                      <span
                        className={`font-bold ${
                          sgdPurchasedLiveValueSgd >= sgdPurchasedCostSgd ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {sgdPurchasedLiveValueSgd >= sgdPurchasedCostSgd
                          ? `+S$${(sgdPurchasedLiveValueSgd - sgdPurchasedCostSgd).toFixed(2)}`
                          : `-S$${Math.abs(sgdPurchasedLiveValueSgd - sgdPurchasedCostSgd).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* USD Holdings */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🇺🇸</span>
                      <h4 className="text-xs font-extrabold text-white">USD Purchased Holdings</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {usdPurchasedCount} Items
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Total Cost</span>
                      <span className="font-bold text-slate-200">${usdPurchasedCostUsd.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Live Value</span>
                      <span className="font-bold text-emerald-400">${usdPurchasedLiveValueUsd.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">P/L (USD)</span>
                      <span
                        className={`font-bold ${
                          usdPurchasedLiveValueUsd >= usdPurchasedCostUsd ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {usdPurchasedLiveValueUsd >= usdPurchasedCostUsd
                          ? `+$${(usdPurchasedLiveValueUsd - usdPurchasedCostUsd).toFixed(2)}`
                          : `-$${Math.abs(usdPurchasedLiveValueUsd - usdPurchasedCostUsd).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar, Currency & Form Factor Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Holdings ({filteredOwnedList.length})</span>
                  </h3>

                  {/* Currency Filter Pills */}
                  <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-[10px] font-bold">
                    <button
                      onClick={() => setCurrencyFilter('ALL')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        currencyFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Currencies
                    </button>
                    <button
                      onClick={() => setCurrencyFilter('SGD')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        currencyFilter === 'SGD' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇸🇬 SGD
                    </button>
                    <button
                      onClick={() => setCurrencyFilter('USD')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        currencyFilter === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇺🇸 USD
                    </button>
                  </div>

                  {/* Form Factor Filter Pills */}
                  <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-[10px] font-bold">
                    <button
                      onClick={() => setFormFactorFilter('ALL')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        formFactorFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => setFormFactorFilter('Coin')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        formFactorFilter === 'Coin' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🪙 Sovereign Coins
                    </button>
                    <button
                      onClick={() => setFormFactorFilter('Bar')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        formFactorFilter === 'Bar' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🧱 Bullion Bars
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAddForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Owned Item</span>
                </button>
              </div>

              {/* Owned Items Grid */}
              {filteredOwnedList.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                  <PackageCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-bold">No items match current currency filter.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Click "+ Add Owned Item" to add gold and silver coins or bars with brand, weight, and purchase date.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOwnedList.map((item) => {
                    const prodMetric = computedProducts.find((p) => p.product.id === item.productId);
                    const currentPriceSgd = prodMetric
                      ? prodMetric.retailerMetrics[prodMetric.bestBuyRetailerId].buyPriceSgd
                      : item.purchasePriceSgd;

                    const currentItemTotalSgd = currentPriceSgd * item.quantity;
                    const costItemTotalSgd = item.purchasePriceSgd * item.quantity;
                    const profitSgd = currentItemTotalSgd - costItemTotalSgd;

                    const isUsd = item.purchaseCurrency === 'USD';

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  item.metal === 'Gold' ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 text-slate-950'
                                }`}
                              >
                                {item.metal} {item.formFactor}
                              </span>
                              {item.brand && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 truncate">
                                  {item.brand}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">Qty: {item.quantity}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1 truncate">{item.productName}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                              <span>Acquired: {item.purchaseDate} ({item.retailerAcquired})</span>
                              <span>• {item.weightOz} oz</span>
                            </p>
                          </div>
                        </div>

                        {/* Financial Details Box */}
                        <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-850 grid grid-cols-2 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-slate-500 block font-sans font-semibold">Cost Paid / Unit</span>
                            <span className="text-slate-200 font-bold">
                              {isUsd ? `$${item.purchasePriceUsd.toFixed(2)} USD` : `S$${item.purchasePriceSgd.toFixed(2)} SGD`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block font-sans font-semibold">Current Live Dealer Ask</span>
                            <span className="text-amber-300 font-bold">
                              {isUsd ? `$${(currentPriceSgd / usdRate).toFixed(2)} USD` : `S$${currentPriceSgd.toFixed(2)} SGD`}
                            </span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-sans">Item Total Gain/Loss:</span>
                            <span className={profitSgd >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {profitSgd >= 0
                                ? `+${isUsd ? `$${(profitSgd / usdRate).toFixed(2)} USD` : `S$${profitSgd.toFixed(2)} SGD`}`
                                : `${isUsd ? `-$${Math.abs(profitSgd / usdRate).toFixed(2)} USD` : `-S$${Math.abs(profitSgd).toFixed(2)} SGD`}`}
                            </span>
                          </div>
                        </div>

                        {/* Invoice Attachment Badge */}
                        {item.invoiceFileName && item.invoiceDataUrl && (
                          <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2 text-emerald-300 font-semibold truncate">
                              <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">{item.invoiceFileName}</span>
                            </div>
                            <button
                              onClick={() => setPreviewInvoice({ fileName: item.invoiceFileName!, dataUrl: item.invoiceDataUrl! })}
                              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-slate-950 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer flex-shrink-0"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Invoice</span>
                            </button>
                          </div>
                        )}

                        {item.storageNote && (
                          <p className="text-[10px] text-slate-400 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                            📝 {item.storageNote}
                          </p>
                        )}

                        {/* Controls */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleToggleOwnedStatus(item)}
                            className="text-[10px] font-bold text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <FolderHeart className="w-3 h-3" />
                            <span>Move to Interest Wishlist</span>
                          </button>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenEditForm(item)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
                              title="Edit item details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg hover:bg-rose-950 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'INTEREST' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <FolderHeart className="w-4 h-4 text-amber-400" />
                    <span>Watchlist Items of Interest ({interestList.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Precious metals products you are targeting to purchase or monitor
                  </p>
                </div>

                <button
                  onClick={() => handleOpenAddForm(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Item of Interest</span>
                </button>
              </div>

              {interestList.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                  <FolderHeart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-bold">No items of interest saved yet.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Click "⭐ Interest" on any product card in the main matrix to add items you want to keep an eye on.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interestList.map((item) => {
                    const prodMetric = computedProducts.find((p) => p.product.id === item.productId);
                    const currentPriceSgd = prodMetric
                      ? prodMetric.retailerMetrics[prodMetric.bestBuyRetailerId].buyPriceSgd
                      : item.purchasePriceSgd;
                    const premiumPct = prodMetric ? prodMetric.lowestPremiumPct : 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                item.metal === 'Gold' ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 text-slate-950'
                              }`}
                            >
                              {item.metal} {item.formFactor}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-1 truncate">{item.productName}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Target Watch Quantity: {item.quantity}</p>
                          </div>
                        </div>

                        {/* Price Banner */}
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Best Live Dealer Buy Price</span>
                            <span className="font-mono font-extrabold text-amber-300">S${currentPriceSgd.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-semibold">Lowest Premium</span>
                            <span className="font-mono font-bold text-emerald-400">+{premiumPct.toFixed(2)}%</span>
                          </div>
                        </div>

                        {item.storageNote && (
                          <p className="text-[10px] text-slate-400 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                            📌 {item.storageNote}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleToggleOwnedStatus(item)}
                            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Convert to Purchased Stack Item</span>
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg hover:bg-rose-950 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Account Profile & Storage Preferences</span>
              </h3>

              {settingsSaved && (
                <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Investor Archetype</label>
                <select
                  value={investorType}
                  onChange={(e) => setInvestorType(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Physical Stacker">Physical Stacker (Gold & Silver)</option>
                  <option value="Bullion Collector">Bullion Collector & Numismatist</option>
                  <option value="Institutional Accumulator">Institutional / Vault Client</option>
                  <option value="Retail Investor">Retail Precious Metals Trader</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Vault / Primary Storage Location</label>
                <input
                  type="text"
                  value={vaultLocation}
                  onChange={(e) => setVaultLocation(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Personal Stacker Notes / Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          )}
        </div>

        {/* Modal Form Overlay to Add / Edit Item */}
        {isFormOpen && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center overflow-y-auto">
            <div className="w-full max-w-xl bg-slate-900 border border-amber-500/50 rounded-3xl p-5 space-y-4 shadow-2xl my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{editingItem ? 'Edit Item' : formIsOwned ? 'Add Owned Item to Stack' : 'Add Item of Interest'}</span>
                </h4>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Gold & Silver Spot Prices Market Banner */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5 font-extrabold text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    <span className="text-emerald-400 font-mono">LIVE SPOT PRICES</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    1 USD = <strong className="text-amber-300">S${(spotPrices?.usdToSgdRate || 1.348).toFixed(4)}</strong> SGD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-amber-400 font-bold">🥇 Gold Spot:</span>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-amber-300 text-xs">
                        S${((spotPrices?.goldUsdPerOz || 2380.50) * (spotPrices?.usdToSgdRate || 1.348)).toFixed(2)} SGD
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ${(spotPrices?.goldUsdPerOz || 2380.50).toFixed(2)} USD/oz
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-300 font-bold">🥈 Silver Spot:</span>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-100 text-xs">
                        S${((spotPrices?.silverUsdPerOz || 28.40) * (spotPrices?.usdToSgdRate || 1.348)).toFixed(2)} SGD
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ${(spotPrices?.silverUsdPerOz || 28.40).toFixed(2)} USD/oz
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Optical Invoice Scanner Upload Dropzone */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 via-slate-950 to-emerald-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Upload Original Invoice (AI Auto-Fill)</span>
                  </div>
                  {formInvoiceFileName && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center space-x-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{formInvoiceFileName}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleInvoiceFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanningInvoice}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isScanningInvoice ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>AI Scanning Invoice...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Select / Drag Invoice File (PDF, PNG, JPG)</span>
                      </>
                    )}
                  </button>
                </div>
                {invoiceScanStatus && (
                  <p className="text-[10px] text-amber-300 font-mono italic">{invoiceScanStatus}</p>
                )}
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                {/* Mode Selector: Catalog Search vs Custom Item */}
                <div className="flex items-center justify-between bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCustomProduct(false)}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      !isCustomProduct ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔍 Search Catalog by Brand / Weight / Metal
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomProduct(true)}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      isCustomProduct ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ✍️ Custom Product / Brand Entry
                  </button>
                </div>

                {!isCustomProduct ? (
                  <div className="space-y-2.5">
                    {/* Search Input Filter & Clear Button */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={formSearchQuery}
                        onChange={(e) => setFormSearchQuery(e.target.value)}
                        placeholder="Search catalog keyword (e.g. US Mint, PAMP, RCM, 100 oz, Gold Maple...)"
                        className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-medium"
                      />
                      {(formSearchQuery || selectedBrandFilter !== 'ALL' || selectedMetalFilter !== 'ALL' || selectedWeightFilter !== 'ALL') && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormSearchQuery('');
                            setSelectedBrandFilter('ALL');
                            setSelectedMetalFilter('ALL');
                            setSelectedWeightFilter('ALL');
                          }}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs p-0.5 rounded cursor-pointer"
                          title="Clear all search filters"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Quick Filter Chips */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-[10px] font-bold">
                      <span className="text-slate-500 whitespace-nowrap">Brand:</span>
                      {['ALL', ...ALL_BULLION_BRANDS].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBrandFilter(b)}
                          className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                            selectedBrandFilter === b
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-[10px] font-bold">
                      <span className="text-slate-500">Metal:</span>
                      {['ALL', 'Gold', 'Silver'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMetalFilter(m)}
                          className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                            selectedMetalFilter === m
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                      <span className="text-slate-500 ml-2">Weight:</span>
                      {[
                        { label: 'ALL', val: 'ALL' },
                        { label: '1 g', val: '0.03215' },
                        { label: '10 g', val: '0.3215' },
                        { label: '50 g', val: '1.6075' },
                        { label: '100 g', val: '3.215' },
                        { label: '1/10 oz', val: '0.1' },
                        { label: '1 oz', val: '1' },
                        { label: '10 oz', val: '10' },
                        { label: '1 kg', val: '32.15' },
                        { label: '100 oz', val: '100' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setSelectedWeightFilter(item.val)}
                          className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                            selectedWeightFilter === item.val
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Matching Catalog Products Header & Controls */}
                    {filteredCatalogProducts.length === 0 ? (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                        <p className="text-xs text-slate-400">
                          No dealer catalog products matched your keyword <span className="text-amber-400 font-bold">"{formSearchQuery}"</span> or selected filters.
                        </p>
                        <div className="flex items-center justify-center space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFormSearchQuery('');
                              setSelectedBrandFilter('ALL');
                              setSelectedMetalFilter('ALL');
                              setSelectedWeightFilter('ALL');
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            Reset Search Filters
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCustomProduct(true)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] rounded-lg cursor-pointer"
                          >
                            Use Custom Entry Instead
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-slate-300 font-bold text-xs">
                            Matching Catalog Products ({filteredCatalogProducts.length})
                          </label>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            Select below to auto-fill specs & prices
                          </span>
                        </div>

                        <select
                          value={formProductId}
                          onChange={(e) => {
                            setFormProductId(e.target.value);
                            const prodMetric = computedProducts.find((p) => p.product.id === e.target.value);
                            if (prodMetric) {
                              setFormBrand(detectProductBrand(prodMetric.product.name));
                              setFormMetal(prodMetric.product.metal);
                              setFormFormFactor(prodMetric.product.formFactor);
                              setFormWeightOz(prodMetric.product.weightOz.toString());
                              const bestBuySgd = prodMetric.retailerMetrics[prodMetric.bestBuyRetailerId].buyPriceSgd;
                              setFormPurchasePrice(
                                formPurchaseCurrency === 'USD' ? (bestBuySgd / usdRate).toFixed(2) : bestBuySgd.toFixed(2)
                              );
                            }
                          }}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-500 text-xs"
                        >
                          {filteredCatalogProducts.map((p) => {
                            const bestBuySgd = p.retailerMetrics[p.bestBuyRetailerId]?.buyPriceSgd || 0;
                            const bestBuyUsd = bestBuySgd / usdRate;
                            return (
                              <option key={p.product.id} value={p.product.id}>
                                [{p.product.metal}] {p.product.name} ({p.product.weightOz} oz) — S${bestBuySgd.toFixed(2)} (${bestBuyUsd.toFixed(2)} USD)
                              </option>
                            );
                          })}
                        </select>

                        {/* Visual quick-select cards for top matching items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                          {filteredCatalogProducts.slice(0, 6).map((p) => {
                            const isSelected = p.product.id === formProductId;
                            const bestBuySgd = p.retailerMetrics[p.bestBuyRetailerId]?.buyPriceSgd || 0;
                            const bestBuyUsd = bestBuySgd / usdRate;
                            return (
                              <button
                                key={p.product.id}
                                type="button"
                                onClick={() => {
                                  setFormProductId(p.product.id);
                                  setFormBrand(detectProductBrand(p.product.name));
                                  setFormMetal(p.product.metal);
                                  setFormFormFactor(p.product.formFactor);
                                  setFormWeightOz(p.product.weightOz.toString());
                                  setFormPurchasePrice(
                                    formPurchaseCurrency === 'USD' ? (bestBuySgd / usdRate).toFixed(2) : bestBuySgd.toFixed(2)
                                  );
                                }}
                                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                                  isSelected
                                    ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                }`}
                              >
                                <img
                                  src={p.product.imageUrl}
                                  alt={p.product.name}
                                  className="w-8 h-8 object-contain rounded bg-slate-900 p-0.5 flex-shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0 text-[11px]">
                                  <div className="font-bold truncate leading-tight">{p.product.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {p.product.metal} • {p.product.weightOz} oz • <span className="text-amber-300 font-bold">S${bestBuySgd.toFixed(2)}</span> <span className="text-emerald-400 font-bold">(${bestBuyUsd.toFixed(2)} USD)</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Custom Entry Form */
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-300 font-bold mb-1">Custom Product Name</label>
                      <input
                        type="text"
                        value={formCustomProductName}
                        onChange={(e) => setFormCustomProductName(e.target.value)}
                        placeholder="e.g. 10 oz PAMP Suisse Fortunas Gold Bar"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Brand / Mint Refiner</label>
                      <input
                        type="text"
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        placeholder="e.g. PAMP Suisse, US Mint"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Precious Metal</label>
                      <select
                        value={formMetal}
                        onChange={(e) => setFormMetal(e.target.value as MetalType)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Form Factor</label>
                      <select
                        value={formFormFactor}
                        onChange={(e) => setFormFormFactor(e.target.value as FormFactor)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Coin">Sovereign Coin</option>
                        <option value="Bar">Minted / Cast Bar</option>
                      </select>
                    </div>

                </div>
                )}

                {/* Weight Specification Panel with options in oz and g */}
                <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Item Weight Specification</span>
                    </label>

                    {/* Unit Switcher */}
                    <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => setWeightUnitInput('oz')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          weightUnitInput === 'oz'
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Troy Ounces (oz)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnitInput('g')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          weightUnitInput === 'g'
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Grams (g)
                      </button>
                    </div>
                  </div>

                  {/* Input with Conversion Badge */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="any"
                        min="0.001"
                        value={
                          weightUnitInput === 'g'
                            ? ((parseFloat(formWeightOz) || 0) * 31.1034768).toFixed(
                                ((parseFloat(formWeightOz) || 0) * 31.1034768) < 10 ? 3 : 2
                              )
                            : formWeightOz
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (weightUnitInput === 'g') {
                            const numGrams = parseFloat(val) || 0;
                            setFormWeightOz((numGrams / 31.1034768).toString());
                          } else {
                            setFormWeightOz(val);
                          }
                        }}
                        placeholder={`Enter weight in ${weightUnitInput === 'g' ? 'grams' : 'troy oz'}`}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-500 text-xs pr-12"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-amber-400/80 font-mono">
                        {weightUnitInput === 'g' ? 'g' : 'oz'}
                      </span>
                    </div>

                    {/* Live Conversion Badge */}
                    <div className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-[11px] font-mono text-slate-300 flex-shrink-0">
                      {weightUnitInput === 'g' ? (
                        <span>
                          ≈ <strong className="text-amber-300">{(parseFloat(formWeightOz) || 0).toFixed(3)}</strong> oz
                        </span>
                      ) : (
                        <span>
                          ≈ <strong className="text-amber-300">{((parseFloat(formWeightOz) || 0) * 31.1034768).toFixed(2)}</strong> g
                          {(parseFloat(formWeightOz) || 0) >= 32.1507 && (
                            <span className="text-emerald-400 font-bold ml-1">
                              ({((parseFloat(formWeightOz) || 0) / 32.1507425).toFixed(2)} kg)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Weight Option Presets in Grams (g) and Ounces (oz) */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    {/* Grams (g) Quick Presets */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        ⚖️ Weight Options in Grams (g):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: '1g', oz: 1 / 31.1034768 },
                          { label: '2.5g', oz: 2.5 / 31.1034768 },
                          { label: '5g', oz: 5 / 31.1034768 },
                          { label: '10g', oz: 10 / 31.1034768 },
                          { label: '20g', oz: 20 / 31.1034768 },
                          { label: '50g', oz: 50 / 31.1034768 },
                          { label: '100g', oz: 100 / 31.1034768 },
                          { label: '250g', oz: 250 / 31.1034768 },
                          { label: '500g', oz: 500 / 31.1034768 },
                          { label: '1000g (1kg)', oz: 32.1507425 },
                        ].map((p) => {
                          const isSelected = Math.abs((parseFloat(formWeightOz) || 0) - p.oz) < 0.001;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                setFormWeightOz(p.oz.toString());
                                setWeightUnitInput('g');
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Troy Ounces (oz) Quick Presets */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        👑 Weight Options in Troy Ounces (oz):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: '1/10 oz', oz: 0.1 },
                          { label: '1/4 oz', oz: 0.25 },
                          { label: '1/2 oz', oz: 0.5 },
                          { label: '1 oz', oz: 1.0 },
                          { label: '2 oz', oz: 2.0 },
                          { label: '5 oz', oz: 5.0 },
                          { label: '10 oz', oz: 10.0 },
                          { label: '1 kg (32.15 oz)', oz: 32.1507425 },
                          { label: '50 oz', oz: 50.0 },
                          { label: '100 oz', oz: 100.0 },
                          { label: '1,000 oz', oz: 1000.0 },
                        ].map((p) => {
                          const isSelected = Math.abs((parseFloat(formWeightOz) || 0) - p.oz) < 0.01;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                setFormWeightOz(p.oz.toString());
                                setWeightUnitInput('oz');
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Spot Metal Value Summary for configured item */}
                {(() => {
                  const pOz = parseFloat(formWeightOz) || 0;
                  const pQty = parseInt(formQuantity) || 1;
                  const curSpotUsd = formMetal === 'Gold' ? (spotPrices?.goldUsdPerOz || 2380.50) : (spotPrices?.silverUsdPerOz || 28.40);
                  const meltUsd = pOz * pQty * curSpotUsd;
                  const meltSgd = meltUsd * usdRate;
                  const priceNum = parseFloat(formPurchasePrice) || 0;
                  const paidSgd = formPurchaseCurrency === 'USD' ? priceNum * pQty * usdRate : priceNum * pQty;
                  const premPct = meltSgd > 0 && paidSgd > 0 ? ((paidSgd - meltSgd) / meltSgd) * 100 : null;

                  return (
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-slate-400 font-sans font-bold flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Live Melt Value ({pQty}x {pOz} oz {formMetal}):</span>
                        </div>
                        <div className="font-extrabold text-emerald-300 text-xs">
                          S${meltSgd.toFixed(2)} <span className="text-slate-400 font-normal text-[11px]">(${meltUsd.toFixed(2)} USD)</span>
                        </div>
                      </div>
                      {premPct !== null && (
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-sans font-bold">VS Live Spot:</div>
                          <div className={`font-extrabold text-[11px] ${premPct > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {premPct > 0 ? `+${premPct.toFixed(1)}% Prem` : `${premPct.toFixed(1)}% Spot`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Pricing, Currency, Date, and Historical Lookup Section */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Purchase Currency</label>
                    <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          if (formPurchaseCurrency !== 'SGD') {
                            setFormPurchaseCurrency('SGD');
                            const num = parseFloat(formPurchasePrice) || 0;
                            if (num > 0) setFormPurchasePrice((num * usdRate).toFixed(2));
                          }
                        }}
                        className={`flex-1 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
                          formPurchaseCurrency === 'SGD' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        🇸🇬 SGD (S$)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (formPurchaseCurrency !== 'USD') {
                            setFormPurchaseCurrency('USD');
                            const num = parseFloat(formPurchasePrice) || 0;
                            if (num > 0) setFormPurchasePrice((num / usdRate).toFixed(2));
                          }
                        }}
                        className={`flex-1 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
                          formPurchaseCurrency === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        🇺🇸 USD ($)
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-bold">Purchase Date</label>
                      </div>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => {
                          setFormDate(e.target.value);
                          if (!formPurchasePrice) handleFetchHistoricalPrice(e.target.value);
                        }}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-bold">Purchase Price / Unit</label>
                        <div className="flex items-center space-x-2">
                          {!isCustomProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                const prodMetric = computedProducts.find((p) => p.product.id === formProductId);
                                if (prodMetric) {
                                  const bestBuySgd = prodMetric.retailerMetrics[prodMetric.bestBuyRetailerId].buyPriceSgd;
                                  setFormPurchasePrice(
                                    formPurchaseCurrency === 'USD' ? (bestBuySgd / usdRate).toFixed(2) : bestBuySgd.toFixed(2)
                                  );
                                }
                              }}
                              className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                            >
                              Reset Listed Price
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleFetchHistoricalPrice()}
                            className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Hist. Price</span>
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Leave blank to auto-download hist. price"
                        value={formPurchasePrice}
                        onChange={(e) => setFormPurchasePrice(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Historical Spot Price Info Badge */}
                {historicalInfo && (
                  <div className="p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-[11px] font-mono space-y-1">
                    <div className="text-amber-300 font-bold flex items-center justify-between">
                      <span>📅 Historical LBMA Spot Benchmark ({historicalInfo.date}):</span>
                      <span className="text-emerald-400">Mint Premium: +{historicalInfo.premiumPct}%</span>
                    </div>
                    <div className="text-slate-400 text-[10px] flex justify-between">
                      <span>Gold: ${historicalInfo.goldUsdPerOz}/oz | Silver: ${historicalInfo.silverUsdPerOz}/oz</span>
                      <span>USD/SGD Rate: {historicalInfo.usdToSgdRate}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Retailer / Acquired From</label>
                    <select
                      value={formRetailer}
                      onChange={(e) => setFormRetailer(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Silver Bullion SG">Silver Bullion SG</option>
                      <option value="BullionStar">BullionStar Singapore</option>
                      <option value="LPM HK">LPM Hong Kong</option>
                      <option value="Singapore Mint">Singapore Mint</option>
                      <option value="US Mint Direct">US Mint / APMEX</option>
                      <option value="Other Mint/Dealer">Other Private Dealer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Storage Vault / Storage Note</label>
                    <input
                      type="text"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="e.g. Safe Box #A12"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg cursor-pointer"
                  >
                    Save to Stack
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Preview Modal */}
        {previewInvoice && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md p-6 flex items-center justify-center">
            <div className="w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Invoice Attachment: {previewInvoice.fileName}</span>
                </h4>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-auto border border-slate-800 rounded-xl p-2 bg-slate-950 flex items-center justify-center">
                {previewInvoice.dataUrl.startsWith('data:image') ? (
                  <img src={previewInvoice.dataUrl} alt="Invoice" className="max-w-full h-auto rounded-lg" />
                ) : (
                  <div className="p-6 text-center text-xs text-slate-300 space-y-2">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                    <p className="font-bold">{previewInvoice.fileName}</p>
                    <p className="text-slate-500">Original invoice file attached to this bullion holding.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
