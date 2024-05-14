"use client";
import { useState } from 'react';
import '../styles/homepage.css'
import dynamic from 'next/dynamic';

const Nav = dynamic(() => import('@/components/nav.client'), { ssr: false });
const Scroller = dynamic(() => import('@/components/scroller.client'), { ssr: false });
const Bottom = dynamic(() => import('@/components/bottom.client'), { ssr: false });

export default function Home() {
  // function buttonPressed(name){
  //   alert(`Button Pressed ${name}`)
  // }

  const [activeTab, setActiveTab] = useState("customer");

  const buttonPressed = (tab) => {
    setActiveTab(tab);
    // Any other logic you want to perform when a tab is pressed
  };
  
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
  
  return (
    <div>
      <div className="mobileLayout">
        <div className="glow"></div>
        <Nav></Nav>
        <div style={{marginLeft:4, marginTop:20, display: "flex", justifyContent: "center" }}>
          <div className="tab-buttons">
            <button onClick={() => buttonPressed("customer")} style={{ width:100, backgroundColor: activeTab === "customer" ? "#ff7129" : "#303030", color: activeTab === "customer" ? "#FFFFFF" : "#acacac", border: "none", padding: "10px 20px", cursor: "pointer", outline: "none", borderRadius: "5px 0 0 0", marginRight: "5px" }}>BUY</button>
            <button onClick={() => buttonPressed("providers")} style={{ width:100,backgroundColor: activeTab === "providers" ? "#ff7129" : "#303030", color: activeTab === "providers" ? "#FFFFFF" : "#acacac", border: "none", padding: "10px 20px", cursor: "pointer", outline: "none", borderRadius: "0 0 0 0", marginLeft: "5px",marginRight:"5px" }}>SELL</button>
            <button onClick={() => buttonPressed("mining")} style={{ width:100,backgroundColor: activeTab === "mining" ? "#ff7129" : "#303030", color: activeTab === "mining" ? "#FFFFFF" : "#acacac", border: "none", padding: "10px 20px", cursor: "pointer", outline: "none", borderRadius: "0 5px 5px 0", marginLeft: "5px" }}>EARN</button>
          </div>
        </div>
        
        <Scroller categories={categories}></Scroller>
        <Bottom />
      </div>
      <div className="desktopVersion">
        <div className="glow"></div>
        <Nav></Nav>
        <Scroller categories={categories}></Scroller>
        <Bottom />
      </div>
    </div>
  );
}
