from flask import *
from flask_cors import CORS
import jwt
import requests
import pandas as pd
import uuid

from module_function.env_file import *
from module_function.database import *
from module_function.file_type_convert import *

app=Flask(__name__)
app.secret_key = app_key

orders_blueprint = Blueprint('api_orders',__name__,template_folder= 'api')

#購買行程api
@orders_blueprint.route("/orders",methods=["POST"])
def pay():
	try:
		token = request.headers.get('Authorization')
		if token == None:
			result = {"error": True,"message": "使用者未登入"}
			finalresult = results_convert(result)
			return finalresult,403
		elif token:
			decode_token = token.split('Bearer ')
			information = jwt.decode(decode_token[1], token_key, algorithms=['HS256'])
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
				'x-api-key': tappay_key
			}

			# 發送 POST 請求到 Tappay API
			tappay_api_data = {
				"prime": prime,
				"partner_key": tappay_key,
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

@orders_blueprint.route("/orders/<string:orderID>",methods=["GET"])
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