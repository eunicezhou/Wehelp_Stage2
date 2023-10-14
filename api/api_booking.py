from flask import *
from module_function.env_file import *
from module_function.database import *
from module_function.file_type_convert import *

app=Flask(__name__)
app.secret_key = app_key

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
            status = 200
        elif not token:
            result = {"error": True,"message": "請確認登入帳戶"}
            finalresult = results_convert(result)
            status = 403
        else:
            result = {"error": True,"message": "請確認所有欄位皆有點選"}
            finalresult = results_convert(result)
            status = 400
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        status = 500
    return finalresult, status

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
            status = 400
        elif token:
            session.clear()
            result = {"ok":True}
            finalresult = results_convert(result)
            status = 200
    except Exception as err:
        result = {"error": True,"message": err}
        finalresult = results_convert(result)
        status = 500
    return finalresult, status