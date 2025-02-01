import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_URL}/api/products/${id}`
        );
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      await addToCart(id);
      setError(false);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "An unexpected error occurred. Please try again."
      );
      setError(true);
    }
  };

  if (!product) {
    return <p style={{ textAlign: "center" }}>Loading product details...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        color: "#333",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "50px",
          margin: "50px 0",
          width: "80%",
          maxWidth: "1200px",
          backgroundColor: "#ffffff",
          boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "auto",
            borderRadius: "10px",
          }}
        />
        <div style={{ flex: "1" }}>
          <h1 style={{ marginBottom: "10px" }}>{product.name}</h1>
          <h2 style={{ color: "#007bff", fontSize: "1.5em" }}>
            Price: {product.price}
          </h2>
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#007bff",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              fontSize: "1em",
              borderRadius: "5px",
              cursor: "pointer",
              margin: "10px 0",
            }}
          >
            Add to Cart
          </button>
          <Link
            onClick={async (event) => {
              await handleSubmit(event);
              navigate("/cart");
            }}
            style={{
              display: "inline-block",
              textDecoration: "none",
              color: "#dc3545",
              fontSize: "1em",
              marginTop: "10px",
              marginLeft: "15px",
              cursor: "pointer",
            }}
          >
            Buy Now
          </Link>
          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
          )}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f9f9f9",
          boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
          borderRadius: "15px",
          padding: "20px",
          width: "80%",
          maxWidth: "800px",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Product Description</h2>
        <p style={{ fontSize: "1em", lineHeight: "1.6", color: "#555" }}>
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;
