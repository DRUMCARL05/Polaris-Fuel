declare global {
    interface Window {
      phantom: {
        solana: any; // Replace 'any' with the actual type if known
      };
    }
  }
  
  export {};  