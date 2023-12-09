import uuid
import time
import datetime
from bson import ObjectId
from views import validate_token
from flask import Blueprint, request, jsonify
from config import client, DATABASE_NAME, COLLECTION
from flask import g

review = Blueprint('review', __name__)
book_collection = client[DATABASE_NAME][COLLECTION]
user_collection = client[DATABASE_NAME]["user"]


@review.route('/api/v1/book/addReview/<bookId>', methods=['PUT'])
@validate_token
def add_review(bookId):
    """
    Add a Review to a Book
    ---
    tags:
      - review
    summary: Adds a user's review to a specific book
    description: >
      This endpoint allows a user to add a review to a book. The user must provide the book ID, their username, and the review content.
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: body
        name: body
        description: Review details
        required: true
        schema:
          type: object
          properties:
            bookId:
              type: string
              description: Unique identifier of the book
              example: 507f1f77bcf86cd799439011
            username:
              type: string
              description: Username of the reviewer
              example: johndoe
            review:
              type: string
              description: Content of the review
              example: This is an amazing book!
    responses:
      200:
        description: Review added successfully
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 200
            msg:
              type: string
              example: SUCCESS
            data:
              type: object
              properties:
                update_time:
                  type: string
                  example: '2023-04-01 12:30:45'
      500:
        description: Error adding the review
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 500
            msg:
              type: string
    """
    try:
        book_id = bookId
        username = g.user.get("username")
        content = request.json.get('review')
        format_now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        # check book_id is exist
        if not book_collection.find_one({
            "_id":ObjectId(book_id)
        }):
            raise Exception("The book id doesn't exist")
        review_document = {
            "book_id": book_id,
            "review_id": str(uuid.uuid1()),
            "username": g.user.get("username"),
            "review": content,
            "update_time": format_now,
            "timestamp": int(time.time())
        }
        book_collection.update_one(
            {"_id": ObjectId(book_id)},
            {"$push": {"reviews": review_document}}
        )
        # update the collection of the user
        user_collection.update_one(
            {"username": username},
            {"$push": {"reviews": review_document}}
        )
        content = {"code": 200, "msg": "SUCCESS", "data": {"update_time": format_now}}
    except Exception as e:
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)



@review.route('api/v1/book/deleteReview/<bookId>/<reviewId>', methods=['DELETE'])
@validate_token
def remove_review(bookId,reviewId):
    """
    Delete a Review from a Book
    ---
    tags:
      - review
    summary: Deletes a specific review from a book
    description: >
      This endpoint allows for the deletion of a specific review from a book. 
      The book and review are identified by their respective IDs.
    parameters:
      - in: path
        name: bookId
        required: true
        type: string
        description: Unique identifier of the book
      - in: path
        name: reviewId
        required: true
        type: string
        description: Unique identifier of the review
    responses:
      200:
        description: Review deleted successfully
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
        description: Error in deleting the review
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 500
            msg:
              type: string
    """
    try:
        book_collection.update_one(
            {"_id": ObjectId(bookId)},
            {"$pull": {"reviews": {"review_id": reviewId}}}
        )
        user_collection.update_one(
            {"username": g.user.get("username")},
            {"$pull": {"reviews": {"review_id": reviewId}}}
        )
        content = {"code": 200, "msg": "SUCCESS"}
    except Exception as e:
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)

