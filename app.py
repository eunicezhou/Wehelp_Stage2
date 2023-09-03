from flask import *
import mysql.connector
from mysql.connector import pooling
import json
app=Flask(__name__)

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
		print("已連接456512154656232")
	except:
		print("出現錯誤訊息")
		result = None
	finally:
		cursor.close()
		connection.close()
	return result
#==================================================================================
#================api===============================================================
@app.route("/api/attractions")
def attraction():
	page = request.args.get("page")
	keyword = request.args.get("keyword")
	print(keyword)
	if page == None:
		results_dict = {"error":True,"message":"請輸入page"}
		return jsonify(results_dict),500
	else:
		try:
			page = int(page)
		except ValueError:
			results_dict = {"error": True, "message": "page格式為數字"}
			return jsonify(results_dict), 500
	execute_argument = page*12
	if keyword == None:
		query = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address FROM attraction \
		LIMIT 12 OFFSET %s"
		page_data = connect(query,(execute_argument,))
	else:
		query = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address FROM attraction \
			WHERE attraction LIKE %s OR transportation LIKE %s OR address LIKE %s LIMIT 12 OFFSET %s"
		keyword_str = f'%{keyword}%'
		page_data = connect(query,(keyword_str,keyword_str,keyword_str,execute_argument))
	print(page_data)
	results = []
	for item in page_data:
		id = item[0]
		attraction = item[1] # 顯示結果為 各風景區名稱(每次回圈只跑出一個結果)
		mrt_table = connect("SELECT mrt FROM mrt WHERE mrtID = %s",(item[2],))
		mrt = mrt_table[0][0] # 顯示結果為 各風景區所在的捷運站名稱(每次回圈只跑出一個結果)
		category_table = connect("SELECT category FROM category WHERE categoryID = %s",(item[3],))
		category = category_table[0][0] # 顯示結果為 各風景區的種類(每次回圈只跑出一個結果)
		introduction = item[4]
		transportation = item[5]
		address = item[6]
		img_list = connect("SELECT image FROM img WHERE attraction_id = %s",[id])
		new_img_list = []
		for img in img_list:
			new_img_list.append(img[0])
		result = {"id":id,"name":attraction,
					"category": category,"description": introduction,"address": address,
					"transport": transportation,"mrt": mrt,"lat": 25.04181,"lng": 121.544814,"image":new_img_list}
		results.append(result)
		results_dict = {"nextPage":page+1,"data":results}
		finalresult = results_convert(results_dict)
	return finalresult

@app.route("/api/attractions/<int:attractionID>")
def get_attraction(attractionID):
	if attractionID != int:
		results_dict = {"error":True,"message":"請輸入正確的id數值"}
		return jsonify(results_dict),400
	elif attractionID == None:
		results_dict = {"error":True,"message":"請一個數值"}
		return jsonify(results_dict),500
	else:
		query = "SELECT id, attraction, mrt_id, category_id, introduction, transportation, address FROM attraction \
			WHERE id = %s"
		page_data = connect(query,(attractionID,))
		print(page_data)
		results = []
		for item in page_data:
			id = item[0]
			attraction = item[1] # 顯示結果為 各風景區名稱(每次回圈只跑出一個結果)
			mrt_table = connect("SELECT mrt FROM mrt WHERE mrtID = %s",(item[2],))
			mrt = mrt_table[0][0] # 顯示結果為 各風景區所在的捷運站名稱(每次回圈只跑出一個結果)
			category_table = connect("SELECT category FROM category WHERE categoryID = %s",(item[3],))
			category = category_table[0][0] # 顯示結果為 各風景區的種類(每次回圈只跑出一個結果)
			introduction = item[4]
			transportation = item[5]
			address = item[6]
			img_list = connect("SELECT image FROM img WHERE attraction_id = %s",[id])
			new_img_list = []
			for img in img_list:
				new_img_list.append(img[0])
			result = {"id":id,"name":attraction,
						"category": category,"description": introduction,"address": address,
						"transport": transportation,"mrt": mrt,"lat": 25.04181,"lng": 121.544814,"image":new_img_list}
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
#=================================================================================
@app.route("/")
def index():
	return render_template("index.html")
# @app.route("/attraction/<id>")
# def attraction(id):
# 	return render_template("attraction.html")
# @app.route("/booking")
# def booking():
# 	return render_template("booking.html")
# @app.route("/thankyou")
# def thankyou():
# 	return render_template("thankyou.html")
print("test")
app.run(debug=True, host="0.0.0.0", port=3000)
