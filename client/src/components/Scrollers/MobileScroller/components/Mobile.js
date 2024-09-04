import React from "react";
import styles from "../../../../styles/scroller.module.css";
import { LuInfo } from "react-icons/lu";
import bg from "../../../../../public/backgroundButtonManage.png";

const Mobile = ({
  categories,
  activeTab,
  numberToScale,
  isBuyLoading,
  handleMultiplier,
  buttonClick,
  containerRef,
  containerRefs,
  activeCategoryIndex,
  activeAssetIndex,
}) => {
  return (
    <div>
      <div className={styles.snappyContainer} ref={containerRef}>
        {categories.map((category, catIndex) => {
          return (
            <section key={catIndex} className={styles.category}>
              <div
                ref={containerRefs.current[catIndex]}
                className={styles.assetContainer}
              >
                {category.assets.map((asset, assetIndex) => (
                  <div key={assetIndex} className={styles.asset}>
                    <div className={styles.details}>
                      <div className={styles.topSection}>
                        <div className={styles.leftPart}>
                          <h2 className={styles.headingSection}>
                            {category.name}
                          </h2>
                          <h2 className={styles.foodName}>{asset.name}</h2>
                          {!asset.soldOut && (
                            <>
                              <h3 className={styles.rarity}>
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <rect
                                    x="0.4"
                                    y="0.4"
                                    width="9.2"
                                    height="9.2"
                                    stroke="white"
                                    strokeWidth="0.8"
                                  />
                                  <rect
                                    x="2.22223"
                                    y="2.22222"
                                    width="5.55556"
                                    height="5.55556"
                                    fill="white"
                                  />
                                </svg>
                                {activeTab === "Buy"
                                  ? asset.resourceBalanceinVault
                                  : asset.atlasBalanceInVault}
                              </h3>
                              <h3 className={styles.rarity}>
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <rect
                                    x="0.4"
                                    y="0.4"
                                    width="9.2"
                                    height="9.2"
                                    stroke="white"
                                    strokeWidth="0.8"
                                  />
                                  <rect
                                    x="2.22223"
                                    y="2.22222"
                                    width="5.55556"
                                    height="5.55556"
                                    fill="white"
                                  />
                                </svg>
                                {Number.isNaN(
                                  (asset.buy_price * asset.multiplier) /
                                    (asset.minimum_buy_qty * asset.multiplier)
                                )
                                  ? 0
                                  : (asset.buy_price * asset.multiplier) /
                                    (asset.minimum_buy_qty * asset.multiplier)}
                              </h3>
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
                          <p className={styles.heading}>
                            {activeTab === "Buy"
                              ? "Buying amount"
                              : "Selling amount"}
                          </p>
                          <p className={styles.buyingAmount}>
                            {activeTab === "Buy"
                              ? numberToScale(
                                  asset.minimum_buy_qty * asset.multiplier
                                )
                              : numberToScale(asset.minimum_sell_qty)}
                          </p>
                        </div>
                        <div className={styles.totalCost}>
                          <p className={styles.heading}>
                            {activeTab === "Buy"
                              ? "Total Cost"
                              : "Total Earnings"}
                          </p>
                          <p className={styles.totalCostAmount}>
                            {numberToScale(
                              activeTab === "Buy"
                                ? asset.buy_price * asset.multiplier
                                : asset.sell_price
                            )}
                            <img src="/atlasIcon.svg" alt="Atlas Icon" />
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
                              handleMultiplier(asset.name, 1);
                            }}
                            style={{
                              backgroundImage: `url(${bg.src})`,
                              backgroundSize: "cover",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                            }}
                          >
                            +1M
                          </div>
                          <div
                            className={styles.manageButton}
                            onClick={() => {
                              handleMultiplier(asset.name, 10);
                            }}
                            style={{
                              backgroundImage: `url(${bg.src})`,
                              backgroundSize: "cover",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                            }}
                          >
                            +10M
                          </div>
                          <div
                            className={styles.manageButton}
                            onClick={() => {
                              handleMultiplier(asset.name, -1);
                            }}
                            style={{
                              backgroundImage: `url(${bg.src})`,
                              backgroundSize: "cover",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                            }}
                          >
                            -1M
                          </div>
                          <div
                            className={styles.manageButton}
                            onClick={() => {
                              handleMultiplier(asset.name, -10);
                            }}
                            style={{
                              backgroundImage: `url(${bg.src})`,
                              backgroundSize: "cover",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
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
                      {isBuyLoading === asset.name && (
                        <div className="btnLoader" />
                      )}
                      {activeTab === "Buy"
                        ? `Buy ${asset.name}`
                        : `Sell ${asset.name}`}
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{ marginTop: -115 }}
                className={styles.categoryNavigation}
              >
                {categories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      containerRef.current.scrollTo({
                        top: index * containerRef.current.clientHeight,
                        behavior: "smooth",
                      });
                    }}
                    className={
                      index === activeCategoryIndex
                        ? styles.activeNavItem
                        : styles.navItem
                    }
                  />
                ))}
              </div>

              <div className={styles.assetNavigation}>
                {category.assets.map((asset, index) => (
                  <button
                    key={index}
                    className={
                      index === activeAssetIndex[catIndex]
                        ? styles.activeNavItem
                        : styles.navItem
                    }
                  >
                    {/* You can use an icon or leave it empty for a dot style */}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Mobile;
