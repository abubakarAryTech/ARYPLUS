// ConditionalLayoutWrapper.jsx
import React, { useState, useEffect } from "react";
import FrontendLayout from "../layouts/FrontendLayout";
import Splash from "./animation/Splash";

const ConditionalLayoutWrapper = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return <FrontendLayout HeaderMega="true" FooterCompact="true" />;
};

export default ConditionalLayoutWrapper;
