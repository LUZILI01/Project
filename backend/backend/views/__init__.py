# -*- coding: utf-8 -*-
import datetime
from functools import wraps
from flask import g,jsonify,request
from config import user_collection

def validate_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == "GET" and request.path == "/api/v1/book/getBooks":
            return f(*args, **kwargs)
        token = request.headers.get('Authorization')
        token = token.split(" ")[-1] if token else None
        if token is None:
            return jsonify({"code": 401, "msg": "No token provided"}), 401

        user = user_collection.find_one({"token": token})
        if user is None or user.get("token") != token:
            return jsonify({"code": 401, "msg": "Invalid token"}), 401
        token_gen_time = user.get("token_gen_time")
        if token_gen_time and datetime.datetime.now() - token_gen_time > datetime.timedelta(hours=1):  # Assuming 1 hour validity
            return jsonify({"code": 401, "msg": "Token has expired"}), 401

        g.user = user  # Store user info in global object g if needed in route
        return f(*args, **kwargs)

    return decorated_function