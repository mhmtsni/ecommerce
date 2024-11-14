import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ products: [] });
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderHistory, setOrderHistory] = useState([]);
  useEffect(() => {
    if (cart && Array.isArray(cart.products)) {
      const total = cart.products.reduce((sum, product) => {
        const price = parseFloat(product.price.split("$")[1]);
        return sum + price * product.quantity;
      }, 0);
      setTotalPrice(total.toFixed(2));
    }
  }, [cart]);

  const addOrderHistory = useCallback(
    async (currentCart, currentTotalPrice) => {
      try {
        await axios.post(
          "http://localhost:5000/api/create-order-history",
          {
            products: currentCart.products.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            total_price: currentTotalPrice,
          },
          {
            withCredentials: "true",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const getOrderHistory = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/get-order-history",
        {
          withCredentials: "true",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setOrderHistory(data.order_history);
    } catch (error) {
      throw error;
    }
  };

  const addToCart = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/add-cart",
        {
          id,
        },
        {
          withCredentials: "true",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      throw error;
    }
  };
  const getCart = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/get-cart", {
        withCredentials: "true",
      });
      setCart(data);
    } catch (error) {
      throw error;
    }
  };
  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-from-cart/${id}`, {
        withCredentials: "true",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCart((prevItems) => {
        if (prevItems && Array.isArray(prevItems.products)) {
          return {
            ...prevItems,
            products: prevItems.products.filter((item) => item.id !== id),
          };
        } else {
          return prevItems;
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCart = async () => {
    try {
      await axios.delete("http://localhost:5000/api/delete-cart", {
        withCredentials: "true",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCart([]);
      setTotalPrice(0);
    } catch (error) {
      console.error(error);
    }
  };

  const changeQuantity = async (id, increase) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/change-quantity/${id}`,
        {
          increase,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setCart((prevItems) => {
        if (prevItems && Array.isArray(prevItems.products)) {
          return {
            ...prevItems,
            products: prevItems.products
              .map((item) => {
                if (item.id === id) {
                  const newQuantity = increase
                    ? item.quantity + 1
                    : item.quantity - 1;
                  return newQuantity > 0
                    ? { ...item, quantity: newQuantity }
                    : null; // Return null to indicate item should be removed
                }
                return item; // Return unchanged item for all other items
              })
              .filter((item) => item !== null), // Remove items with quantity zero
          };
        } else {
          return prevItems;
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    addToCart,
    getCart,
    cart,
    deleteItem,
    changeQuantity,
    totalPrice,
    deleteCart,
    addOrderHistory,
    getOrderHistory,
    orderHistory,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
