from flask import *
from flask_cors import CORS

from module_function.env_file import *
from module_function.database import *
from module_function.file_type_convert import *

app=Flask(__name__)
app.secret_key = app_key

mrts_blueprint = Blueprint('api_mrts',__name__,template_folder= 'api')

#建立api
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