"use client"

import React, { useState } from 'react'; // Import React and useState
import '../styles/homepage.css';
import bg from '../../public/buttonBackground.png';
import { PiWalletLight } from "react-icons/pi";

export default function Nav() {
  const [activeLink, setActiveLink] = useState('Buy'); // State to track the active link

  function connectWallet() {
    alert("Connect Wallet");
  }

  // Function to update the active link
  function handleLinkClick(linkName) {
    setActiveLink(linkName);
  }

  return (
    <nav style={{ marginTop: -10, marginBottom: 0 }}>
      <img src="/polarisTextLogo.png" alt="polaris logo" className="logo" />
      <div className="middleLinks">
        <h2 className={activeLink === 'Buy' ? 'active' : ''} onClick={() => handleLinkClick('Buy')}>
          <span>01</span>Buy
        </h2>
        <h2 className={activeLink === 'Sell' ? 'active' : ''} onClick={() => handleLinkClick('Sell')}>
          <span>02</span>Sell
        </h2>
        <h2 className={activeLink === 'Earn' ? 'active' : ''} onClick={() => handleLinkClick('Earn')}>
          <span>03</span>Earn
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
    </nav>
  );
}
