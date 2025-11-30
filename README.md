# Collaborative Bill Sharing System

A web-based platform that helps friends, roommates, or groups track shared expenses, settle balances, and manage transactions with ease. This application demonstrates how a Flask backend with MySQL can power a collaborative expense tracking system with real-time balance calculations and transaction history.

## Tech Stack

- **Flask**: A minimalistic Python framework that provides essential components for building web applications. In this project, Flask handles routing, request processing, and API endpoints.
- **MySQL**: The relational database system that stores user data, expenses, friendships, and transaction history.
- **PyMySQL**: A MySQL client library for Python.
- **HTML/CSS/JavaScript**: Frontend technologies for building an interactive and responsive user interface.
- **Bootstrap 5**: CSS framework used for responsive styling and layout in the application, providing pre-designed components like navigation bars, modals, and forms.

## Functionalities

The Collaborative Bill Sharing System is a CRUD (Create, Read, Update, Delete) application offering the following key functionalities:

- **User Authentication**: Allows users to register new accounts and log in securely with password hashing.
- **Add Friends**: Users can add friends to their network for expense sharing.
- **Create Expenses**: Users can record shared expenses with multiple friends and split costs equally or with custom amounts.
- **View Balances**: Displays friend balances with dynamic coloring (Green = they owe you, Red = you owe them).
- **Settle Balances**: Users can settle up debts with friends, recording the payment transactions.
- **Activity History**: View a chronological list of all expenses and settlements.
- **Search & Filter**: Search for friends and filter to show/hide zero-balance accounts.
- **Transaction Details**: Click on friends to view detailed transaction history.

## Database Schema

The application uses a MySQL database with the following entity relationships:

### ER Diagram

_[ER Diagram placeholder - To be added]_

### Database Tables

- **users**: Stores user account information (id, name, email, password_hash, phone)
- **friendships**: Manages friend relationships between users
- **expenses**: Records shared expenses with details and split information
- **transactions**: Tracks all financial transactions and settlements between users

## Local setup

### Dependencies

- Python 3.8+
- MySQL server 8+

### Setting up Python Environment and Installing Packages

- Create and activate a Python virtual environment (Windows)

```powershell
python -m venv venv
venv\Scripts\activate
```

- Create and activate a Python virtual environment (Linux)

```bash
python3 -m venv venv
source venv/bin/activate
```

- Install required Python packages

```bash
pip install flask PyMySQL python-dotenv flask-cors
```

Alternatively, you can install all the Python packages from the requirements.txt (if available)

```bash
pip install -r requirements.txt
```

### Setting up MySQL Database

- Create the database and tables by running the SQL schema:

```bash
mysql -u root -p < schema.sql
```

- Update the `.env` file with your MySQL database credentials:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=bill_sharing_db
SECRET_KEY=your_secret_key
```

### Running the Flask App

After setting up the database, start the Flask application:

```bash
cd backend
python app.py
```

The backend API will run at `http://127.0.0.1:5000/`.

### Running the Frontend

Open the `frontend/index.html` file in your web browser, or serve it using a simple HTTP server:

```bash
cd frontend
python -m http.server 8000
```

The frontend will be available at `http://127.0.0.1:8000/`.

## Project Structure

```
Collaborative Bill Sharing System/
│
├── .env                      # Environment variables (database credentials, secret key)
├── README.md                 # Project documentation
│
├── backend/
│   └── app.py               # Flask application with API endpoints
│
└── frontend/
    ├── index.html           # Login page
    ├── register.html        # User registration page
    ├── dashboard.html       # Main dashboard for managing expenses
    │
    ├── css/
    │   └── style.css        # Custom styles for the application
    │
    └── js/
        └── script.js        # Frontend logic for user interactions
```

## API Endpoints

The Flask backend provides the following REST API endpoints:

- **POST** `/api/register` - Register a new user
- **POST** `/api/login` - Authenticate user login
- **GET** `/api/friends` - Get list of friends for logged-in user
- **POST** `/api/add-friend` - Add a new friend
- **POST** `/api/expense` - Create a new shared expense
- **GET** `/api/expenses` - Get all expenses for the user
- **GET** `/api/balances` - Get balance summary with all friends
- **POST** `/api/settle` - Settle a balance with a friend
- **GET** `/api/transactions/<friend_id>` - Get transaction history with a specific friend

## Screenshots

### Login Page

_[Screenshot placeholder - To be added]_

### Dashboard - Friends View

_[Screenshot placeholder - To be added]_

### Dashboard - Activity View

_[Screenshot placeholder - To be added]_

### Add Expense Modal

_[Screenshot placeholder - To be added]_

## References

- [Flask docs](https://flask.palletsprojects.com/en/3.0.x/quickstart/)
- [PyMySQL docs](https://pymysql.readthedocs.io/en/latest/user/installation.html)
- [Bootstrap 5 docs](https://getbootstrap.com/docs/5.0/getting-started/introduction/)
- [MySQL docs](https://dev.mysql.com/doc/)

