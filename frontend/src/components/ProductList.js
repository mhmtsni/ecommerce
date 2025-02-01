import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    document.title = "Product List";
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/api/products`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div
      className="product-list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
        gap: "20px",
        justifyContent: "center",
        padding: "20px 40px",
        backgroundColor: "#f9fafb",
      }}
    >
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            size={"300px"}
            flexDirection={"column"}
            showDescription={true}
            gap={"20px"}
          />
        ))
      ) : (
        <p style={{ textAlign: "center", color: "#555", fontSize: "1.2em" }}>
          No products available.
        </p>
      )}
    </div>
  );
};

export default ProductList;
