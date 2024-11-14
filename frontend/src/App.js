import React, { useState, useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProductList from "./components/ProductList"; // Make sure this path is correct
import ProductDetails from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./Layout";
import Cart from "./pages/Cart";
import CompletePage from "./pages/CompletePage";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./pages/CheckoutForm";
import axios from "axios";
import { CartContext } from "./contexts/CartContext";
import Profile from "./pages/Profile";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);
function App() {
  const [clientSecret, setClientSecret] = useState("");
  const [dpmCheckerLink, setDpmCheckerLink] = useState("");
  const { totalPrice } = useContext(CartContext);

  const getIntent = async (cart) => {
    try {
      if (totalPrice > 0) {
        const res = await axios.post(
          "http://localhost:5000/api/create-payment-intent",
          {
            products: cart.products.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            amount: Math.round(totalPrice * 100),
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        // Assuming the response data contains clientSecret and dpmCheckerLink
        setClientSecret(res.data.clientSecret);
        console.log(totalPrice);

        // [DEV] For demo purposes only
        setDpmCheckerLink(res.data.dpmCheckerLink);
      } else {
        throw new Error(
          "Total price must be greater than zero to create a payment intent."
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const appearance = {
    theme: "stripe",
  };
  // Enable the skeleton loader UI for optimal loading.
  const loader = "auto";

  return (
    <Router>
      {clientSecret && (
        <Elements
          options={{ clientSecret, appearance, loader }}
          stripe={stripePromise}
        >
          <Routes>
            <Route
              path="/checkout"
              element={
                <Layout>
                  <CheckoutForm dpmCheckerLink={dpmCheckerLink} />{" "}
                </Layout>
              }
            />
          </Routes>
        </Elements>
      )}
      <Elements stripe={stripePromise}>
        <Routes>
          <Route
            path="/complete"
            element={
              <Layout>
                {" "}
                <CompletePage />{" "}
              </Layout>
            }
          />
        </Routes>
      </Elements>
      <Routes>
        <Route
          element={
            <Layout>
              <ProductDetails />
            </Layout>
          }
          path="/product/:id"
        />
        <Route
          path="/"
          element={
            <Layout>
              <ProductList />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/cart"
          element={
            <Layout>
              <Cart getIntent={getIntent} />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />

        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
