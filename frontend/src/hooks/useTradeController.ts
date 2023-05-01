import  { useState, useEffect, useCallback } from 'react';
import useTownController from './useTownController';
import { Trades } from '../generated/client';
import { TradeDetails } from '../types/CoveyTownSocket';

export function useTrade(userId: string) {

  const coveyTownController = useTownController();

  const [visibleTrades, setVisibleTrades] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);

  const [trades, setTrades] = useState<TradeDetails[]>([]);
  
  // Calls the get player inventory API call every thirty seconds to populate the user's inventory.
  const tradesToDetails = useCallback(async (activeTrades: Trades[]) => {
    const tradeDetailsList: TradeDetails[] = [];
    await( async () => { for (const x of activeTrades) {
      const userName = await coveyTownController.getUserName(x.seller_id)
      const itemName = (await coveyTownController.getItemById(x.item_id)).item_name
      const tradeDetail : TradeDetails = {trade: x, seller_username: userName, item_name: itemName}
      tradeDetailsList.push(tradeDetail);
    } })()
    setTrades(tradeDetailsList);
  }, [coveyTownController])

  useEffect(() => {
        async function fetchTrades(activeTrades: Trades[]) {          
            try {
              tradesToDetails(activeTrades)
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        }
        
        coveyTownController.addListener('tradeChanged', fetchTrades);
        
        coveyTownController.getActiveTrades()

        // const intervalId = setInterval(coveyTownController.getPlayerInventory, 30000);
        return () => {
            coveyTownController.removeListener('tradeChanged', fetchTrades);
            // return () => clearInterval(intervalId);
        };
    }, [coveyTownController, tradesToDetails, userId]);

  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.key === 't' || event.key === 'T') {
        setVisibleTrades(prevVisible => !prevVisible);
        tradesToDetails(await coveyTownController.getActiveTrades())
      }
      if (event.key === 'i' || event.key === 'I') {
        setVisibleTrades(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [coveyTownController, tradesToDetails]);

  useEffect(() => {
    if (visibleTrades) {
      coveyTownController.getActiveTrades()
    }
  }, [coveyTownController, userId, visibleTrades]);
  
  return { trades, loading, visibleTrades };
}