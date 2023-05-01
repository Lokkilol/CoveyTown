import {
  Button,
 
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  StackDivider,
  VStack,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../classes/TownController';
import { CurrencyResponse } from '../../../generated/client';
import useTownController from '../../../hooks/useTownController';
import { ItemDetails, ItemWithCost } from '../../../types/CoveyTownSocket';
import { useAuth0 } from '@auth0/auth0-react';

export default function NewConversationModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newConversation = useInteractable('conversationArea');
  const [shop, setShop] = useState<ItemWithCost[]>([]);
  const { user } = useAuth0();
  const isOpen = newConversation !== undefined;

  useEffect(() => {
    if (newConversation) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
    (async () => {
      const items = await coveyTownController.getShopItems();
      const itemsWithCost: ItemWithCost[] = []
      for (let index = 0; index < items.length; index++) {
        const itemWithCost = await coveyTownController.getItemById(items[index].item_id);
        itemsWithCost.push(itemWithCost)
        
      }
      setShop(itemsWithCost); 
    })();

  }, [coveyTownController, newConversation]);

  const closeModal = useCallback(() => {
    if (newConversation) {
      coveyTownController.interactEnd(newConversation);
    }
  }, [coveyTownController, newConversation]);

  const toast = useToast();


  const buyItem = useCallback(async (itemWithDetailsCost: ItemWithCost) => {
    if (user?.sub) {
      const itemWithDetails: ItemWithCost = itemWithDetailsCost;
      console.log(itemWithDetails);
      const currencyNumResponse: CurrencyResponse = await coveyTownController.getCurrency(user?.sub?.substring(6));
      const currencyNum: number = currencyNumResponse.coins;
      const itemsOfUser: ItemDetails[] =  await coveyTownController.getPlayerInventory(user.sub.substring(6))
      const slots: number[] = [];
      for (let index = 0; index < itemsOfUser.length; index++) {
        slots.push(itemsOfUser[index].slot);
      }
      let i = 0
      let slotIsfound = false;
      while(!slotIsfound) {
        if(!slots.includes(i)) {
          slotIsfound = true;
        }
        else {
          i++;
        }
      }
      console.log(currencyNum);
      if (currencyNum < itemWithDetails.cost) {
        toast({
          title: 'Not Enough Coins To But this item',
          status: 'error',
        });
      }
      else {
        await coveyTownController.distributeCurrency(user?.sub?.substring(6), { amount: -itemWithDetails.cost });
        await coveyTownController.addItemToInventory(user?.sub?.substring(6), itemWithDetails.item_id, itemWithDetails.item_name, i)
        toast({
          title: 'Item Was Purchased Sucessfully',
          status: 'success',
        });
        closeModal();
      }
    
    }
  }, [closeModal, coveyTownController, toast, user?.sub]);


  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior = 'inside'
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Shop. Select which item you would like to purchase</ModalHeader>
        <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack
            divider={<StackDivider borderColor='gray.200' />}
            spacing={4}
            align='stretch'
            >
              {shop.map((item) => (
                <div key ={item.item_id}>
                <Button key ={item.item_id} colorScheme='blue' mr={3} onClick = {() => buyItem(item)}>
                 {item.item_name} 
                </Button>
                <br></br>
                Cost: {item.cost} coins
                </div>
              ))}
            </VStack>
            
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
