import React, { useContext, useEffect } from "react";
import { CartContext } from "../contexts/CartContext";

function Profile() {
  const { orderHistory, getOrderHistory } = useContext(CartContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        await getOrderHistory();
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "85vh",
        padding: "20px",
        backgroundColor: "#f4f7fc",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: "15px",
        }}
      >
        {orderHistory
          .slice()
          .reverse()
          .map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "20px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1",
                  gap: "10px",
                }}
              >
                {item.products.map((product) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e6e6e6",
                    }}
                    key={product.id}
                  >
                    <h3
                      style={{
                        flex: "1",
                        textAlign: "left",
                        margin: 0,
                        color: "#333",
                        fontSize: "16px",
                      }}
                    >
                      {product.name}
                    </h3>
                    <h3
                      style={{
                        flex: "1",
                        textAlign: "center",
                        margin: 0,
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      Price: {product.price}
                    </h3>
                    <h3
                      style={{
                        flex: "1",
                        textAlign: "right",
                        margin: 0,
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      Quantity: {product.quantity}
                    </h3>
                  </div>
                ))}
              </div>
              <div
                style={{ textAlign: "right", flex: "0.3", minWidth: "150px" }}
              >
                <h3
                  style={{
                    margin: "0 0 10px",
                    color: "#333",
                    fontSize: "16px",
                  }}
                >
                  Date: {new Date(item.created_at).toLocaleDateString()}
                </h3>
                <h3
                  style={{
                    margin: 0,
                    color: "#3a86ff",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Total: ${item.total_price}
                </h3>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Profile;
