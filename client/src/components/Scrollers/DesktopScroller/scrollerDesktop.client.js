"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../../../styles/scroller.module.css";
import { LuInfo } from "react-icons/lu";
import { FaAngleDown } from "react-icons/fa6";
import Desktop from "./components/Desktop";

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
        <Desktop
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
        />
      )}
    </>
  );
}
