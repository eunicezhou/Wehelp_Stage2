from flask import *
import mysql.connector
from mysql.connector import pooling
from flask_cors import CORS
import json
import jwt
import requests
from dotenv import load_dotenv
import os

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

#串聯資料庫
con ={
    'user':'root',
    'password':database_password,
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

booking_blueprint = Blueprint('api_booking',__name__,template_folder= 'api')

#api路徑
@booking_blueprint.route("/booking",methods=["POST"])
def booking_post():
    try:
        data = request.get_json()
        attractionID = int(data['attractionId'])
        attractionInfor = connect("SELECT attraction,address FROM attraction WHERE id = %s",(attractionID,))
        attractionName = attractionInfor[0][0]
        attractionAddress =  attractionInfor[0][1]
        attractionImage = connect("SELECT image FROM img WHERE attraction_id=%s LIMIT 1",(attractionID,))
        date = data['date']
        time = data['time']
        price = data['price']
        token = request.headers.get('Authorization')
        if date and time and price:
            purchase = {"attraction": {
                    "id": attractionID,
                    "name": attractionName,
                    "address": attractionAddress,
                    "image": attractionImage
                    },
                    "date": date,
                    "time": time,
                    "price": price}
            session["data"] = purchase
            result = {"ok":True}
            finalresult = results_convert(result)
            return finalresult
        elif not token:
            result = {"error": True,"message": "請確認登入帳戶"}
            finalresult = results_convert(result)
            return finalresult,403
        else:
            result = {"error": True,"message": "請確認所有欄位皆有點選"}
            finalresult = results_convert(result)
            return finalresult,400
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        return finalresult,500

@booking_blueprint.route("/booking",methods=["GET"])
def booking_get():
    try:
        if session == {}:
            result = {"data":"尚無任何資料"}
            finalresult = results_convert(result)
            return finalresult
        else:
            data=session["data"]
            return results_convert(data)
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        return finalresult,500
    
@booking_blueprint.route("/booking",methods=["DELETE"])
def booking_delete():
    try:
        token = request.headers.get('Authorization')
        if token == None:
            result = {"error": True,"message": "使用者未登入"}
            finalresult = results_convert(result)
            return finalresult,400
        elif token:
            session.clear()
            result = {"ok":True}
            finalresult = results_convert(result)
            return finalresult
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        return finalresult,500