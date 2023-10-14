from flask import *
from functools import wraps

from module_function.env_file import *
from module_function.database import *
from module_function.file_type_convert import *

from api.api_orders import orders_blueprint
from api.api_attractions import attractions_blueprint
from api.api_user import user_blueprint
from api.api_mrts import mrts_blueprint
from api.api_booking import booking_blueprint

app=Flask(__name__)
app.secret_key = app_key

#api
app.register_blueprint(orders_blueprint,url_prefix= '/api')
app.register_blueprint(attractions_blueprint,url_prefix= '/api')
app.register_blueprint(mrts_blueprint,url_prefix= '/api')
app.register_blueprint(booking_blueprint,url_prefix= '/api')
app.register_blueprint(user_blueprint,url_prefix= '/api')

#頁面路徑
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(debug=True, host="0.0.0.0", port=3000)