from flask import *
from datetime import datetime, timedelta

from module_function.env_file import *
from module_function.database import *
from module_function.file_type_convert import *
from module_function.token import *

app=Flask(__name__)
app.secret_key = app_key

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
            token_algorithm = 'HS256'
            encode_token = encoding(filedict, token_key, algorithm= token_algorithm)
            return encode_token
        else:
            if email not in memberInfor[0]:
                result = {"error": True,"message": "此信箱未註冊"}
                finalresult = results_convert(result)
                status = 400
            elif email in memberInfor[0] or password in memberInfor[1]:
                result = {"error": True,"message": "信箱或密碼錯誤"}
                finalresult = results_convert(result)
                status = 400
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        status = 500
    return finalresult,status
	
@user_blueprint.route("/user/auth", methods=["GET"])
def login_get():
    try:
        token = request.headers.get('Authorization')
        if token:
            decode_token = token.split('Bearer ')
            decode_algorithms = ['HS256']
            information = decoding(decode_token[1], token_key, decode_algorithms)
            return information
        else:
            return redirect("/")
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        return finalresult,500