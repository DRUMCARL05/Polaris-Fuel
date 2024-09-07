"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/scroller.module.css";
import { LuInfo } from "react-icons/lu";
import bg from "../../public/backgroundButtonManage.png";

export default function Scroller({
  categories,
  buttonClick,
  activeTab,
  handleMultiplier,
  isBuyLoading,
}) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(
    categories.length > 0 ? 0 : -1
  );
  const [localCategories, setLocalCategories] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [activeAssetIndex, setActiveAssetIndex] = useState(
    Array(categories.length).fill(0)
  );
  const [isRefAvailable, setIsRefAvailable] = useState(false);

  const containerRefs = useRef([]);
  const containerRef = useRef(null);

  const numberToScale = (number) => {
    const num = parseFloat(number);
    if (isNaN(num)) return "";
    if (num >= 1e9) return `${(num / 1e9).toFixed(0)} B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)} M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)} K`;
    return num.toString();
  };

  useEffect(() => {
    setIsRefAvailable(true);
  }, []);

  useEffect(() => {
    containerRefs.current = categories.map(() => React.createRef());
  }, [categories, scrollPosition]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const transformedCategories = categories.map((category) => ({
        ...category,
        assets: category.assets.map((asset) => ({
          ...asset,
          displayCost: `${asset.cost} Credits`,
        })),
      }));
      setLocalCategories(transformedCategories);
    } else {
      console.log("Categories are empty or not valid");
    }
  }, [categories]);

  useEffect(() => {
    if (!isRefAvailable) return;

    const ref = containerRef.current;

    const handleScroll = () => {
      const scrollY = ref.scrollTop;
      const containerHeight = ref.clientHeight;
      const newActiveCategoryIndex = Math.floor(scrollY / containerHeight);

      if (newActiveCategoryIndex !== activeCategoryIndex) {
        setActiveCategoryIndex(newActiveCategoryIndex);
      }
    };

    ref.addEventListener("scroll", handleScroll);

    return () => {
      if (ref) ref.removeEventListener("scroll", handleScroll);
    };
  }, [isRefAvailable, activeCategoryIndex]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = (catIndex) => {
      const container = containerRefs.current[catIndex].current;
      if (container) {
        const scrollPosition = container.scrollLeft;
        const assetWidth = container.clientWidth;

        const tolerance = 5;

        let newIndex;
        if (scrollPosition <= tolerance) {
          newIndex = 0;
        } else {
          newIndex = Math.floor(scrollPosition / assetWidth);
        }

        if (activeAssetIndex[catIndex] !== newIndex) {
          let newIndexes = [...activeAssetIndex];
          newIndexes[catIndex] = newIndex;
          setActiveAssetIndex(newIndexes);
        }
      }
    };

    const eventListeners = categories.map((category, index) => {
      const container = containerRefs.current[index]?.current;
      if (container) {
        const eventListener = () => handleScroll(index);
        container.addEventListener("scroll", eventListener);

        return () => container.removeEventListener("scroll", eventListener);
      }
    });

    return () => {
      eventListeners.forEach((removeEventListener) => {
        if (removeEventListener) {
          removeEventListener();
        }
      });
    };
  }, [isRefAvailable, activeAssetIndex]);

  if (
    !localCategories[activeCategoryIndex] ||
    !localCategories[activeCategoryIndex].assets.length
  ) {
    return <div>No assets to display</div>;
  }
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
                          {activeTab === "Buy" ? (
                            <div>
                              <h3 className={styles.rarity}>
                                <img
                                  style={{
                                    marginTop: -1,
                                    width: 15,
                                    marginLeft: 0,
                                  }}
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
                              handleMultiplier(asset, 1);
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
                              handleMultiplier(asset, 10);
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
                              handleMultiplier(asset, -1);
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
                              handleMultiplier(asset, -10);
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
}
