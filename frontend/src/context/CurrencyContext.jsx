import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.50, label: 'INR (₹)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'GBP (£)' },
};

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('smartcart_currency') || 'USD';
  });

  const activeCurrency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  useEffect(() => {
    localStorage.setItem('smartcart_currency', currencyCode);
  }, [currencyCode]);

  const convertPrice = (usdAmount) => {
    if (usdAmount === null || usdAmount === undefined) return 0;
    const num = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
    return num * activeCurrency.rate;
  };

  const formatPrice = (usdAmount) => {
    if (usdAmount === null || usdAmount === undefined) return `${activeCurrency.symbol}0.00`;
    const converted = convertPrice(usdAmount);
    return `${activeCurrency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: activeCurrency,
        currencyCode,
        setCurrency: setCurrencyCode,
        convertPrice,
        formatPrice,
        availableCurrencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
