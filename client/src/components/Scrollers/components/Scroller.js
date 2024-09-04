import React from "react";
import styles from "../../../styles/scroller.module.css";
import { FaAngleDown } from "react-icons/fa6";
import { Card } from "./Card/Card";

const Desktop = ({
  getNumberOfRows,
  desktopCategory,
  activeRow,
  desktopContainerRef,
  categories,
  activeTab,
  numberToScale,
  isBuyLoading,
  buttonClick,
  setDesktopCategory,
  setActiveRow,
  containerRef,
  containerRefs,
  activeCategoryIndex,
  activeAssetIndex,
  handleMultiplier,
  isMobile,
}) => {

  return (
    <div>
      {!isMobile ? (
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
          <div
            className={styles.desktopAssetContainer}
            ref={desktopContainerRef}
          >
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
                              <Card
                                asset={subAsset}
                                activeTab={activeTab}
                                numberToScale={numberToScale}
                                isBuyLoading={isBuyLoading}
                                handleMultiplier={handleMultiplier}
                                buttonClick={buttonClick}
                              />
                            </div>
                          );
                        })}
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={styles.snappyContainer}
          ref={containerRef}
          id="scrollable-div"
        >
          {categories.map((category, catIndex) => {
            return (
              <section key={catIndex} className={styles.category}>
                <div
                  ref={containerRefs.current[catIndex]}
                  className={styles.assetContainer}
                >
                  {category.assets.map((asset, assetIndex) => (
                    <div key={assetIndex} className={styles.asset}>
                      <Card
                        asset={asset}
                        activeTab={activeTab}
                        numberToScale={numberToScale}
                        isBuyLoading={isBuyLoading}
                        handleMultiplier={handleMultiplier}
                        buttonClick={buttonClick}
                      />
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
      )}
    </div>
  );
};

export default Desktop;
