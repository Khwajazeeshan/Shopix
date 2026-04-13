// Loader component
import React from "react";
import { FiPackage } from "react-icons/fi";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <FiPackage className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Loading</h2>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Shopix Marketplace</p>
    </div>
  );
};

export default Loader;
