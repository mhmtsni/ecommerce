import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

export default function Cart({ getIntent }) {
  const navigate = useNavigate();
  const { cart, getCart, deleteItem, changeQuantity, totalPrice } =
    useContext(CartContext);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getItems = async () => {
      try {
        await getCart();
      } catch (error) {
        console.log(error);
      }
    };
    getItems();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        backgroundColor: "#f7f9fc",
      }}
    >
      <div
        style={{
          width: "80%",
          maxWidth: "1200px",
          marginBottom: "80px",
          marginLeft: "150px",
        }}
      >
        {cart && cart.products && cart.products.length > 0 ? (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}
          >
            {cart.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                size={"200px"}
                flexDirection={"row"}
                showDescription={false}
                gap={"70px"}
                deleteItem={deleteItem}
                changeQuantity={changeQuantity}
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", fontSize: "1.2em", color: "#666" }}>
            Your cart is empty.
          </p>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          right: "50px",
          top: "150px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          zIndex: 10,
          width: "250px",
        }}
      >
        <h1 style={{ margin: "0 0 15px 0", fontSize: "1.5em", color: "#333" }}>
          Cart total: ${totalPrice}
        </h1>
        <button
          style={{
            padding: "12px 24px",
            fontSize: "1em",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0px 4px 8px rgba(0, 123, 255, 0.2)",
            transition: "background-color 0.3s ease",
          }}
          onClick={async () => {
            try {
              await getIntent(cart);
              navigate("/checkout");
            } catch (error) {
              console.log(error.message);
              setErrorMessage(
                error.response?.data?.error ||
                  error.message ||
                  "An unexpected error occurred. Please try again."
              );
              setError(true);
            }
          }}
        >
          Buy now
        </button>
        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
