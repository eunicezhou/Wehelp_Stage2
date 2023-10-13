from flask import *
import mysql.connector
from mysql.connector import pooling
from flask_cors import CORS
import json
import jwt
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

#============串聯資料庫============================================================
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
#==================================================================================
mrts_blueprint = Blueprint('api_mrts',__name__,template_folder= 'api')
#===================建立api=========================================================
CORS(app, resources={r"/api/*": {"origins": "*"}})

@mrts_blueprint.route("mrts")
def mrt_api():
	mrt_count = connect("SELECT attraction.mrt_id, COUNT(*) AS count, mrt.mrt FROM attraction \
					 LEFT JOIN mrt ON attraction.mrt_id = mrt.mrtID GROUP BY mrt_id ORDER BY count DESC;")
	mrt_list = []
	for mrt in mrt_count:
		mrt_list.append(mrt[2])
		results_dict = {"data":mrt_list}
		finalresult = results_convert(results_dict)
	return finalresult