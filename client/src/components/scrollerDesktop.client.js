"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/scroller.module.css";
import { LuInfo } from "react-icons/lu";
import bg from "../../public/backgroundButtonManage.png";
import { FaAngleDown } from "react-icons/fa6";

export default function Scroller({
  categories,
  buttonClick,
  activeTab,
  handleMultiplier,
  isBuyLoading,
}) {
  const rowHeightRem = 23;
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(
    categories.length > 0 ? 0 : -1
  );
  const [localCategories, setLocalCategories] = useState([]);
  const [desktopCategory, setDesktopCategory] = useState(0);
  const [activeAssetIndex, setActiveAssetIndex] = useState(
    Array(categories.length).fill(0)
  );
  const containerRefs = useRef([]);
  const containerRef = useRef(null);
  const [activeRow, setActiveRow] = useState(0);
  const desktopContainerRef = useRef(null);

  const numberToScale = (number) => {
    const num = parseFloat(number);
    if (isNaN(num)) return "";
    if (num >= 1e9) return `${(num / 1e9).toFixed(0)} B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)} M`;
    if (num >= 1e3 && num < 1e5) return num.toFixed(0); // Allow 4 digits for 1k-9999 range
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)} K`; // Rounds after 10k
    return num.toString();
  };
  

  useEffect(() => {
    containerRefs.current = categories.map(() => React.createRef());
  }, [categories]);

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

  const getNumberOfRows = (categoryIndex) => {
    const numAssets = localCategories[categoryIndex].assets.length;
    return Math.ceil(numAssets / 4);
  };

  const handleDesktopScroll = () => {
    const container = desktopContainerRef.current;
    const scrollTop = container.scrollTop;
    const rowHeightPx =
      rowHeightRem *
      parseFloat(getComputedStyle(document.documentElement).fontSize);

    const newIndex = Math.floor(scrollTop / rowHeightPx);

    if (newIndex !== activeRow) {
      setActiveRow(newIndex);
    }
  };

  useEffect(() => {
    const container = desktopContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleDesktopScroll);

    return () => {
      container.removeEventListener("scroll", handleDesktopScroll);
    };
  }, [activeRow, desktopCategory]);

  useEffect(() => {
    const ref = containerRef.current;
    if (!ref) return;

    const handleScroll = () => {
      const scrollY = ref.scrollTop;
      const height = ref.clientHeight;
      const currentIndex = Math.floor(scrollY / height);
      if (currentIndex !== activeCategoryIndex) {
        setActiveCategoryIndex(currentIndex);
      }
    };

    ref.addEventListener("scroll", handleScroll);

    return () => {
      if (ref) ref.removeEventListener("scroll", handleScroll);
    };
  }, [activeCategoryIndex]);

  useEffect(() => {
    const ref = containerRef.current;
    if (!ref) return;

    const handleScroll = () => {
      const scrollY = ref.scrollTop;
      const height = ref.clientHeight;
      const currentIndex = Math.floor(scrollY / height);
      if (currentIndex !== activeCategoryIndex) {
        setActiveCategoryIndex(currentIndex);
      }
    };

    ref.addEventListener("scroll", handleScroll);

    return () => ref.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = (catIndex) => {
      const container = containerRefs.current[catIndex].current;
      if (container) {
        const scrollPosition = container.scrollLeft;
        const assetWidth = container.clientWidth;
        const newIndex = Math.floor(scrollPosition / assetWidth);

        if (activeAssetIndex[catIndex] !== newIndex) {
          let newIndexes = [...activeAssetIndex];
          newIndexes[catIndex] = newIndex;
          setActiveAssetIndex(newIndexes);
        }
      }
    };

    const eventListeners = categories.map((category, index) => {
      const container = containerRefs.current[index].current;
      if (container) {
        const eventListener = () => handleScroll(index);
        container.addEventListener("scroll", eventListener);

        return () => container.removeEventListener("scroll", eventListener);
      }
    });

    return () => {
      eventListeners.forEach((eventListener, index) => {
        const container = containerRefs.current[index].current;
        if (container) {
          container.removeEventListener("scroll", eventListener);
        }
      });
    };
  }, [categories.length, activeAssetIndex]);

  if (
    !localCategories[activeCategoryIndex] ||
    !localCategories[activeCategoryIndex].assets.length
  ) {
    return <div>No assets to display</div>;
  }
  return (
    <div>
      <div className={styles.desktopLayout}>
        <div className={styles.desktopNav}>
          {Array.from({ length: getNumberOfRows(desktopCategory) }).map(
            (_, index) => (
              <button
                key={index}
                className={
                  index === activeRow ? styles.activeNavItem : styles.navItem
                }
                onClick={() => {
                  const rowHeight =
                    document.querySelector(".desktopAssetRow").clientHeight;
                  document.querySelector(".desktopAssetContainer").scrollTo({
                    top: index * rowHeight,
                    behavior: "smooth",
                  });
                  setActiveRow(index);
                }}
              ></button>
            )
          )}
        </div>
        <div className={styles.desktopAssetContainer} ref={desktopContainerRef}>
          <div className={styles.dropDownContainer}>
            <select
              onChange={(e) => {
                setDesktopCategory(parseInt(e.target.value, 10));
              }}
              value={desktopCategory}
              className={styles.categorySelector}
            >
              {categories.map((category, index) => (
                <option key={index} value={index}>
                  {category.name}
                </option>
              ))}
            </select>
            <FaAngleDown className={styles.arrow} />
          </div>

          <div className={styles.desktopCategory}>
            {categories[desktopCategory].assets.map(
              (asset, index) =>
                index % 4 === 0 && (
                  <div key={index} className={styles.desktopAssetRow}>
                    {categories[desktopCategory].assets
                      .slice(index, index + 4)
                      .map((subAsset, subIndex) => {
                        // console.log(
                        //   (subAsset.buy_price * subAsset.multiplier) /
                        //     (subAsset.minimum_buy_qty * subAsset.multiplier)
                        // );
                        // console.log(
                        //   subAsset.buy_price * subAsset.multiplier,
                        //   "(subAsset.buy_price * subAsset.multiplier)"
                        // );
                        // console.log(
                        //   subAsset.minimum_buy_qty * subAsset.multiplier,
                        //   "(subAsset.minimum_buy_qty * subAsset.multiplier)"
                        // );
                        return (
                          <div key={subIndex} className={styles.desktopAsset}>
                            <div className={styles.details}>
                              <div className={styles.topSection}>
                                <div className={styles.leftPart}>
                                  <h2 className={styles.foodName}>
                                    {subAsset.name}
                                  </h2>
                                  {!subAsset.soldOut && (
                                    <>

                                        {activeTab === "Buy"
                                          ? (
                                            <div>
                                                                                          <h3 className={styles.rarity}>
                                              <img
                                                style={{ marginTop: -1, width: 15, marginLeft: 0 }}
                                                src={subAsset.image}
                                                alt={subAsset.name}
                                              />
                                              {numberToScale(subAsset.resourceBalanceinVault)}
                                            </h3>
                                            <h3 className={styles.rarity}>
                                            <img
                                              style={{ marginTop: 2 }}
                                              src="/atlasIcon.svg"
                                              alt="Atlas Icon"
                                            />
                                            {Number.isNaN(
                                              (subAsset.buy_price *
                                                subAsset.multiplier) /
                                                (subAsset.minimum_buy_qty *
                                                  subAsset.multiplier)
                                            )
                                              ? 0
                                              : (subAsset.buy_price *
                                                  subAsset.multiplier) /
                                                (subAsset.minimum_buy_qty *
                                                  subAsset.multiplier)}
                                          </h3>

                                            </div>

                                          )
                                          : (
                                            <div>
                                             <h3 className={styles.rarity}>
                                              <img
                                                style={{ marginTop: 4, marginLeft: 0 }}
                                                src='/atlasIcon.svg'
                                                alt="Atlas Icon"
                                              />
                                              {numberToScale(subAsset.atlasBalanceInVault)}
                                            </h3>
                                            <h3 className={styles.rarity}>
                                            <img
                                              style={{ marginTop: 2 }}
                                              src="/atlasIcon.svg"
                                              alt="Atlas Icon"
                                            />
                                            {Number.isNaN(
                                              (subAsset.sell_price *
                                                subAsset.multiplier) /
                                                (subAsset.minimum_sell_qty *
                                                  subAsset.multiplier)
                                            )
                                              ? 0
                                              : (subAsset.sell_price *
                                                  subAsset.multiplier) /
                                                (subAsset.minimum_sell_qty *
                                                  subAsset.multiplier)}
                                          </h3>

                                            </div>

                                          )
                                        }


                                    </>
                                  )}
                                </div>
                                {subAsset.image && (
                                  <img
                                    draggable={false}
                                    src={subAsset.image}
                                    alt={subAsset.name}
                                    className={styles.assetImage}
                                  />
                                )}
                              </div>

                              <div className={styles.amountDetails}>
                                <div className={styles.buying}>
                                  <p
                                    style={{ cursor: "pointer" }}
                                    className={styles.heading}
                                  >
                                    {activeTab === "Buy"
                                      ? "Buying amount"
                                      : "Selling amount"}
                                  </p>
                                  <p className={styles.buyingAmount}>
                                    {activeTab === "Buy"
                                      ? numberToScale(
                                          subAsset.minimum_buy_qty *
                                            subAsset.multiplier
                                        )
                                      : numberToScale(
                                          subAsset.minimum_sell_qty *
                                            subAsset.multiplier
                                        )}
                                  </p>
                                </div>
                                <div className={styles.totalCost}>
                                  <p
                                    style={{ cursor: "pointer" }}
                                    className={styles.heading}
                                  >
                                    {activeTab === "Buy"
                                      ? "Total Cost"
                                      : "Total Earnings"}
                                  </p>
                                  <p className={styles.totalCostAmount}>
                                    {numberToScale(
                                      activeTab === "Buy"
                                        ? subAsset.buy_price *
                                            subAsset.multiplier
                                        : subAsset.sell_price * subAsset.multiplier
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
                                      handleMultiplier(subAsset, 1);
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
                                      handleMultiplier(subAsset, 10);
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
                                      handleMultiplier(subAsset, -1);
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
                                      handleMultiplier(subAsset, -10);
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
                                buttonClick(subAsset, activeTab);
                              }}
                              className={styles.button}
                              style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "center",
                              }}
                              disabled={isBuyLoading === subAsset.name}
                            >
                              {isBuyLoading === subAsset.name && (
                                <div className="btnLoader" />
                              )}
                              {subAsset.soldOut
                                ? "SOLD OUT"
                                : activeTab === "Buy"
                                ? `Buy ${subAsset.name}`
                                : `Sell ${asset.name}`}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
