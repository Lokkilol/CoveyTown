import React, { useCallback } from 'react';
import { Heading, StackDivider, VStack, HStack, useToast } from '@chakra-ui/react';
import { CreateTrade, ItemDetails } from '../../types/CoveyTownSocket';
import { useInventory } from '../../hooks/useInventoryController';
import useTownController from '../../hooks/useTownController';

// function Item(item: ItemDetails, townController: TownController): JSX.Element {
  
//   return (
    
//   );
// }

export default function Inventory(props: {userId: string}): JSX.Element {
  const coveyTownController = useTownController();
  const toast = useToast();
  
  const createTrade = useCallback(async (item: ItemDetails, trade: CreateTrade) => {
    await( () => { const value = prompt('Please enter a value:');
    if (value === null) {
    throw new Error('Value not provided');
    }
    console.log('running function')
    trade.requested_price = parseInt(value);})();
    
    await coveyTownController.createTrade(item.slot, trade)
    coveyTownController.getPlayerInventory(props.userId)
          toast({
          title: 'Item Was Put on Trades Successfully',
          status: 'success',
          containerStyle: {
            width: '800px',
            maxWidth: '100%',
          },
          position: 'top'
        });
  }, [coveyTownController, props.userId, toast]);
  const { inventory, visibleInventory } = useInventory(props.userId);
  const itemsPerRow = 5;
  const rows = [];


  for (let i = 0; i < inventory.length; i += itemsPerRow) {
    rows.push(inventory.slice(i, i + itemsPerRow)); // Push a sub-array of items into the rows array
  }

  return (
    <div id='inventory-container' style={{ display: visibleInventory ? 'block' : 'none' }}>
      <VStack
        align='center'
        spacing={2}
        borderWidth='5px'
        padding={2}
        marginLeft={2}
        borderColor='black'
        position='absolute'
        top='25%'
        left='5%'
        width='75%'
        height='50%'
        opacity='85%'
        divider={<StackDivider borderColor='gray.200' />}
        borderRadius='4px'
        backgroundColor={'gray.500'}>
        <Heading fontSize='2em' as='h1' color='white' font-family="'Courier New', Courier, monospace">
        INVENTORY 
      </Heading>
        {rows.map((row, col) => (
          <HStack key={col} spacing='20px'>
            {row.map(item => (
              <HStack key={item.item_id} spacing='20px'>
                <div className='item-container'>
                <div className='slot'> {item.slot}</div>
                <div className='item-name'> {item.item_name}</div>
                {
                  <div className='item-details'>
                    <button className='trade-button' onClick={() => createTrade(item, {trade_id: 100, seller_id: props.userId, item_id: item.item_id, requested_price: 10})}> Trade </button>
                  </div>
                }
                </div>
              </HStack>
            ))}
          </HStack>
        ))}
      </VStack>
    </div>
  );
}
