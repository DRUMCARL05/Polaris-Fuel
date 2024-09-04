import React from "react";
import styles from "../../../../styles/scroller.module.css";
import { LuInfo } from "react-icons/lu";
import bg from "../../../../../public/backgroundButtonManage.png";
export const Card = ({
  asset,
  activeTab,
  numberToScale,
  isBuyLoading,
  handleMultiplier,
  buttonClick,
}) => {
  return (
    <div>
      <div className={styles.details}>
        <div className={styles.topSection}>
          <div className={styles.leftPart}>
            <h2 className={styles.foodName}>{asset.name}</h2>
            {!asset.soldOut && (
              <>
                {activeTab === "Buy" ? (
                  <div>
                    <h3 className={styles.rarity}>
                      <img
                        style={{
                          marginTop: -1,
                          width: 15,
                          marginLeft: 0,
                        }}
                        src={asset.name + ".png"}
                        alt={asset.name + " Icon"}
                      />
                      {numberToScale(asset.resourceBalanceinVault)}
                    </h3>
                    <h3 className={styles.rarity}>
                      <img
                        style={{ marginTop: 2 }}
                        src="/atlasIcon.svg"
                        alt="Atlas Icon"
                      />
                      {Number.isNaN(
                        (asset.buy_price * asset.multiplier) /
                          (asset.minimum_buy_qty * asset.multiplier)
                      )
                        ? 0
                        : (asset.buy_price * asset.multiplier) /
                          (asset.minimum_buy_qty * asset.multiplier)}
                    </h3>
                  </div>
                ) : (
                  <div>
                    <h3 className={styles.rarity}>
                      <img
                        style={{
                          marginTop: 4,
                          marginLeft: 0,
                        }}
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
                      {Number.isNaN(
                        (asset.sell_price * asset.multiplier) /
                          (asset.minimum_sell_qty * asset.multiplier)
                      )
                        ? 0
                        : (asset.sell_price * asset.multiplier) /
                          (asset.minimum_sell_qty * asset.multiplier)}
                    </h3>
                  </div>
                )}
              </>
            )}
          </div>
          {asset.image && (
            <img
              draggable={false}
              src={asset.image}
              alt={asset.name}
              className={styles.assetImage}
            />
          )}
        </div>

        <div className={styles.amountDetails}>
          <div className={styles.buying}>
            <p style={{ cursor: "pointer" }} className={styles.heading}>
              {activeTab === "Buy" ? "Buying amount" : "Selling amount"}
            </p>
            <p className={styles.buyingAmount}>
              {activeTab === "Buy"
                ? numberToScale(asset.minimum_buy_qty * asset.multiplier)
                : numberToScale(asset.minimum_sell_qty * asset.multiplier)}
            </p>
          </div>
          <div className={styles.totalCost}>
            <p style={{ cursor: "pointer" }} className={styles.heading}>
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
          <img
            src="/glowRIghtCost.svg"
            alt="glow on the right of the cost section"
            className={styles.glowCost}
          />
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
              }}
            >
              -10M
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          buttonClick(asset, activeTab);
        }}
        className={styles.button}
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
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
  );
};
