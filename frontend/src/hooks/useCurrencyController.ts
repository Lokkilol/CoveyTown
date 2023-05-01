import { useState, useEffect, useRef } from 'react';
import useTownController from './useTownController';
import { CurrencyResponse } from '../generated/client';

export enum CurrencyAmountChange {
  Increase,
  Decrease,
  NoChange,
}

export function useCurrency(userId: string) {
  const [currency, setCurrency] = useState<number>(0);
  const [change, setChange] = useState<CurrencyAmountChange>(CurrencyAmountChange.NoChange);
  const [loading, setLoading] = useState<boolean>(true);
  const prevCurrencyRef = useRef<number>(0);
  const townController = useTownController();

  useEffect(() => {
    const fetchCurrency = async (currencyResponse: CurrencyResponse) => {
      if (currencyResponse.userID !== userId) return;
      try {
        setCurrency(currencyResponse.coins);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching currency data:', error);
        setLoading(false);
      }
    };
    townController.addListener('currencyChanged', fetchCurrency);
    townController.getCurrency(userId);
    return () => {
      townController.removeListener('currencyChanged', fetchCurrency);
    };
  }, [townController, setCurrency, userId]);

  useEffect(() => {
    if (prevCurrencyRef.current === null) {
      prevCurrencyRef.current = currency;
      return;
    }

    if (currency !== null) {
      if (currency > prevCurrencyRef.current) {
        setChange(CurrencyAmountChange.Increase);
      } else if (currency < prevCurrencyRef.current) {
        setChange(CurrencyAmountChange.Decrease);
      } else {
        setChange(CurrencyAmountChange.NoChange);
      }
    }
    prevCurrencyRef.current = currency;

    const timerId = setTimeout(() => setChange(CurrencyAmountChange.NoChange), 1000);

    return () => clearTimeout(timerId);
  }, [currency]);

  return { currency, loading, change, prevCurrencyRef};
};