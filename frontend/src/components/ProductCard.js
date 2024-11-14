import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  product,
  size,
  flexDirection,
  showDescription,
  gap,
  deleteItem,
  changeQuantity,
}) => {
  const navigate = useNavigate();

  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  const onClick = (product_id) => {
    navigate(`/product/${product_id}`);
  };

  return (
    <div
      onClick={() => onClick(product.id)}
      className="product-card"
      style={{
        display: "flex",
        flexDirection: flexDirection,
        backgroundColor: "white",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        gap: gap,
        alignItems: "center",
        padding: "20px",
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
    >
      <h1 style={{ textAlign: "center", width: "120px", color: "#333" }}>
        {product.name}
      </h1>
      <img
        style={{
          width: size,
          height: size,
          borderRadius: "8px",
        }}
        src={product.image_url}
        alt={product.name}
      />
      <h1 style={{ color: "#3a86ff", fontSize: "1.1em" }}>{product.price}</h1>
      {showDescription && (
        <p style={{ textAlign: "center", color: "#555" }}>
          {truncateText(product.description, 100)}
        </p>
      )}

      {!showDescription && (
        <>
          <h1 style={{ color: "#555" }}>Quantity: {product.quantity}</h1>
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeQuantity(product.id, true);
            }}
            style={{
              padding: "6px 12px",
              fontSize: "0.9em",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeQuantity(product.id, false);
            }}
            style={{
              padding: "6px 12px",
              fontSize: "0.9em",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            -
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(product.id);
            }}
            style={{
              padding: "6px 12px",
              fontSize: "0.9em",
              backgroundColor: "#ffc107",
              color: "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default ProductCard;
