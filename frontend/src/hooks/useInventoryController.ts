import { useState, useEffect } from 'react';
import useTownController from './useTownController';
import { ItemDetails } from '../types/CoveyTownSocket';

export function useInventory(userId: string) {
    const [inventory, setInventory] = useState<ItemDetails[]>([]);
    const [visibleInventory, setVisibleInventory] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const coveyTownController = useTownController();
 
    useEffect(() => {
        async function fetchItems(inventoryResponse : {items: ItemDetails[], userID: string}) {
          console.log(userId);
            if (inventoryResponse.userID !== userId) return;
            try {
                setInventory(inventoryResponse.items);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        }
        coveyTownController.addListener('inventoryChanged', fetchItems);
        
        coveyTownController.getPlayerInventory(userId);

        // const intervalId = setInterval(coveyTownController.getPlayerInventory, 30000);
        return () => {
            coveyTownController.removeListener('inventoryChanged', fetchItems);
            // return () => clearInterval(intervalId);
        };
    }, [coveyTownController, userId]);
    
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'i' || event.key === 'I') {
        setVisibleInventory(prevVisible => !prevVisible);
      }
      if (event.key === 't' || event.key === 'T') {
        setVisibleInventory(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // when visibility changes, update the inventory
  useEffect(() => {
    if (visibleInventory) {
      coveyTownController.getPlayerInventory(userId);
    }
  }, [coveyTownController, userId, visibleInventory]);
  
  return { inventory, loading, visibleInventory };
};