from flask import *
import mysql.connector
from mysql.connector import pooling
import json
from datetime import datetime, timedelta
from functools import wraps
import pandas as pd
from dotenv import load_dotenv
import os
from api.api_orders import orders_blueprint
from api.api_attractions import attractions_blueprint
from api.api_user import user_blueprint
from api.api_mrts import mrts_blueprint
from api.api_booking import booking_blueprint

load_dotenv()

app_key = os.getenv('APP_SECRET_KEY')
database_password = os.getenv('DATABASE_PASSWORD')
token_key = os.getenv('TOKEN_KEY')
tappay_key = os.getenv('TAPPAY_PARTNER_KEY')

app=Flask(__name__)
app.secret_key = app_key

def results_convert(result):
	response = Response(json.dumps(result,ensure_ascii = False), content_type = 'application/json; charset = utf-8')
	return response
# app.config["JSON_AS_ASCII"]=False
# app.config["TEMPLATES_AUTO_RELOAD"]=True
# app.config["JSON_SORT_KEYS"] = False

#============串聯資料庫============================================================
con_password = os.getenv('DATABASE_PASSWORD')
con ={
    'user':'root',
    'password':con_password,
    'host':'localhost',
    'database':'stage2',
}
# 建立連接池
connection_pool = pooling.MySQLConnectionPool(pool_name='taipei-travel',pool_size=5,**con)
# 從連接池中取得連接
def connect(execute_str,execute_argument=None):
	connection = connection_pool.get_connection()
	cursor = connection.cursor()
	try:
		cursor.execute("USE stage2")
		cursor.execute(execute_str,execute_argument)
		result = cursor.fetchall()
		connection.commit()
	except Exception as err:
		print(err)
		result = None
	finally:
		cursor.close()
		connection.close()
	return result

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