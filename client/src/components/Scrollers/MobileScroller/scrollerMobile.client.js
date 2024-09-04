"use client";

import React, { useState, useEffect, useRef } from "react";
import Mobile from "./components/Mobile";

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

  console.log(categories, "category type");
  return (
    <div>
      {categories.length > 0 ? (
        <Mobile
          categories={categories}
          activeTab={activeTab}
          numberToScale={numberToScale}
          isBuyLoading={isBuyLoading}
          handleMultiplier={handleMultiplier}
          buttonClick={buttonClick}
          containerRef={containerRef}
          containerRefs={containerRefs}
          activeCategoryIndex={activeCategoryIndex}
          activeAssetIndex={activeAssetIndex}
        />
      ) : (
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
      )}
    </div>
  );
}
