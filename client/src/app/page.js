// app/page.js

import { Home } from "@/modules/Home";
import React from "react";

export default async function Page() {
  // Fetch the data on the server side
  const fetchMarketStatus = async () => {
    try {
      const response = await fetch(
        "http://polaris.cheaprpc.com:3000/market-status"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return null; // Return null or handle error as needed
    }
  };

  const categories = await fetchMarketStatus();
  return (
    <div>
      {categories ? (
        <Home data={categories} />
      ) : (
        <div className="loaderContainer">
          <div className="loader" />
        </div>
      )}
    </div>
  );
}
