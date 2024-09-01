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
}) {
  const rowHeightRem = 23;
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(
    categories.length > 0 ? 0 : -1
  );
  const [localCategories, setLocalCategories] = useState([]);
  const [desktopCategory, setDesktopCategory] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)} K`;
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
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isDesktop = windowWidth >= 1024;

  function handleCategoryChange(event) {
    setDesktopCategory(event.target.value);
  }

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
      <div className={styles.snappyContainer} ref={containerRef}>
        {categories.map((category, catIndex) => (
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
                          {asset.rarity}
                        </h3>
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
                  >
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
        ))}
      </div>

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
                        return (
                          <div key={subIndex} className={styles.desktopAsset}>
                            <div className={styles.details}>
                              <div className={styles.topSection}>
                                <div className={styles.leftPart}>
                                  <h2 className={styles.foodName}>
                                    {subAsset.name}
                                  </h2>
                                  <h3 className={styles.rarity}>
                                    <img
                                      style={{ marginTop: 2 }}
                                      src="/atlasIcon.svg"
                                      alt="Atlas Icon"
                                    />
                                    {subAsset.rarity}
                                  </h3>
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
                                        : subAsset.sell_price
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
                                      handleMultiplier(subAsset.name, 1);
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
                                      handleMultiplier(subAsset.name, 10);
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
                                      handleMultiplier(subAsset.name, -1);
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
                                      handleMultiplier(subAsset.name, -10);
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
                            >
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
