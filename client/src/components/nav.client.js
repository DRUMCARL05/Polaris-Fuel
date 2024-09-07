import React, { useState } from "react";
import "../styles/homepage.css";
import bg from "../../public/buttonBackground.png";
import { PiWalletLight } from "react-icons/pi";

export default function Nav({
  onLinkClick,
  children,
  buttonText,
  getProvider,
  setButtonText,
  updateUsrObject,
  deleteUsrObject,
  connectWallet,
}) {
  const [activeTab, setActiveTab] = useState("Buy");

  function handleLinkClick(link) {
    setActiveTab(link);
    onLinkClick(link);
  }

  return (
    <nav className="nav">
      <div className="desktopNav">
        <img
          style={{ userSelect: "none" }}
          draggable="false"
          src="/polarisTextLogo.png"
          alt="polaris logo"
          className="logo"
        />
        <div className="middleLinks">
          <h2
            className={activeTab === "Buy" ? "active" : ""}
            onClick={() => handleLinkClick("Buy")}
          >
            <span></span>Buy
          </h2>
          <h2
            className={activeTab === "Sell" ? "active" : ""}
            onClick={() => handleLinkClick("Sell")}
          >
            <span></span>Sell
          </h2>
          <h2
            className={activeTab === "Earn" ? "active" : ""}
            onClick={() => handleLinkClick("Earn")}
          >
            <span></span>Earn
          </h2>
        </div>
        <button
          onClick={connectWallet}
          className="connectWallet"
          style={{
            backgroundImage: `url(${bg.src})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: 200,
            height: 50, // Ensure a height is set for vertical centering
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "none", // Optional: remove border
            cursor: "pointer", // Optional: change cursor on hover
            padding: 0, // Remove any default padding
            userSelect: "none",
          }}
        >
          <PiWalletLight className="walletIcon" />
          {buttonText}
        </button>
      </div>
      <div className="mobileNav">
        <div className="mobileTop">
          <img src="/polarisTextLogo.png" alt="polaris logo" className="logo" />
          <button
            onClick={connectWallet}
            className="connectWallet"
            style={{
              backgroundImage: `url(${bg.src})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: 200,
              height: 50, // Ensure a height is set for vertical centering
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "none", // Optional: remove border
              cursor: "pointer", // Optional: change cursor on hover
              padding: 0, // Remove any default padding
            }}
          >
            <PiWalletLight className="walletIcon" />
            {buttonText}
          </button>
        </div>
        <div className="mobileTabs">
          <button
            onClick={() => handleLinkClick("Buy")}
            className={activeTab === "Buy" ? "active" : ""}
          >
            BUY
          </button>
          <button
            onClick={() => handleLinkClick("Sell")}
            className={activeTab === "Sell" ? "active" : ""}
          >
            SELL
          </button>
          <button
            onClick={() => handleLinkClick("Earn")}
            className={activeTab === "Earn" ? "active" : ""}
          >
            EARN
          </button>
        </div>
      </div>
      {activeTab === "Earn" ? (
        <div className="earnImageContainer">
          <h2>Coming Soon!</h2>
        </div>
      ) : (
        <div className="mainContent">{children}</div>
      )}
    </nav>
  );
}
