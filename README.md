Ecommerce Website with Flask, React, and Stripe

This is a full-stack ecommerce website where users can browse products and make payments through Stripe. The backend is built with Flask, while the frontend is built with React.
Features

    Browse and filter products.
    Add products to the cart.
    Secure checkout using Stripe for payments.
    User authentication and session management.
    Responsive design for mobile and desktop users.

Tech Stack

    Frontend: React, React Router, Axios
    Backend: Flask, Flask-SQLAlchemy, Flask-CORS, Flask-Session
    Payment: Stripe
    Database: SQLite (or any other supported database)
    Environment Variables: .env for configuration

Getting Started
Prerequisites

    Node.js (for React)
    Python (for Flask)
    Stripe Account (for payment integration)

Installation
Backend (Flask)

    Navigate to the backend directory:

cd backend

Create a virtual environment:

python -m venv myenv

Activate the virtual environment:

    On macOS/Linux:

source myenv/bin/activate

On Windows:

    myenv\Scripts\activate

Install backend dependencies:

pip install -r requirements.txt

Create a .env file in the backend folder and add your Stripe keys and other sensitive environment variables:

STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key

Run the Flask server:

    python app.py

Frontend (React)

    Navigate to the frontend directory:

cd frontend

Install frontend dependencies:

npm install

Create a .env file in the frontend folder and add the Stripe publishable key:

REACT_APP_STRIPE_PUBLISHABLE_KEY=your_publishable_key

Run the React development server:

    npm start

Running the Application

    Once both the backend and frontend are running, open your browser and go to http://localhost:3000 (or the React server's URL).
    The Flask server should be running on http://localhost:5000.

Payment Integration

    The payment process is handled by Stripe. During checkout, users will be prompted to enter payment information securely via Stripe’s payment form.
    Test payments can be made using Stripe’s test card numbers. Example test card:
        Card Number: 4242 4242 4242 4242
        Expiry Date: Any valid future date
        CVC: Any 3-digit code

Directory Structure

/ecommerce-project
├── backend/
│   ├── app.py             # Main Flask application
│   ├── models.py          # Database models
│   ├── routes.py          # Flask routes (API endpoints)
│   ├── .env               # Environment variables (for Stripe keys)
│   ├── requirements.txt   # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React application
│   │   ├── components/    # React components
│   │   ├── services/      # Axios services for API requests
│   ├── .env               # Stripe publishable key for React
│   ├── package.json       # Frontend dependencies
├── README.md              # This README file
└── .gitignore             # Git ignore file

Contributing

    Fork the repository.
    Create a new branch (git checkout -b feature-branch).
    Make your changes.
    Commit your changes (git commit -m 'Add feature').
    Push to the branch (git push origin feature-branch).
    Open a pull request.

License

This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgements

    Flask
    React
    Stripe
    SQLAlchemy
