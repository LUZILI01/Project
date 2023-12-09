import os
import traceback
from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_cors import CORS
import config as db
from views.user import user
from views.books import book
from views.reviews import review
from utils import init_admin

from flask_swagger import swagger
from flask_swagger_ui import get_swaggerui_blueprint


init_admin()
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config.from_object(db)
app.config['JSON_AS_ASCII'] = False
app.register_blueprint(user, url_prefix="/")
app.register_blueprint(book, url_prefix="/")
app.register_blueprint(review, url_prefix="/")
app.config["SECRET_KEY"] = 'a8dsd7dew8fewf8ewfewf434tg3g'


SWAGGER_URL = '/swagger'
API_URL = '/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Flask Swagger UI"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


@app.route(API_URL)
def swagger_api():
    return jsonify(swagger(app))

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5005, debug=True)
    except Exception:
        traceback.print_exc()

