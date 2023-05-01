import { Heading, StackDivider, VStack, HStack, useToast } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { CurrencyResponse} from '../../types/CoveyTownSocket';
import { useTrade } from '../../hooks/useTradeController';
import { Trades } from '../../generated/client';
import useTownController from '../../hooks/useTownController';


export default function TradingView(props: {userId: string}): JSX.Element {
  const coveyTownController = useTownController();
  const { trades, visibleTrades} = useTrade(props.userId);
  


  const toast = useToast();

  const acceptTrade = useCallback(async (trade: Trades, userId: string) => {
    // console.log('running function')
      const currencyNumResponse: CurrencyResponse = await coveyTownController.getCurrency(userId);
      
      const currencyNum: number = currencyNumResponse.coins;
      // console.log(currencyNumResponse)
      // console.log(currencyNum);
      if (currencyNum < trade.requested_price) {
        toast({
          title: 'Not Enough Coins To trade this item',
          status: 'error',
          containerStyle: {
            width: '800px',
            maxWidth: '100%',
          },
          position: 'top'
        });
      }
      else {
        // console.log(trade.trade_id);
        if (trade.trade_id) {
          await coveyTownController.acceptTrade(trade.trade_id, userId)
          toast({
          title: 'Item Was Purchased Successfully',
          status: 'success',
          containerStyle: {
            width: '800px',
            maxWidth: '100%',
          },
          position: 'top'
        });
      }
    }
  }, [coveyTownController, toast]);
  return (
    <div id='trade-container' style={{ display: visibleTrades ? 'block' : 'none' }}>
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
      overflowY='auto'
      borderRadius='4px'
      backgroundColor={'gray.500'}>
      <Heading fontSize='2em' as='h1' color='white' font-family="'Courier New', Courier, monospace">
        TRADES
      </Heading>
      {trades.map(trade => (
        <HStack key={trade.trade.trade_id} spacing='20px'>
            <div className='trade-container'>
            <div className='trade-id'>
              Item : {trade.item_name} 
              <br />
              Requested Price: {trade.trade.requested_price} coins
              <br />
              Seller: {trade.seller_username }
            </div>
            <button className='accept-trade-button' onClick={() => 
             { acceptTrade(trade.trade, props.userId) }} > Accept </button>
          </div>
        
          
        </HStack>
      ))}
    </VStack>
    </div>
  );
}
