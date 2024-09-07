"use client";

import React from "react";
import styles from "../styles/scroller.module.css";
import { LuInfo } from "react-icons/lu";
import bg from "../../public/backgroundButtonManage.png";
import { PiWalletLight } from "react-icons/pi";

export default function Mobile({
  categories,
  activeTab,
  numberToScale,
  isBuyLoading,
  indexA,
  indexB,
  handleMultiplier,
  buttonClick,
  connectWallet,
  buttonText,
  handleLinkClick,
}) {
  if (
    !categories ||
    categories.length < 2 ||
    !categories[indexA]?.assets?.length
  ) {
    return <div>No valid categories or assets available</div>;
  }

  const asset = categories[indexA].assets[indexB];

  const renderPriceInfo = (price, multiplier, minQty) =>
    Number.isNaN((price * multiplier) / (minQty * multiplier))
      ? 0
      : (price * multiplier) / (minQty * multiplier);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <img
          style={{ userSelect: "none", height: 50 }}
          draggable="false"
          src="/polarisTextLogo.png"
          alt="polaris logo"
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "0 1.5rem",
          alignItems: "center",
          marginTop: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            gap: "10px",
            padding: "1rem 0",
          }}
        >
          <button
            onClick={() => handleLinkClick("Buy")}
            style={{
              width: "90%",
              backgroundColor: activeTab === "Buy" ? "#ff7129" : "#303030",
              color: activeTab === "Buy" ? "#fff" : "#acacac",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
              outline: "none",
              textAlign: "center",
            }}
          >
            BUY
          </button>
          <button
            onClick={() => handleLinkClick("Sell")}
            style={{
              width: "90%",
              backgroundColor: activeTab === "Sell" ? "#ff7129" : "#303030",
              color: activeTab === "Sell" ? "#fff" : "#acacac",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
              outline: "none",
              textAlign: "center",
            }}
          >
            SELL
          </button>
          <button
            onClick={() => alert("Earn Feature Coming Soon")}
            style={{
              width: "90%",
              backgroundColor: activeTab === "Earn" ? "#ff7129" : "#303030",
              color: activeTab === "Earn" ? "#fff" : "#acacac",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
              outline: "none",
              textAlign: "center",
            }}
          >
            EARN
          </button>
        </div>
      </div>

      <div
        key={`${indexA}-${indexB}`}
        className={styles.desktopAsset}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: -20,
        }}
      >
        <div className={styles.details}>
          <div className={styles.topSection}>
            <div className={styles.leftPart}>
              <h2 className={styles.foodName}>{asset.name}</h2>
              {activeTab === "Buy" ? (
                <div>
                  <h3 className={styles.rarity}>
                    <img
                      style={{ marginTop: -1, width: 15, marginLeft: 0 }}
                      src={asset.image}
                      alt={asset.name}
                    />
                    {numberToScale(asset.resourceBalanceinVault)}
                  </h3>
                  <h3 className={styles.rarity}>
                    <img
                      style={{ marginTop: 2 }}
                      src="/atlasIcon.svg"
                      alt="Atlas Icon"
                    />
                    {renderPriceInfo(
                      asset.buy_price,
                      asset.multiplier,
                      asset.minimum_buy_qty
                    )}
                  </h3>
                </div>
              ) : (
                <div>
                  <h3 className={styles.rarity}>
                    <img
                      style={{ marginTop: 4, marginLeft: 0 }}
                      src="/atlasIcon.svg"
                      alt="Atlas Icon"
                    />
                    {numberToScale(asset.atlasBalanceInVault)}
                  </h3>
                  <h3 className={styles.rarity}>
                    <img
                      style={{ marginTop: 2 }}
                      src="/atlasIcon.svg"
                      alt="Atlas Icon"
                    />
                    {renderPriceInfo(
                      asset.sell_price,
                      asset.multiplier,
                      asset.minimum_sell_qty
                    )}
                  </h3>
                </div>
              )}
            </div>
            {asset.soldOut ? (
              <img
                draggable={false}
                src={`${asset.image.slice(0, -4)}so.png`}
                alt={asset.name}
                className={styles.assetImage}
              />
            ) : (
              <img
                draggable={false}
                src={asset.image}
                alt={asset.name}
                className={styles.assetImage}
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              textAlign: "left",
              marginTop: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div className={styles.buying}>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  opacity: 0.4,
                }}
              >
                {activeTab === "Buy" ? "Buying amount" : "Selling amount"}
              </p>
              <p className={styles.buyingAmount}>
                {numberToScale(
                  activeTab === "Buy"
                    ? asset.minimum_buy_qty * asset.multiplier
                    : asset.minimum_sell_qty * asset.multiplier
                )}
              </p>
            </div>
            <div className={styles.totalCost}>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  opacity: 0.4,
                }}
              >
                {activeTab === "Buy" ? "Total Cost" : "Total Earnings"}
              </p>
              <p className={styles.totalCostAmount}>
                {numberToScale(
                  activeTab === "Buy"
                    ? asset.buy_price * asset.multiplier
                    : asset.sell_price * asset.multiplier
                )}
                <img
                  style={{ marginTop: 1 }}
                  src="/atlasIcon.svg"
                  alt="Atlas Icon"
                />
              </p>
            </div>
          </div>

          <div className={styles.manageBuyingAmount}>
            <div className={styles.topSectionManage}>
              <h4 className={styles.headingManage}>
                {activeTab === "Buy"
                  ? "Manage Buying Amount"
                  : "Manage Selling Amount"}
              </h4>
              <LuInfo style={{ opacity: 0.5 }} />
            </div>
            <div className={styles.allManageButtons}>
              <div
                className={styles.manageButton}
                onClick={() => {
                  handleMultiplier(asset, 1);
                }}
                style={{
                  backgroundImage: `url(${bg.src})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                +1M
              </div>
              <div
                className={styles.manageButton}
                onClick={() => {
                  handleMultiplier(asset, 10);
                }}
                style={{
                  backgroundImage: `url(${bg.src})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                +10M
              </div>
              <div
                className={styles.manageButton}
                onClick={() => {
                  handleMultiplier(asset, -1);
                }}
                style={{
                  backgroundImage: `url(${bg.src})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                -1M
              </div>
              <div
                className={styles.manageButton}
                onClick={() => {
                  handleMultiplier(asset, -10);
                }}
                style={{
                  backgroundImage: `url(${bg.src})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                -10M
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => buttonClick(asset, activeTab)}
          style={{
            padding: "14px 16px",
            width: "90%",
            backgroundColor: "#ff7129",
            color: "white",
            textDecoration: "none",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
            display: "inline-block",
            borderRadius: "5px",
            fontWeight: "700",
            fontSize: "18px",
          }}
          disabled={isBuyLoading === asset.name}
        >
          {isBuyLoading === asset.name && <div className="btnLoader" />}
          {asset.soldOut
            ? "SOLD OUT"
            : activeTab === "Buy"
            ? `Buy ${asset.name}`
            : `Sell ${asset.name}`}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "25px",
        }}
      >
        {categories[indexA].assets.map((asset, index) => (
          <button
            key={index}
            className={index === indexB ? styles.activeNavItem : styles.navItem}
          >
            <img
              style={{ marginTop: 10, width: 15, marginLeft: -4 }}
              src={asset.image}
              alt={asset.name}
            />{" "}
          </button>
        ))}
      </div>
    </div>
  );
}
