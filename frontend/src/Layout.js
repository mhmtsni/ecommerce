import React from "react";
import Header from "./components/Header";

const Layout = ({ children }) => {
  return (
    <div style={{ paddingTop: "110px" }}>
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
