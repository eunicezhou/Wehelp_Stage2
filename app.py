from flask import *
import mysql.connector
from mysql.connector import pooling
from flask_cors import CORS
import json
import jwt
from datetime import datetime, timedelta
from functools import wraps
import uuid
import pandas as pd
import requests

app=Flask(__name__)
app.secret_key = 'your_secret_key'
#test
def results_convert(result):
	response = Response(json.dumps(result,ensure_ascii = False), content_type = 'application/json; charset = utf-8')
	return response
# app.config["JSON_AS_ASCII"]=False
# app.config["TEMPLATES_AUTO_RELOAD"]=True
# app.config["JSON_SORT_KEYS"] = False

#============串聯資料庫============================================================
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

#==================================================================================
#================api===============================================================
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/api/attractions")
def apiattraction():
	page = request.args.get("page")
	keyword = request.args.get("keyword")
	if page == None:
		results_dict = {"error": True, "message": "請輸入page"}
		finalresult = results_convert(results_dict)
		return finalresult,500
	else:
		try:
			page = int(page)
		except ValueError:
			results_dict = {"error": True, "message": "page格式為數字"}
			finalresult = results_convert(results_dict)
			return finalresult, 500
	execute_argument = page * 12
	if keyword == None:
		query = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address, lat, lng \
			FROM attraction LIMIT 12 OFFSET %s"
		nextPage = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address, lat, lng FROM attraction \
		 LIMIT 1 OFFSET %s"
		page_data = connect(query, (execute_argument,))
		nextPage_data = connect(nextPage, (execute_argument+12,))
		if nextPage_data == []:
			nextPageValue = None
		else:
			nextPageValue = page + 1
	else:
		query = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address, lat, lng, mrt \
				FROM attraction left JOIN mrt \
				ON attraction.mrt_id = mrt.mrtID \
				WHERE attraction LIKE %s OR mrt LIKE %s LIMIT 12 OFFSET %s"
		nextPage = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address, lat, lng, mrt \
				FROM attraction left JOIN mrt \
				ON attraction.mrt_id = mrt.mrtID \
				WHERE attraction LIKE %s OR mrt LIKE %s LIMIT 1 OFFSET %s"
		keyword_str = f'%{keyword}%'
		page_data = connect(query,(keyword_str,keyword_str,execute_argument))
		nextPage_data = connect(nextPage,(keyword_str,keyword_str,execute_argument+12,))
		if nextPage_data == []:
			nextPageValue = None
		else:
			nextPageValue = page + 1

	results = []
	for item in page_data:
		id = item[0]
		attraction = item[1] # 顯示結果為 各風景區名稱(每次回圈只跑出一個結果)
		if item[2] != None:
			mrt_table = connect("SELECT mrt FROM mrt WHERE mrtID = %s",(item[2],))
			mrt = mrt_table[0][0] # 顯示結果為 各風景區所在的捷運站名稱(每次回圈只跑出一個結果)
		else:
			mrt = "無鄰近捷運站"
		category_table = connect("SELECT category FROM category WHERE categoryID = %s",(item[3],))
		category = category_table[0][0] # 顯示結果為 各風景區的種類(每次回圈只跑出一個結果)
		introduction = item[4]
		transportation = item[5]
		address = item[6]
		lat = item[7]
		lng = item[8]
		img_list = connect("SELECT image FROM img WHERE attraction_id = %s", [id])
		new_img_list = []
		for img in img_list:
			new_img_list.append(img[0])
		result = {"id": id, "name": attraction,
					"category": category, "description": introduction, "address": address,
					"transport": transportation, "mrt": mrt, "lat": lat , "lng": lng, "image": new_img_list}
		results.append(result)
		results_dict = {"nextPage": nextPageValue, "data": results}
		finalresult = results_convert(results_dict)
	return finalresult

@app.route("/api/attractions/<int:attractionID>")
def get_attraction(attractionID):
	if type(attractionID) != int:
		results_dict = {"error": True, "message": "請輸入正確的id數值"}
		finalresult = results_convert(results_dict)
		return finalresult, 400
	elif attractionID == None:
		results_dict = {"error": True, "message": "請一個數值"}
		finalresult = results_convert(results_dict)
		return finalresult, 500
	else:
		query = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address, lat, lng \
			FROM attraction \
			WHERE id = %s"
		page_data = connect(query,(attractionID,))
		results = []
		for item in page_data:
			id = item[0]
			attraction = item[1] # 顯示結果為 各風景區名稱(每次回圈只跑出一個結果)
			if item[2] != None:
				mrt_table = connect("SELECT mrt FROM mrt WHERE mrtID = %s",(item[2],))
				mrt = mrt_table[0][0] # 顯示結果為 各風景區所在的捷運站名稱(每次回圈只跑出一個結果)
			else:
				mrt = "無鄰近捷運站"
			category_table = connect("SELECT category FROM category WHERE categoryID = %s",(item[3],))
			category = category_table[0][0] # 顯示結果為 各風景區的種類(每次回圈只跑出一個結果)
			introduction = item[4]
			transportation = item[5]
			address = item[6]
			lat = item[7]
			lng = item[8]
			img_list = connect("SELECT image FROM img WHERE attraction_id = %s",[id])
			new_img_list = []
			for img in img_list:
				new_img_list.append(img[0])
			result = {"id":id,"name":attraction,
						"category": category,"description": introduction,"address": address,
						"transport": transportation,"mrt": mrt,"lat":lat ,"lng":lng,"image":new_img_list}
			results.append(result)
			results_dict = {"data":results}
			finalresult = results_convert(results_dict)
	return finalresult

@app.route("/api/mrts")
def mrt_api():
	mrt_count = connect("SELECT attraction.mrt_id, COUNT(*) AS count, mrt.mrt FROM attraction \
					 LEFT JOIN mrt ON attraction.mrt_id = mrt.mrtID GROUP BY mrt_id ORDER BY count DESC;")
	mrt_list = []
	for mrt in mrt_count:
		mrt_list.append(mrt[2])
		results_dict = {"data":mrt_list}
		finalresult = results_convert(results_dict)
	return finalresult

#註冊會員api
@app.route("/api/user",methods=["POST"])
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
@app.route("/api/user/auth", methods=["PUT","GET"])
def login():
	if request.method == "PUT":
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
	else:
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

#預定行程api
@app.route("/api/booking",methods=["POST","GET","DELETE"])
def bookingAPI():
	if request.method == "POST":
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
	elif request.method == "GET":
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
	elif request.method == "DELETE":
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
		
#購買行程
@app.route("/api/orders",methods=["POST"])
def pay():
	try:
		token = request.headers.get('Authorization')
		if token == None:
			result = {"error": True,"message": "使用者未登入"}
			finalresult = results_convert(result)
			return finalresult,403
		elif token:
			decode_token = token.split('Bearer ')
			information = jwt.decode(decode_token[1], 'private_key', algorithms=['HS256'])
			memberID = information['id']
			data = request.get_json()
			prime = data['prime']
			attraction_id = data['order']['trip']['attraction']['id']
			attraction = data['order']['trip']['attraction']['name']
			contactName = data['order']['contact']['name']
			contactEmail = data['order']['contact']['email']
			contactPhone = data['order']['contact']['phone']
			price = int(data['order']['price'])
			date = data['order']['trip']['date']
			time = data['order']['trip']['time']
			setup = pd.DataFrame([{
				"order_number":uuid.uuid4()}])
			orderID = str(setup['order_number']).split('\n')[0].lstrip('0').lstrip(' ')
			connect("INSERT INTO record(order_number, member_id, attraction_id, \
			price, contactName, contactEmail, phone, date, time) \
			VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)", 
			(orderID,memberID,attraction_id,price,contactName,contactEmail,contactPhone,date,time))
			
			#向tappay傳送請求
			tappay_api_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
			headers = {
				'Content-Type': 'application/json',
				'x-api-key': "partner_9z8gPYEOG2FqIqzIYYguMCVFJBZazxlTppKYuP9oFWSEAM7DKUcewkNC"
			}

			# 發送 POST 請求到 Tappay API
			tappay_api_data = {
				"prime": prime,
				"partner_key": "partner_9z8gPYEOG2FqIqzIYYguMCVFJBZazxlTppKYuP9oFWSEAM7DKUcewkNC",
				"merchant_id": "eunicezhou_CTBC",
				"details": attraction,
				"amount": price,
				"cardholder": {
					"phone_number": contactPhone,
					"name": contactName,
					"email": contactEmail,
				},
				"order_number": orderID
			}
			response = requests.post(tappay_api_url, json=tappay_api_data, headers=headers)
			responseJson = response.json()
			status = responseJson['status']
			message = responseJson['msg']
			if status!= 0:
				responseData = {
					"number":orderID,
					"error": True,
					"message": "訂單建立失敗"
					}
				finalresult = results_convert(responseData)
				return finalresult,400
			else:
				connect("UPDATE record SET status='已繳款' WHERE order_number=%s",(orderID,))
				responseData = {
					"data":{
						"number":orderID,
						"payment":{	
							"status": status,
							"message": message
						}
					}
				}
				finalresult = results_convert(responseData)
				return finalresult
	except Exception as err:
		responseData = {
			"error": True,
			"message": err
			}
		finalresult = results_convert(responseData)
		return finalresult,500

@app.route("/api/orders/<string:orderID>",methods=["GET"])
def getThankyou(orderID):
	token = request.headers.get('Authorization')
	if token == None:
		result = {"error": True,"message": "使用者未登入"}
		finalresult = results_convert(result)
		return finalresult,403
	else:
		session.clear()
		order = connect("SELECT order_number From record WHERE order_number=%s",(orderID,))
		orderMember = connect("SELECT member_id From record WHERE order_number=%s",(orderID,))
		if order:
			orderData = connect("SELECT order_number, member_id, attraction_id, \
				price, contactName, contactEmail, phone, date, time, status From record WHERE member_id=%s",(orderMember[0][0],))
			orderDataDict = {}
			id=0
			for data in orderData:
				orderDataDict[f"data{id}"] = {
					"number": data[0],
					"price": data[3],
					"trip": {
					"attraction": {
						"id": data[2],
						"name": connect("SELECT attraction FROM attraction WHERE id=%s",(data[2],))[0][0],
						"address": connect("SELECT address FROM attraction WHERE id=%s",(data[2],))[0][0],
						"image": connect("SELECT image FROM img WHERE attraction_id=%s LIMIT 1",(data[2],))[0][0]
					},
					"date": data[7],
					"time": data[8]
					},
					"contact": {
					"name": data[4],
					"email": data[5],
					"phone": data[6]
					},
					"status":data[9]
				}
				id+=1
	return jsonify(orderDataDict)
#=================================================================================
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