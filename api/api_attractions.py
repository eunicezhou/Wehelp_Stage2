from flask import *
import mysql.connector
from mysql.connector import pooling
from flask_cors import CORS
import json
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

#建立blueprint
attractions_blueprint = Blueprint('api_attractions',__name__,template_folder= 'api')

#建立api
CORS(app, resources={r"/api/*": {"origins": "*"}})

@attractions_blueprint.route("/attractions")
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

@attractions_blueprint.route("/attractions/<int:attractionID>")
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
