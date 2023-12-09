
import time
import base64
import datetime
import traceback
from bson import ObjectId
from config import  user_collection, book_collection, COVER
from utils import JSONEncoder
from flask import Blueprint, request, jsonify, Response
from flask import g
from views import validate_token



UPLOAD_FOLDER = './static/images/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
book = Blueprint('book', __name__);


# Route for getting a list of books
@book.route('/api/v1/book/getBooks', methods=['POST','GET'])
@validate_token
def get_books():
    """
    Retrieve a list of books based on various query parameters.
    This endpoint supports pagination and allows filtering by title, author, and genre.

    ---
    tags:
      - books

    parameters:
      - in: query
        name: page
        type: integer
        required: false
        description: The page number for pagination. Defaults to 1 if not specified.
      - in: query
        name: size
        type: integer
        required: false
        description: The number of books per page for pagination. Defaults to 10 if not specified.
      - in: query
        name: Title
        type: string
        required: false
        description: A partial or full title to search for specific books.
      - in: query
        name: Author
        type: string
        required: false
        description: The author's name to filter books by a specific author.
      - in: query
        name: Genre
        type: string
        required: false
        description: The genre of the books to be filtered.

    responses:
      200:
        description: A list of books matching the provided query parameters. Each entry in the list contains detailed information about the book.
        schema:
            type: object
            properties:
            code:
                type: integer
                example: 200
            total:
                type: integer
                description: The total number of books matching the query.
                example: 50
            data:
                type: array
                items:
                type: object
                properties:
                  Title:
                    type: string
                    example: "The Great Gatsby"
                  Author:
                    type: string
                    example: "F. Scott Fitzgerald"
                  Genre:
                    type: string
                    example: "Classic"
                  Description:
                    type: string
                    example: "A novel set on Long Island during the Roaring Twenties..."
                  ISBN:
                    type: string
                    example: "1234567890"
                  Cover:
                    type: string
                    description: "Base64 encoded image string"
            msg:
                type: string
                example: "SUCCESS"
      401:
        description: Unauthorized access - either no token was provided, or the provided token is invalid or expired.
      500:
        description: An internal server error occurred, or an exception was raised during the process.
    """
    try:
        query_conditions = {}
        if request.method == "POST":
          page = request.json.get("page", 1)
          size = request.json.get("size", 1000)

          # Retrieve query parameters
          title = request.json.get("Title")
          author = request.json.get("Author")
          genre = request.json.get("Genre")

          # Building query conditions
          query_conditions = {}
          if title:
              query_conditions["Title"] = {"$regex": title, "$options": "i"}
          if author:
              query_conditions["Author"] = {"$regex": author, "$options": "i"}
          if genre:
              query_conditions["Genre"] = genre
        else:
          page = int(request.args.get("page", 1))
          size = int(request.args.get("size", 10))

        # Execute query
        # 不包括reviews字段
        data = book_collection.find(query_conditions, {"reviews": 0}).skip((page - 1) * size).limit(size).sort("update_time", -1)
        books = list(data)
        # 将books中的每个元素的cover转换为base64
        for book in books:
            book["bookId"] = str(book["_id"])
            
        total = book_collection.count_documents(query_conditions)
        content = {"code": 200, "total": total, "data": books, "msg": "SUCCESS"}
        content = JSONEncoder().encode(content)

    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}

    return Response(content, mimetype='application/json')



@book.route('/api/v1/book/addbook', methods=['POST'])
@validate_token
def add_book():
    """
    Add a new book to the book review system, including a base64 encoded image for the book cover.
    ---
    tags:
      - books
    parameters:
      - in: body
        name: book
        schema:
          type: object
          required:
            - Title
            - Author
            - Genre
          properties:
            Title:
              type: string
              description: The title of the book.
            Author:
              type: string
              description: The author of the book.
            Genre:
              type: string
              description: The genre of the book.
            Description:
              type: string
              description: A brief description of the book.
            ISBN:
              type: string
              description: The ISBN number of the book.
            Cover:
              type: string
              description: Base64 encoded image string for the book cover.
    responses:
      200:
        description: Book successfully added.
      400:
        description: Invalid data provided or book already exists.
      500:
        description: Internal server error or exception occurred.
    """
    try:
        book_data = request.json

        # Title, Author, and Genre are required fields
        required_fields = ["Title", "Author", "Genre"]
        for field in required_fields:
            if not book_data.get(field):
                return jsonify({"code": 400, "msg": f"Field: [{field}] is required"}), 400

        # Check if the book already exists
        existing_book = book_collection.find_one({"Title": book_data.get("Title")})
        if existing_book:
            return jsonify({"code": 400, "msg": f"A book with the title '{book_data.get('Title')}' already exists"}), 400

        # Validate and decode base64 image
        image_data = book_data.get("Cover")
        if image_data:
            try:
                book_data["Cover"] = image_data
            except Exception:
                return jsonify({"code": 400, "msg": "Invalid base64 image data"}), 400
        else:
            book_data["Cover"] = COVER
        # Adding timestamps
        book_data["date_added"] = datetime.datetime.now().strftime("%Y-%m-%d")
        book_data["update_time"] = time.time()

        # Insert the book data
        book_collection.insert_one(book_data)
        return jsonify({"code": 200, "msg": "Book successfully added"})
    except Exception as e:
        return jsonify({"code": 500, "msg": str(e)}), 500


@book.route('/api/v1/book/deleteBook/<bookId>', methods=['DELETE'])
@validate_token
def delete_book(bookId):
    """
        Delete a Book
    ---
    tags:
      - books
    parameters:
      - in: path
        name: bookId
        required: true
        schema:
          type: string
        description: The unique identifier of the book
    responses:
      200:
        description: Success message
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
        description: Error message
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
        book_collection.delete_one({"_id": ObjectId(bookId)})
        content = {"code": 200, "msg": "SUCCESS"}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    return jsonify(content)  

@book.route('/api/v1/book/updateBook', methods=['POST'])
@validate_token
def update_book():
    """
        Update a Book's Details
    ---
    tags:
      - books
    summary: Update the details of an existing book
    description: This endpoint updates a book's details. The book to be updated is identified by its ID, and the new details are passed in the request body.
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: body
        name: body
        description: Book object that needs to be updated
        required: true
        schema:
          type: object
          required:
            - _id
          properties:
            _id:
              type: string
              example: 507f1f77bcf86cd799439011
            Title:
              type: string
              description: The title of the book.
            Author:
              type: string
              description: The author of the book.
            Genre:
              type: string
              description: The genre of the book.
            Description:
              type: string
              description: A brief description of the book.
            ISBN:
              type: string
              description: The ISBN number of the book.
            Cover:
              type: string
              description: Base64 encoded image string for the book cover.
    responses:
      200:
        description: Book updated successfully
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
        description: Internal Server Error
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
        id = request.json.pop("_id")
        book_collection.update_one({"_id": ObjectId(id)}, {"$set": request.json})
        content = {"code": 200, "msg": "SUCCESS"}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    return JSONEncoder().encode(content)



# 获取收藏列表
@book.route('/api/v1/book/getCollectList', methods=['GET'])
@validate_token
def get_collect_list():
    """
    Get Collect List
    ---
    tags:
      - books
    summary: Get a list of books that the user has collected
    description: This endpoint returns a list of books that the user has collected.
    produces:
      - application/json
    responses:
      200:
        description: A list of books that the user has collected
      500:
        description: Internal Server Error

    """
    try:
        user_document = g.user
        book_ids = user_document.get("collect", [])
        collect_list = []
        # 批量查询book_ids
        for book_id in book_ids:
            book_document = book_collection.find_one({"_id": ObjectId(book_id)})
            book_document["bookId"] = str(book_document["_id"])
            collect_list.append(book_document)
        content = {"code": 200, "msg": "SUCCESS", "total": len(book_ids), "data": collect_list}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    content = JSONEncoder().encode(content)
    return Response(content, mimetype='application/json')

@book.route('/api/v1/book/detail/<bookId>', methods=['GET'])
@validate_token
def get_book_detail(bookId):
    """
        Get Book Detail
    ---
    tags:
      - books
    summary: Get details of a book
    description: This endpoint returns the details of a book, identified by its ID.
    produces:
      - application/json
    parameters:
      - in: path
        name: bookId
        description: The ID of the book to be retrieved
        required: true
        schema:
          type: string
          example: 507f1f77bcf86cd799439011
    responses:
      200:
        description: Book details
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 200
            data:
              type: object
              properties:
                Title:
                  type: string
                  example: "The Great Gatsby"
      500:
        description: Internal Server Error
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
        book_document = book_collection.find_one({"_id": ObjectId(bookId)})
        if not book_document:
            content = {"code": 404, "msg": "Book not found"}
            return jsonify(content), 404
        reviews = book_document.get("reviews",[])
        reviews.sort(key=lambda x: x["timestamp"], reverse=True)
        content = {"code": 200, "msg": "SUCCESS", "data": book_document}
    except Exception as e:
        traceback.print_exc()
        content = {"code": 500, "msg": str(e)}
    content = JSONEncoder().encode(content)
    return Response(content, mimetype='application/json')
    