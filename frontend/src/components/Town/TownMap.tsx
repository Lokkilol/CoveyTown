import React from 'react'
import Phaser from 'phaser';
import { useEffect } from 'react';
import useTownController from '../../hooks/useTownController';
import SocialSidebar from '../SocialSidebar/SocialSidebar';
import Inventory from '../Inventory/Inventory';
import CoinBalance from '../Currency/CoveyCoinBalance';
import NewConversationModal from './interactables/NewCoversationModal';
import { useAuth0 } from '@auth0/auth0-react';
import TownGameScene from './TownGameScene';
import PosterViewerWrapper from './interactables/PosterViewer';
import WelcomeBack from '../Login/WelcomeBack/WelcomeBack';
import TradingView from '../Trading/TradingView';


export default function TownMap(): JSX.Element {
  
  const coveyTownController = useTownController();

  const { user } = useAuth0();
  
  // Calls the get player inventory API call every thirty seconds to populate the user's inventory.

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      parent: 'map-container',
      render: { pixelArt: true, powerPreference: 'high-performance' },
      scale: {
        expandParent: false,
        mode: Phaser.Scale.ScaleModes.WIDTH_CONTROLS_HEIGHT,
        autoRound: true,
      },
      width: 800,
      height: 600,
      fps: { target: 30 },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };

    const game = new Phaser.Game(config);
    const newGameScene = new TownGameScene(coveyTownController);
    game.scene.add('coveyBoard', newGameScene, true);
    const pauseListener = newGameScene.pause.bind(newGameScene);
    const unPauseListener = newGameScene.resume.bind(newGameScene);
    coveyTownController.addListener('pause', pauseListener);
    coveyTownController.addListener('unPause', unPauseListener);
    return () => {
      coveyTownController.removeListener('pause', pauseListener);
      coveyTownController.removeListener('unPause', unPauseListener);
      game.destroy(true);
    };
  }, [coveyTownController]);
  // fetch data and populate items like that.
  if (user?.sub) {

    return (
      <div id='app-container'>
        <NewConversationModal />
        <PosterViewerWrapper />
        <TradingView userId={user?.sub.substring(6)}/>

        <WelcomeBack
          userId={user?.sub.substring(6)}
        />
        <Inventory userId={user?.sub.substring(6)} />

        <div id='map-container' />
        <CoinBalance userId={user?.sub.substring(6)} coinImage='/assets/CoveyCoin.png' />
        <div id='social-container'>
          <SocialSidebar />
        </div>
      </div>
    );
  }
  return <div />;
}
