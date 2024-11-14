from datetime import timedelta
from flask import Flask, abort, jsonify, request, session
from flask_cors import CORS
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
import click
import re
from os import urandom, getenv
from hashlib import pbkdf2_hmac
from sqlalchemy.ext.hybrid import hybrid_property
import stripe
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app, supports_credentials=True, methods=["GET", "POST", "DELETE", "PATCH"])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = getenv('FLASK_SECRET_KEY')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SECURE'] = True   
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1) 
app.config["SESSION_COOKIE_SAMESITE"] = "None"
stripe.api_key = getenv('STRIPE_KEY')
Session(app)
db = SQLAlchemy(app)


order_history_product = db.Table(
    'order_history_product',
    db.Column('order_history_id', db.Integer, db.ForeignKey('order_history.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True),
    db.Column('quantity', db.Integer, nullable=False)  
)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    def to_dict(self):
        """Convert the product instance to a dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "image_url": self.image_url,
            "price": self.price,
            "description": self.description
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    hash = db.Column(db.String(200), nullable=False)
    salt = db.Column(db.String(200), nullable=False)
    carts = db.relationship("UserCart", backref="user", lazy=True)

class UserCart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1) 
    
    _total_amount = db.Column('total_amount', db.Integer, nullable=False, default=0)
    product = db.relationship("Product", lazy=True)
    
    @hybrid_property
    def total_amount(self):
        if self.product and self.product.price:
            return self.quantity * float(self.product.price.split("$")[1])
        return 0

    @total_amount.setter
    def total_amount(self, value):
        self._total_amount = value

    def update_total_amount(self):
        """Call this method to update total_amount in the database."""
        self._total_amount = self.total_amount

class OrderHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    total_price = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    products = db.relationship("Product", secondary=order_history_product, lazy="subquery",
                               backref=db.backref("order_histories", lazy=True))
@app.cli.command('initdb')
def init_db():
    """Initialize the database."""
    with app.app_context():
        db.create_all()
        click.echo('Initialized the database with tables.')


@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@app.route("/api/products/<int:id>", methods=["GET"])
def get_product(id):
    product = Product.query.get(id)
    if product is None:
        abort(404, description="Product not found")
    return jsonify(product.to_dict())

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    existing_username = User.query.filter_by(username=username).first()
    existing_email = User.query.filter_by(email=email).first()

    if existing_username:
        return jsonify({"error": "Username already in use"}), 400
    if existing_email:
        return jsonify({"error": "Email already in use"}), 400

    salt, hashed_password = hash_password_pbkdf2(password)
    new_user = User(username=username, email=email, hash=hashed_password, salt=salt)
    db.session.add(new_user)
    db.session.commit()

    session["user"] = username

    return jsonify({"success": "User registered successfully"}), 200


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username or password are required"}), 400
    existing_user = User.query.filter_by(username=username).first()
    if not existing_user:
        return jsonify({"error": "Username doesn't exist"}), 400
    hash, salt = db.session.query(User.hash, User.salt).filter_by(username=username).first()
    check_password = check_password_pbkdf2(password, salt, hash)
    if not check_password:
        return jsonify({"error": "Password is incorrect"}), 400
    session["user"] = username
    return jsonify({"success": "Logged in succesfully"}), 200

@app.route("/api/add-cart", methods=["POST"])
def add_cart():
    if not session.get("user"):
        return jsonify({"error": "Please log in"}), 400
    data = request.get_json()
    product_id = data.get("id")
    username = session.get("user")
    user_id = User.query.filter_by(username=username).first().id
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    existing_cart_item = UserCart.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing_cart_item:
        existing_cart_item.quantity += 1
        existing_cart_item.update_total_amount()
    else:
        new_cart_item = UserCart(user_id=user_id, product_id=product_id, quantity=1)
        new_cart_item.total_amount = float(product.price.split("$")[1])
        db.session.add(new_cart_item)
    
    db.session.commit()
    return jsonify({"error": "Added sucessfully"}), 200


@app.route("/api/get-cart", methods=["GET"])
def get_cart():
    if not session.get("user"):
        return jsonify({"error": "Please log in"}), 400
    username = session["user"]
    user = User.query.filter_by(username=username).first()
    carts = user.carts
    products = []
    for cart_item in carts:
        product = cart_item.product
        products.append({
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "description": product.description,
        "image_url": product.image_url,
        "quantity": cart_item.quantity
    })
    return jsonify({"products": products}), 200


@app.route("/api/delete-from-cart/<int:id>", methods=["DELETE"])
def delete_from_cart(id):
    if not session.get("user"):
        return jsonify({"error": "Please log in"}), 400
    try:
        username = session["user"]
        user = User.query.filter_by(username=username).first()

        if not user:

            return jsonify({"error": "User not found"}), 404

        user_id = user.id

        item = UserCart.query.filter_by(product_id=id, user_id=user_id).one_or_none()
        if not item:
            return jsonify({"error": "Item not found in cart"}), 404
        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": "Deleted Sucessfully"}), 200
    except Exception as e:
        return jsonify({"error": "Something went wrong", "details": str(e)}), 400    

@app.route("/api/change-quantity/<int:id>", methods=["PATCH"])
def change_quantity(id):
    if not session.get("user"):
        return jsonify({"error": "Please log in"}), 400
    
    try:
        data = request.get_json()
        increase = data.get("increase")
        
        if increase is None:
            return jsonify({"error": "Invalid data: 'increase' field is required"}), 400

        username = session.get("user")
        user = User.query.filter_by(username=username).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        item = UserCart.query.filter_by(product_id=id, user_id=user.id).one_or_none()
        if not item:
            return jsonify({"error": "Item not found in cart"}), 404
        
        if increase:
            item.quantity += 1
            item.update_total_amount()
        else:
            if item.quantity <= 1:
                db.session.delete(item)
                db.session.commit()
                return jsonify({"success": "Item removed from cart"}), 200
            else:
                item.quantity -= 1
                item.update_total_amount()

        db.session.commit()
        return jsonify({"success": "Quantity updated successfully", "quantity": item.quantity}), 200

    except Exception as e:
        return jsonify({"error": "Something went wrong", "details": str(e)}), 400


@app.route('/api/create-payment-intent', methods=['POST'])
def create_payment():
    if not session.get("user"):
        return jsonify({"error": "Please log in"})
    try:
        data = request.get_json()
        print(data)
        username = session["user"]
        amount_client = data.get("amount")
        amount_backend = 0
        user = User.query.filter_by(username=username).first()
        user_cart = UserCart.query.filter_by(user_id=user.id)
        for product in user_cart:
            amount_backend += int(product.total_amount * 100)
        print(amount_client, amount_backend)
        if float(amount_client) != amount_backend:
            return jsonify({"error": "There is a problem with the pricing "}), 400
        intent = stripe.PaymentIntent.create(
            amount=int(amount_backend),
            currency="usd",
            automatic_payment_methods={
                "enabled": True,
            }
            
        )
        return jsonify({
            'clientSecret': intent['client_secret'],
                # [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
                'dpmCheckerLink': 'https://dashboard.stripe.com/settings/payment_methods/review?transaction_id={}'.format(intent['id']),
        })
    except Exception as e:
        return jsonify(error=str(e)), 403

@app.route("/api/delete-cart", methods=["DELETE"])
def delete_cart():
    if not session.get("user"):
        return jsonify({"error": "Please log in"})
    try:
        username = session.get("user")
        user = User.query.filter_by(username=username).first()
        user_cart = UserCart.query.filter_by(user_id=user.id).all()
        for cart in user_cart:
            
            db.session.delete(cart)
        db.session.commit()
        return jsonify ({"successs": "deleted sucessfully"}), 200
    except Exception as e:
        return jsonify(error=str(e)), 403

@app.route("/api/create-order-history", methods=["POST"])
def create_order_history():
    if not session.get("user"):
        return jsonify({"error": "Please log in"})
    
    try:
        data = request.get_json()
        products = data.get("products", [])
        total_price = data.get("total_price")

        if float(total_price) <= 0:
            return jsonify({"error": "There is a problem with the pricing"}), 400

        username = session.get("user")
        user = User.query.filter_by(username=username).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        new_order_history = OrderHistory(
            user_id=user.id,
            total_price=total_price
        )
        db.session.add(new_order_history)
        db.session.flush()

        order_history_products = []
        for product_data in products:
            product_id = product_data['id']
            quantity = product_data.get("quantity", 1)
            order_history_products.append({
                "order_history_id": new_order_history.id,
                "product_id": product_id,
                "quantity": quantity
            })
        
        db.session.execute(order_history_product.insert(), order_history_products)
        
        db.session.commit()
        
        return jsonify({"success": "Order history created"})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 403


@app.route("/api/get-order-history", methods=["GET"])
def get_order_history():
    if not session.get("user"):
        return jsonify({"error": "Please log in"})
    try:
        username = session.get("user")
        user = User.query.filter_by(username=username).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        order_histories = OrderHistory.query.filter_by(user_id=user.id).all()
        order_history_list = []

        for order_history in order_histories:
            order_products = []
            
            for entry in db.session.query(order_history_product).filter_by(order_history_id=order_history.id).all():
                product = Product.query.get(entry.product_id)
                product_details = product.to_dict()
                product_details['quantity'] = entry.quantity 
                order_products.append(product_details)
            
            order_history_data = {
                "total_price": order_history.total_price,
                "products": order_products,
                "created_at": order_history.created_at
            }
            
            order_history_list.append(order_history_data)

        return jsonify({"order_history": order_history_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 403




        
@app.route('/api/check-session', methods=['GET'])
def check_session():
    if 'user' in session:
        return jsonify({"loggedIn": True, "username": session['user']}), 200
    else:
        return jsonify({"loggedIn": False}), 200
    
    
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


def is_valid_email(email):
    # Basic email regex pattern for validation
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

def hash_password_pbkdf2(password):
    salt = urandom(16)  # Generate a random salt
    hashed_password = pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt, hashed_password

# Verify the password with PBKDF2
def check_password_pbkdf2(password, salt, hashed_password):
    new_hash = pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return new_hash == hashed_password

if __name__ == '__main__':
    app.run(debug=True)
