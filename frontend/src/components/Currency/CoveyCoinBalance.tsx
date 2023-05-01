import React, { useState } from 'react';
import './CoinBalance.css';
import { useSpring, animated } from 'react-spring';
import { useCurrency, CurrencyAmountChange } from '../../hooks/useCurrencyController';

interface CoinBalanceProps {
  userId: string;
  coinImage: string;
}

export default function CoinBalance(props: CoinBalanceProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { currency, loading, change, prevCurrencyRef } = useCurrency(props.userId);
  const springProps = useSpring<{val: number, from: number}>({ val: currency, from:  { val: prevCurrencyRef.current }});

  if (loading) {
    return <p>Loading...</p>;
  }
  if (currency == null) {
    return <p>Error: Unable to fetch currency data</p>;
  }

  let className = 'coin-balance currency-display';
  if (change === CurrencyAmountChange.Increase) {
    className += ' increase';
  } else if (change === CurrencyAmountChange.Decrease) {
    className += ' decrease';
  }
  
  return (
    <div
    className={className}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}>
      <img src={props.coinImage} alt='Coins' className='coin-image' />
      <animated.span className="coin-amount number">
        {springProps.val.interpolate(val => Math.floor(val))}
      </animated.span>
      {showTooltip && (
        <div className='coin-balance-tooltip'>
          <p>Your current coin balance is:</p>
          <p>
            <strong>{currency} coins</strong>
          </p>
        </div>
      )}
    </div>
  );
}
