"use client";
import { useState } from 'react';
import '../styles/homepage.css'
import Nav from "@/components/nav.client";
import Scroller from '@/components/scroller.client';
import Bottom from '@/components/bottom.client';

export default function Home() {
  // function buttonPressed(name){
  //   alert(`Button Pressed ${name}`)
  // }

  const [activeTab, setActiveTab] = useState("customer");

  const buttonPressed = (tab) => {
    setActiveTab(tab);
    // Any other logic you want to perform when a tab is pressed
  };
  
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
        
        <Scroller></Scroller>
        <Bottom />
      </div>
      <div className="desktopVersion">
        <div className="glow"></div>
        <Nav></Nav>
        <Scroller></Scroller>
        <Bottom />
      </div>
    </div>
  );
}
