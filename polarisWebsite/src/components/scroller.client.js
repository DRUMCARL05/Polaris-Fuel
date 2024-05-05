import React, { useState, useEffect, useRef } from 'react'; 
import styles from '../styles/scroller.module.css';
import { LuInfo } from "react-icons/lu";
import bg from '../../public/backgroundButtonManage.png';
import { FaAngleDown } from "react-icons/fa6";

export default function Scroller() {
    const categories = [
        {
            name: 'Consumables',
            assets: [
                { name: 'Ammo', image: '/ammo.png', cost: '100K', rarity: 'Common' },
                { name: 'Food', image: '/food.png', cost: '293K', rarity: 'Common' },
                { name: 'Fuel', image: '/fuel.png', cost: '10K', rarity: 'Common' },
                { name: 'Toolkit', image: '/tools.png', cost: '5M', rarity: 'Common' }
            ]
        },
        {
            name: 'Raw Material',
            assets: [
                { name: 'Arco', image: '/ARCO.webp', cost: '293K', rarity: 'Common' },
                { name: 'Biomass', image: '/BIOMASS.webp', cost: '29K', rarity: 'Common' },
                { name: 'Copper Ore', image: '/CUORE.webp', cost: '15K', rarity: 'Common' },
                { name: 'Carbon', image: '/CARBON.webp', cost: '1M', rarity: 'Common' },
                { name: 'Diamond', image: '/DIAMOND.webp', cost: '1M', rarity: 'Common' },
                { name: 'Hydrogen', image: '/HYG.webp', cost: '1M', rarity: 'Common' },
                { name: 'Iron Ore', image: '/FEORE.webp', cost: '1M', rarity: 'Common' },
                { name: 'Lumanite', image: '/LUMAN.webp', cost: '1M', rarity: 'Common' },
                { name: 'Nitrogen', image: '/NITRO.webp', cost: '1M', rarity: 'Common' },
                { name: 'Rochinol', image: '/ROCH.webp', cost: '1M', rarity: 'Common' },
                { name: 'Silica', image: '/SAND.webp', cost: '1M', rarity: 'Common' },
                { name: 'Titanium Ore', image: '/TIORE.webp', cost: '1M', rarity: 'Common' }
            ]
        }
    ];

    const rowHeightRem = 23; // The height in rem
    const rowHeightPx = rowHeightRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [desktopCategory, setDesktopCategory] = useState(0); 
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [activeAssetIndex, setActiveAssetIndex] = useState(Array(categories.length).fill(0));
    const containerRefs = useRef(categories.map(() => React.createRef()));
    const containerRef = useRef(null);
    const [activeRow, setActiveRow] = useState(0);
    const desktopContainerRef = useRef(null);

    // Helper function to calculate the number of rows for a given category
    const getNumberOfRows = (categoryIndex) => {
        const numAssets = categories[categoryIndex].assets.length;
        return Math.ceil(numAssets / 4); // Assuming 4 assets per row
    };

    const handleDesktopScroll = () => {
        const container = desktopContainerRef.current;
        const scrollTop = container.scrollTop;
    
        const newIndex = Math.floor(scrollTop / rowHeightPx);
    
        if (newIndex !== activeRow) {
            setActiveRow(newIndex);
        }
    };
    
    useEffect(() => {
        const container = desktopContainerRef.current;
        if (!container) return;
    
        container.addEventListener('scroll', handleDesktopScroll);
    
        return () => {
            container.removeEventListener('scroll', handleDesktopScroll);
        };
    }, [activeRow]);    

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDesktop = windowWidth >= 1024;

    function handleCategoryChange(event) {
        setDesktopCategory(event.target.value);
    }

    // Scroll event listener to handle the scroll behavior and set the active index
    useEffect(() => {
        const handleScroll = (catIndex) => {
            const container = containerRefs.current[catIndex].current;
            if (!container) return;
        
            const scrollPosition = container.scrollLeft;
            const assetWidth = container.clientWidth;

            // Calculate the index based on the scroll position
            const newIndex = Math.floor(scrollPosition / assetWidth);

            if (activeAssetIndex[catIndex] !== newIndex) {
                let newIndexes = [...activeAssetIndex];
                newIndexes[catIndex] = newIndex;
                setActiveAssetIndex(newIndexes);
            }

            // Debugging logs
            console.log(`Category: ${catIndex}, Scroll Position: ${scrollPosition}, Asset Width: ${assetWidth}, New Index: ${newIndex}`);
        };

        // Attach the scroll event listeners
        const eventListeners = categories.map((category, index) => {
            const eventListener = () => handleScroll(index);
            const container = containerRefs.current[index].current;
            container.addEventListener('scroll', eventListener);

            return eventListener;
        });

        // Cleanup function to remove event listeners
        return () => {
            categories.forEach((category, index) => {
                const container = containerRefs.current[index].current;
                const eventListener = eventListeners[index];
                container.removeEventListener('scroll', eventListener);
            });
        };
    }, [categories.length, activeAssetIndex]); // Ensure activeAssetIndex is also a dependency

    useEffect(() => {
        if (!isDesktop) {
            const handleMobileScroll = () => {
                const scrollPosition = containerRef.current.scrollTop;
                const rowHeight = containerRef.current.scrollHeight / (categories.length * Math.ceil(category.assets.length / 4));
                const newIndex = Math.floor(scrollPosition / rowHeight);
                setActiveCategoryIndex(newIndex);
            };
    
            containerRef.current.addEventListener('scroll', handleMobileScroll);
            return () => {
                containerRef.current.removeEventListener('scroll', handleMobileScroll);
            };
        }
    }, [isDesktop]);    


    useEffect(() => {
        const container = containerRef.current;
        const handleScroll = () => {
            const scrollPosition = container.scrollTop;
            const categoryHeight = container.clientHeight;
            const newIndex = Math.floor((scrollPosition + (categoryHeight / 2)) / categoryHeight);
        
            if (activeCategoryIndex !== newIndex) {
                setActiveCategoryIndex(newIndex);
            }
        };

        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [activeCategoryIndex]); 

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function handleCategoryChange(event) {
        setActiveCategoryIndex(Number(event.target.value));
    }

    // Scroll event listener for desktop
    useEffect(() => {
        const handleScroll = (catIndex) => {
            const container = containerRefs.current[catIndex].current;
            if (!container) return;
        
            const scrollPosition = container.scrollLeft;
            const assetWidth = container.clientWidth;

            // Calculate the index based on the scroll position
            const newIndex = Math.floor(scrollPosition / assetWidth);

            if (activeAssetIndex[catIndex] !== newIndex) {
                let newIndexes = [...activeAssetIndex];
                newIndexes[catIndex] = newIndex;
                setActiveAssetIndex(newIndexes);
            }
        };

        // Attach the scroll event listeners
        const eventListeners = categories.map((category, index) => {
            const eventListener = () => handleScroll(index);
            const container = containerRefs.current[index].current;
            container.addEventListener('scroll', eventListener);

            return eventListener;
        });

        // Cleanup function to remove event listeners
        return () => {
            categories.forEach((category, index) => {
                const container = containerRefs.current[index].current;
                const eventListener = eventListeners[index];
                container.removeEventListener('scroll', eventListener);
            });
        };
    }, [categories.length, activeAssetIndex]);    


    function buttonClick(name){
        alert(`Clicked Button ${name}`)
    }

    function addValue(amount){
        alert(`Clicked add button: ${amount}`)
    }

    function calculateColumns(windowWidth) {
        if (windowWidth >= 1800) return 5;
        if (windowWidth >= 1500) return 4;
        if (windowWidth >= 1024) return 3;
        if (windowWidth >= 600) return 2;
        return 1; // Default for very small devices
    }
    
    useEffect(() => {
        function handleResize() {
            const cols = calculateColumns(window.innerWidth);
            setWindowWidth(window.innerWidth);  // You may want to also set state for number of columns if needed
        }
    
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    

    return (
        <div>
            <div className={styles.snappyContainer} ref={containerRef}>
                {categories.map((category, catIndex) => (
                    <section key={catIndex} className={styles.category}>
                        <div ref={containerRefs.current[catIndex]} className={styles.assetContainer}>
                            {category.assets.map((asset, assetIndex) => (
                                <div key={assetIndex} className={styles.asset}>
                                    <div className={styles.details}>
                                        <div className={styles.topSection}>
                                            <div className={styles.leftPart}>
                                                <h2 className={styles.headingSection}>{category.name}</h2>
                                                <h2 className={styles.foodName}>{asset.name}</h2>
                                                <h3 className={styles.rarity}>
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect x="0.4" y="0.4" width="9.2" height="9.2" stroke="white" stroke-width="0.8"/>
                                                        <rect x="2.22223" y="2.22222" width="5.55556" height="5.55556" fill="white"/>
                                                    </svg>
                                                    {asset.rarity}
                                                </h3>
                                            </div>
                                            {asset.image && <img src={asset.image} alt={asset.name} className={styles.assetImage} />}
                                        </div>

                                        <div className={styles.amountDetails}>
                                            <div className={styles.buying}>
                                                <p className={styles.heading}>Buying amount</p>
                                                <p className={styles.buyingAmount}>10M</p>
                                            </div>
                                            <div className={styles.totalCost}>
                                                <p className={styles.heading}>Buying amount</p>
                                                <p className={styles.totalCostAmount}>
                                                    {asset.cost}
                                                    <img src="/atlasIcon.svg" alt="Atlas Icon" />
                                                </p>
                                            </div>
                                            <img src="/glowRIghtCost.svg" alt="glow on the right of the cost section" className={styles.glowCost} />
                                        </div>

                                        <div className={styles.manageBuyingAmount}>
                                            <div className={styles.topSectionManage}>
                                                <h4 className={styles.headingManage}>Manage Buying Amount</h4>
                                                <LuInfo style={{opacity: 0.5}} />
                                            </div>
                                            <div className={styles.allManageButtons}>
                                                <div className={styles.manageButton} onClick={() => {addValue('1M Add')}} style={{
                                                    backgroundImage: `url(${bg.src})`,
                                                    backgroundSize: 'cover',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center'
                                                }}>+1M</div>
                                                <div className={styles.manageButton} onClick={() => {addValue('10M Add')}} style={{
                                                    backgroundImage: `url(${bg.src})`,
                                                    backgroundSize: 'cover',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center'
                                                }}>+10M</div>
                                                <div className={styles.manageButton} onClick={() => {addValue('1M Less')}} style={{
                                                    backgroundImage: `url(${bg.src})`,
                                                    backgroundSize: 'cover',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center'
                                                }}>-1M</div>
                                                <div className={styles.manageButton} onClick={() => {addValue('10M Less')}} style={{
                                                    backgroundImage: `url(${bg.src})`,
                                                    backgroundSize: 'cover',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center'
                                                }}>-10M</div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => {buttonClick(asset.name)}} className={styles.button}>Buy {asset.name}</button>
                                </div>
                            ))}
                        </div>

                        <div style={{marginTop:-115}} className={styles.categoryNavigation}>
                            {categories.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        containerRef.current.scrollTo({
                                            top: index * containerRef.current.clientHeight,
                                            behavior: 'smooth'
                                        });
                                    }}
                                    className={index === activeCategoryIndex ? styles.activeNavItem : styles.navItem}
                                    
                                />
                            ))}
                        </div>

                        <div className={styles.assetNavigation}>
                            {category.assets.map((asset, index) => (
                                <button
                                    key={index}
                                    className={index === activeAssetIndex[catIndex] ? styles.activeNavItem : styles.navItem}
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
                    {Array.from({ length: getNumberOfRows(activeCategoryIndex) }).map((_, index) => (
                        <button
                            key={index}
                            className={index === activeRow ? styles.activeNavItem : styles.navItem}
                            onClick={() => {
                                const rowHeight = document.querySelector('.desktopAssetRow').clientHeight;
                                document.querySelector('.desktopAssetContainer').scrollTo({
                                    top: index * rowHeight,
                                    behavior: 'smooth'
                                });
                                setActiveRow(index);
                            }}
                        >
                        </button>
                    ))}
                </div>
                <div className={styles.desktopAssetContainer} ref={desktopContainerRef}>
                    <div className={styles.dropDownContainer}>
                        <select onChange={handleCategoryChange} value={activeCategoryIndex} className={styles.categorySelector}>
                            {categories.map((category, index) => (
                                <option key={index} value={index}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <FaAngleDown className={styles.arrow} />
                    </div>

                    {/* Only render the assets of the active category */}
                    <div className={styles.desktopCategory}>
                        {categories[activeCategoryIndex].assets.map((asset, index) => index % 4 === 0 && (
                            <div key={index} className={styles.desktopAssetRow}>
                                {categories[activeCategoryIndex].assets.slice(index, index + 4).map((subAsset, subIndex) => (
                                    <div key={subIndex} className={styles.desktopAsset}>
                                        <div className={styles.details}>
                                            <div className={styles.topSection}>
                                                <div className={styles.leftPart}>
                                                    <h2 className={styles.foodName}>{subAsset.name}</h2>
                                                    <h3 className={styles.rarity}>
                                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="0.4" y="0.4" width="9.2" height="9.2" stroke="white" stroke-width="0.8"/>
                                                            <rect x="2.22223" y="2.22222" width="5.55556" height="5.55556" fill="white"/>
                                                        </svg>
                                                        {subAsset.rarity}
                                                    </h3>
                                                </div>
                                                {subAsset.image && <img src={subAsset.image} alt={subAsset.name} className={styles.assetImage} />}
                                            </div>

                                            <div className={styles.amountDetails}>
                                                <div className={styles.buying}>
                                                    <p className={styles.heading}>Buying amount</p>
                                                    <p className={styles.buyingAmount}>10M</p>
                                                </div>
                                                <div className={styles.totalCost}>
                                                    <p className={styles.heading}>Buying amount</p>
                                                    <p className={styles.totalCostAmount}>
                                                        {subAsset.cost}
                                                        <img src="/atlasIcon.svg" alt="Atlas Icon" />
                                                    </p>
                                                </div>
                                                <img src="/glowRIghtCost.svg" alt="glow on the right of the cost section" className={styles.glowCost} />
                                            </div>

                                            <div className={styles.manageBuyingAmount}>
                                                <div className={styles.topSectionManage}>
                                                    <h4 className={styles.headingManage}>Manage Buying Amount</h4>
                                                    <LuInfo style={{opacity: 0.5}} />
                                                </div>
                                                <div className={styles.allManageButtons}>
                                                    <div className={styles.manageButton} onClick={() => {addValue('1M Add')}} style={{
                                                        backgroundImage: `url(${bg.src})`,
                                                        backgroundSize: 'cover',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center'
                                                    }}>+1M</div>
                                                    <div className={styles.manageButton} onClick={() => {addValue('10M Add')}} style={{
                                                        backgroundImage: `url(${bg.src})`,
                                                        backgroundSize: 'cover',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center'
                                                    }}>+10M</div>
                                                    <div className={styles.manageButton} onClick={() => {addValue('1M Less')}} style={{
                                                        backgroundImage: `url(${bg.src})`,
                                                        backgroundSize: 'cover',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center'
                                                    }}>-1M</div>
                                                    <div className={styles.manageButton} onClick={() => {addValue('10M Less')}} style={{
                                                        backgroundImage: `url(${bg.src})`,
                                                        backgroundSize: 'cover',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center'
                                                    }}>-10M</div>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => {buttonClick(subAsset.name)}} className={styles.button}>Buy {subAsset.name}</button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
