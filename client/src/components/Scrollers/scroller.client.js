"use client";

import React, { useState, useEffect, useRef } from "react";
import ScrollerUi from "./components/Scroller";

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
  const [isRefAvailable, setIsRefAvailable] = useState(false);
  const [isMobile, setIsMobile] = useState(null);

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
    const desktopContainer = desktopContainerRef.current;
    if (!desktopContainer) return;

    desktopContainer.addEventListener("scroll", handleDesktopScroll);

    return () => {
      desktopContainer.removeEventListener("scroll", handleDesktopScroll);
    };
  }, [activeRow, isMobile]);

  useEffect(() => {
    const ref = containerRef?.current;
    const handleMobileScroll = () => {
      const scrollY = ref.scrollTop;
      const containerHeight = ref.clientHeight;
      const newActiveCategoryIndex = Math.floor(scrollY / containerHeight);

      if (newActiveCategoryIndex !== activeCategoryIndex) {
        setActiveCategoryIndex(newActiveCategoryIndex);
      }
    };

    ref?.addEventListener("scroll", handleMobileScroll);
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
        if (ref) ref.removeEventListener("scroll", handleMobileScroll);
      });
    };
  }, [isMobile, activeCategoryIndex]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  if (
    !localCategories[activeCategoryIndex] ||
    !localCategories[activeCategoryIndex].assets.length
  ) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
        className="loaderContainer"
      >
        <div className="loader"></div>
      </div>
    );
  }
  return (
    <>
      {categories.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          Loading
        </div>
      ) : (
        <ScrollerUi
          getNumberOfRows={getNumberOfRows}
          desktopCategory={desktopCategory}
          activeRow={activeRow}
          desktopContainerRef={desktopContainerRef}
          categories={categories}
          activeTab={activeTab}
          numberToScale={numberToScale}
          isBuyLoading={isBuyLoading}
          handleMultiplier={handleMultiplier}
          buttonClick={buttonClick}
          setDesktopCategory={setDesktopCategory}
          setActiveRow={setActiveRow}
          activeCategoryIndex={activeCategoryIndex}
          activeAssetIndex={activeAssetIndex}
          containerRef={containerRef}
          containerRefs={containerRefs}
          setActiveCategoryIndex={setActiveCategoryIndex}
          isMobile={isMobile}
          setIsMobile={setIsMobile}
        />
      )}
    </>
  );
}
