import json
import traceback
from flask import Blueprint, request, jsonify, g
from utils import get_token
from config import client, DATABASE_NAME, USER_COLLECTION
from views import validate_token
db = client[DATABASE_NAME]
dbUser = db["user"]
user = Blueprint('user', __name__)
user_collection = client[DATABASE_NAME][USER_COLLECTION]


from flask import jsonify, request
import re
from datetime import datetime

# Helper function to validate email format
def is_valid_email(email):
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email)

@user.route('/user/auth/register', methods=['POST'])
def register():
    """
    User Registration
    ---
    tags:
      - user
    parameters:
      - in: body
        name: body
        schema:
          id: UserRegistration
          required:
            - username
            - password
            - email
          properties:
            username:
              type: string
              description: The user's username.
            password:
              type: string
              description: The user's password.
            email:
              type: string
              description: The user's email address.
    responses:
      200:
        description: Registration Successful
      500:
        description: Registration Failed
    """
    try:
        username = request.json.get('username')
        password = request.json.get('password')
        email = request.json.get('email')
        
        if email and not is_valid_email(email):
            return jsonify({"code": 500, "msg": "Invalid email format!"})
        # check if the email or username already exists in database
        regist_user = dbUser.find_one({"$or": [{"username": username}, {"email": email}]})
        if not regist_user:
            regist_user = {"username": username, "password": password, "email": email}
            dbUser.insert_one(regist_user)
            content = {"code": 200, "msg": "SUCCESS"}
        else:
            content = {"code": 500, "msg": "Register failed! The username or email already exists!"}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)

@user.route('/user/auth/login', methods=['POST'])
def login():
    """
    User Login
    ---
    tags:
      - user
    parameters:
      - in: body
        name: body
        schema:
          id: UserLogin
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: The user's username.
            password:
              type: string
              description: The user's password.
    responses:
      200:
        description: Login Successful and return token with user info
      500:
        description: Login Failed
    """
    username = request.json.get('email')
    password = request.json.get('password')
    try:
        # check if the user exists in database usernmae and password or email and password
        login_user = dbUser.find_one({"$or": [
            {"username": username, "password": password}, 
            {"email": username, "password": password}]
            })
        if login_user:
            token = get_token(login_user.get("username"))
            token_gen_time = datetime.now()
            # update the token and token_gen_time according to the username or email
            dbUser.update_one({"$or": [{"username": username}, {"email": username}]}, {"$set": {"token": token, "token_gen_time": token_gen_time}})
            # pop the password field
            login_user.pop("password")
            content = {
                "code": 200, 
                "msg": "SUCCESS", 
                "data": {
                    "token": token, 
                    "user":{
                        "username": login_user.get("username"),
                        "email": login_user.get("email"),
                    }
                  }  
                }
        else:
            content = {"code": 500, "msg": "username or password is wrong!"}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)

@user.route('/user/auth/<username>', methods=['GET'])
def get_user(username):
    """
    Get User Info
    ---
    tags:
      - user
    parameters:
      - in: path
        name: username
        required: true
        type: string
        description: Unique identifier of the user
    responses:
      200:
        description: User Info
        schema:
          type: object
          properties:
            username:
              type: string
              description: The user's username.
            email:
              type: string
              description: The user's email address.
            reviews:
              type: array
              description: The user's reviews.
              items:
                type: object
                properties:
                  review_id:
                    type: string
                    description: The review's unique identifier.
                  review:
                    type: string
                    description: The review's content.
                  update_time:
                    type: string
                    description: The review's update time.
                  timestamp:
                    type: integer
                    description: The review's timestamp.
      500:
        description: User Not Found
    """
    try:
        user = dbUser.find_one({"username": username})
        if user:
            user.pop("password")
            # pop _id field
            user.pop("_id")
            content = {"code": 200, "msg": "SUCCESS", "data": user}
        else:
            content = {"code": 500, "msg": "User not found!"}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)

# 收藏游戏
@user.route('/api/v1/user/collectBook/<bookId>', methods=['PUT'])
@validate_token
def collect_book(bookId):
    """
    Collect a Book
    ---
    tags:
      - user
    summary: Collect a book
    description: >
      This endpoint allows for the collection of a book. 
      The book is identified by its ID.
    parameters:
      - in: path
        name: bookId
        required: true
        type: string
        description: Unique identifier of the book
    responses:
      200:
        description: Book collected successfully
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 200
            msg:
              type: string
              example: SUCCESS
      500:
        description: Error in collecting the book
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 500
            msg:
              type: string
              example: Error in collecting the book
    """
    try:
        username = g.user.get("username")
        book_id = bookId
        user_collection.update_one({"username": username}, {"$addToSet": {"collect": book_id}})
        content = {"code": 200, "msg": "SUCCESS"}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)


# 取消收藏
@user.route('/api/v1/user/cancelCollectBook/<bookId>', methods=['DELETE'])
@validate_token
def cancel_collect_book(bookId):
    """
    Cancel Collect a Book
    ---
    tags:
      - user
    summary: Cancel Collect a book
    description: >
      This endpoint allows for the cancel collection of a book. 
      The book is identified by its ID.
    parameters:
      - in: path
        name: bookId
        required: true
        type: string
        description: Unique identifier of the book
    responses:
      200:
        description: Book cancel collected successfully
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 200
            msg:
              type: string
              example: SUCCESS
      500:
        description: Error in cancel collecting the book
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 500
            msg:
              type: string
              example: Error in cancel collecting the book
    """
    try:
        username = g.user.get("username")
        book_id = bookId
        user_collection.update_one({"username": username}, {"$pull": {"collect": book_id}})
        content = {"code": 200, "msg": "SUCCESS"}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)
