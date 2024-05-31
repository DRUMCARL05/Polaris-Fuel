import React, { useState } from 'react';
import '../styles/homepage.css';
import bg from '../../public/buttonBackground.png';
import { PiWalletLight } from "react-icons/pi";

export default function Nav({ onLinkClick, children }) {
  const [activeTab, setActiveTab] = useState('Buy');

  function connectWallet() {
    alert("Connect Wallet");
  }

  function handleLinkClick(link) {
    setActiveTab(link);
    onLinkClick(link);
  }

  return (
    <nav className="nav">
      <div className="desktopNav">
        <img src="/polarisTextLogo.png" alt="polaris logo" className="logo" />
        <div className="middleLinks">
          <h2 className={activeTab === 'Buy' ? 'active' : ''} onClick={() => handleLinkClick('Buy')}>
            <span></span>Buy
          </h2>
          <h2 className={activeTab === 'Sell' ? 'active' : ''} onClick={() => handleLinkClick('Sell')}>
            <span></span>Sell
          </h2>
          <h2 className={activeTab === 'Earn' ? 'active' : ''} onClick={() => handleLinkClick('Earn')}>
            <span></span>Earn
          </h2>
        </div>
        <button onClick={connectWallet} className="connectWallet" style={{
          backgroundImage: `url(${bg.src})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}>
          <PiWalletLight className='walletIcon' />
          Connect Wallet
        </button>
      </div>
      <div className="mobileNav">
        <div className="mobileTop">
          <img src="/polarisTextLogo.png" alt="polaris logo" className="logo" />
          <button onClick={connectWallet} className="connectWallet" style={{
            backgroundImage: `url(${bg.src})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}>
            <PiWalletLight className='walletIcon' />
            Connect Wallet
          </button>
        </div>
        <div className="mobileTabs">
          <button 
            onClick={() => handleLinkClick('Buy')}
            className={activeTab === 'Buy' ? "active" : ""}
          >
            BUY
          </button>
          <button 
            onClick={() => handleLinkClick('Sell')} 
            className={activeTab === 'Sell' ? "active" : ""}
          >
            SELL
          </button>
          <button 
            onClick={() => handleLinkClick('Earn')} 
            className={activeTab === 'Earn' ? "active" : ""}
          >
            EARN
          </button>
        </div>
      </div>
      {activeTab === 'Earn' ? (
        <div className="earnImageContainer">
          <h2>Coming Soon!</h2>
        </div>
      ) : (
        <div className="mainContent">
          {children}
        </div>
      )}
    </nav>
  );
}
