import React, { useState } from 'react';
import '../styles/homepage.css';
import bg from '../../public/buttonBackground.png';
import { PiWalletLight } from "react-icons/pi";

export default function Nav({ onLinkClick, children,buttonText,getProvider,setButtonText,updateUsrObject,deleteUsrObject }) {
  const [activeTab, setActiveTab] = useState('Buy');



  async function connectWallet() {

      if(buttonText!=="Connect Wallet")
      {
        setButtonText("Connect Wallet")
        deleteUsrObject()

      }
      else
      {

        const provider = getProvider(); // see "Detecting the Provider"
        let pubkey58;
        try {
            const resp = await provider.connect();
            console.log(resp.publicKey.toString());
            pubkey58=resp.publicKey.toString();
            updateUsrObject(pubkey58,0)
            const formattedPubkey = pubkey58.length <= 6
            ? pubkey58
            : `${pubkey58.slice(0, 3)}...${pubkey58.slice(-3)}`;
          
          // Now you can use formattedPubkey as needed
          console.log(formattedPubkey);
            console.log(pubkey58)
  
            // console.log(firstThree+"..."+lastThree)
            setButtonText(formattedPubkey)
        } catch (err) {
            alert("Phantom Wallet Needed to use blendhit")
            return
            // { code: 4001, message: 'User rejected the request.' }
        }
        
      }



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
            backgroundPosition: 'center',
            width: 200,
            height: 50, // Ensure a height is set for vertical centering
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none', // Optional: remove border
            cursor: 'pointer', // Optional: change cursor on hover
            padding: 0 // Remove any default padding
        }}>
          <PiWalletLight className='walletIcon' />
          {buttonText}

        </button>
      </div>
      <div className="mobileNav">
        <div className="mobileTop">
          <img src="/polarisTextLogo.png" alt="polaris logo" className="logo" />
          <button onClick={connectWallet} className="connectWallet" style={{
            backgroundImage: `url(${bg.src})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: 200,
            height: 50, // Ensure a height is set for vertical centering
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none', // Optional: remove border
            cursor: 'pointer', // Optional: change cursor on hover
            padding: 0 // Remove any default padding
          }}>
            <PiWalletLight className='walletIcon' />
            {buttonText}
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
