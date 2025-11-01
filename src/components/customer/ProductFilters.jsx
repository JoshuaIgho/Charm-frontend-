import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const ProductFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    features: true
  });

  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange({
      min: filters.minPrice || '',
      max: filters.maxPrice || ''
    });
  }, [filters]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    
    const newFilters = {
      ...localFilters,
      minPrice: newRange.min,
      maxPrice: newRange.max
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // ✅ FIXED: Match schema's categoryType field options
  const categories = [
    { value: 'rings', label: 'Rings' },
    { value: 'necklaces', label: 'Necklaces' },
    { value: 'earrings', label: 'Earrings' },
    { value: 'bracelets', label: 'Bracelets' },
    { value: 'anklets', label: 'Anklets' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const priceRanges = [
    { min: 0, max: 10000, label: 'Under ₦10,000' },
    { min: 10000, max: 25000, label: '₦10,000 - ₦25,000' },
    { min: 25000, max: 50000, label: '₦25,000 - ₦50,000' },
    { min: 50000, max: 100000, label: '₦50,000 - ₦100,000' },
    { min: 100000, max: '', label: 'Above ₦100,000' } // ✅ Use empty string instead of null
  ];

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value && value !== '' && value !== false
  );

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isExpanded && <div className="mt-3">{children}</div>}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-0">
        {/* Categories */}
        <FilterSection
          title="Categories"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
        >
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={localFilters.category === category.value}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{category.label}</span>
              </label>
            ))}
            {localFilters.category && (
              <button
                onClick={() => handleFilterChange('category', '')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Show All Categories
              </button>
            )}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            {/* Quick Price Ranges */}
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={
                      localFilters.minPrice == range.min && 
                      localFilters.maxPrice == range.max
                    }
                    onChange={() => {
                      handlePriceChange('min', range.min.toString());
                      handlePriceChange('max', range.max.toString());
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>

            {/* Custom Price Range */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-3">Custom Range</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Special Features - ✅ FIXED: Use correct field names */}
        <FilterSection
          title="Special Features"
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
        >
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.isOnSale || false}
                onChange={(e) => handleFilterChange('isOnSale', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">On Sale</span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.isNewStock || false}
                onChange={(e) => handleFilterChange('isNewStock', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">New Arrivals</span>
            </label>
          </div>
        </FilterSection>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {localFilters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                {categories.find(c => c.value === localFilters.category)?.label}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {(localFilters.minPrice || localFilters.maxPrice) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                ₦{localFilters.minPrice || '0'} - ₦{localFilters.maxPrice || '∞'}
                <button
                  onClick={() => {
                    handlePriceChange('min', '');
                    handlePriceChange('max', '');
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.isOnSale && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                On Sale
                <button
                  onClick={() => handleFilterChange('isOnSale', false)}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.isNewStock && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                New Arrivals
                <button
                  onClick={() => handleFilterChange('isNewStock', false)}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;