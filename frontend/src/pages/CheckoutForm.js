import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Reusable Spinner Component
function Spinner() {
  return <div className="spinner" aria-hidden="true"></div>;
}

export default function CheckoutForm({
  dpmCheckerLink,
  returnUrl = `${window.location.origin}/complete`,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Wait for Stripe.js to load
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // Display error messages if any
    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "85vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="checkout-form">
        <form id="payment-form" onSubmit={handleSubmit}>
          <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

          <button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            className={`submit-button ${isLoading ? "loading" : ""}`}
          >
            {isLoading ? <Spinner /> : "Pay now"}
          </button>

          {message && (
            <div id="payment-message" role="alert" aria-live="polite">
              {message}
            </div>
          )}
        </form>

        <div id="dpm-annotation">
          <p>
            Payment methods are dynamically displayed based on customer
            location, order amount, and currency.&nbsp;
            <a
              href={dpmCheckerLink}
              target="_blank"
              rel="noopener noreferrer"
              id="dpm-integration-checker"
            >
              Preview payment methods by transaction
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
