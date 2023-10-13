from flask import *
from mysql.connector import pooling
from flask_cors import CORS
from datetime import datetime, timedelta
import mysql.connector
import json
import requests
import jwt
from dotenv import load_dotenv
import os

load_dotenv()

app=Flask(__name__)
app.secret_key = 'your_secret_key'

def results_convert(result):
	response = Response(json.dumps(result,ensure_ascii = False), content_type = 'application/json; charset = utf-8')
	return response

#串聯資料庫
con ={
    'user':'root',
    'password':'password',
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

user_blueprint = Blueprint('api_user',__name__,template_folder= 'api')

#註冊會員
@user_blueprint.route("/user",methods=["POST"])
def memberSignup():
	data = request.get_json()
	username = data.get("name")
	email = data.get("email")
	password = data.get("password")
	emailList = list(connect("SELECT email FROM member"))
	check = False
	for item in emailList:
		if email in item[0]:
			result = {"error": True,"message": "此信箱已註冊"}
			finalresult = results_convert(result)
			status = 400
			check = True
			break
	if check == False:
		try:
			connect("INSERT INTO member(name,email,password) VALUES(%s,%s,%s)",(username,email,password))
			result = {"ok":True}
			finalresult = results_convert(result)
			status = 200
			# return finalresult
		except Exception as err:
			result = {"error": True,"message": err}
			finalresult = results_convert(result)
			status = 500
	return finalresult,status
			
#登入會員api
@user_blueprint.route("/user/auth", methods=["PUT"])
def login_put():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    memberInfor = connect("SELECT email,password FROM member")
    try:
        if (email,password) in memberInfor:
            baseInfor = connect("SELECT id,name,email FROM member WHERE email = %s AND password = %s",(email,password))
            filedict = {
                "id":baseInfor[0][0],
                "name":baseInfor[0][1],
                "email":baseInfor[0][2],
                "exp":datetime.utcnow()+timedelta(days=7)
            }
            encode_token = jwt.encode(filedict, 'private_key',algorithm='HS256')
            return jsonify({"token":encode_token})
        else:
            if email not in memberInfor[0]:
                result = {"error": True,"message": "此信箱未註冊"}
                finalresult = results_convert(result)
                return finalresult,400
            elif email in memberInfor[0] or password in memberInfor[1]:
                result = {"error": True,"message": "信箱或密碼錯誤"}
                finalresult = results_convert(result)
                return finalresult,400
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        return finalresult,500
	
@user_blueprint.route("/user/auth", methods=["GET"])
def login_get():
    try:
        token = request.headers.get('Authorization')
        if token:
            decode_token = token.split('Bearer ')
            information = jwt.decode(decode_token[1], 'private_key', algorithms=['HS256'])
            return jsonify({"data":information})
        else:
            return redirect("/")
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        return finalresult,500