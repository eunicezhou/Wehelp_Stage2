import json
import mysql.connector
from mysql.connector import pooling
con ={
    'user':'root',
    'password':'password',
    'host':'localhost',
    'database':'stage2',
}
# 建立連接池
connection_pool = pooling.MySQLConnectionPool(pool_name='mypool',pool_size=5,**con)
# 從連接池中取得連接
connection = connection_pool.get_connection()
cursor = connection.cursor()
cursor.execute("USE stage2")
connection.commit()

with open('taipei-attractions.json','r',encoding='utf-8') as attract_file:
    data = json.load(attract_file)
    actual_data = data['result']['results']

#=================將資料放到DATABASE的attraction table中======================
# for item in actual_data:
#     file = item['file']
#     file_str = ''.join(file)
#     file_list = file_str.split('http')
#     picture = []
#     for file_item in file_list:
#         if "jpg" in file_item :
#             picture.append('http' + file_item)
#         elif "png" in file_item :
#             picture.append('http' + file_item)
#         else:
#             pass
#     name = item['name']
#     transportation = item['direction']
#     category = item['CAT']
#     description = item['description']
#     address = item['address']
#     mrt = item['MRT']
#     name_str = ''.join(name)
#     transportation_str = ''.join(transportation)
#     category_str = ''.join(category)
#     description_str = ''.join(description)
#     address_str = ''.join(address)
#     lat = item['latitude']
#     lng = item['longitude']
#     if mrt == None:
#         mrt_str = None
#         print(mrt_str)
#     else:
#         mrt_str = ''.join(mrt)
#     cursor = connection.cursor(dictionary=True)
#     cursor.execute("INSERT INTO attraction(attraction,transportation,introduction,address,mrt_id,category_id,lat,lng) \
#                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",(name_str,transportation_str,description_str,address_str,mrt_str,category_str,lat,lng))
#     connection.commit()
#=============================================================================
#=================建立img table===============================================
# for index, item in enumerate(actual_data):
#     file = item['file']
#     file_str = ''.join(file)
#     file_list = file_str.split('http')
#     picture_list = []
#     for file_item in file_list:
#         print(file_item)
#         lowerCase = file_item.lower()
#         if "jpg" in lowerCase :
#             picture_list.append('http' + file_item)
#         elif "png" in lowerCase :
#             picture_list.append('http' + file_item)
#         else:
#             pass
#         print(file_item)
#     new_index = index + 1
#     for picture in picture_list:
#         cursor = connection.cursor(dictionary=True)
#         cursor.execute("INSERT INTO img(attraction_id,image) \
#                    VALUES (%s,%s)",(new_index,picture))
#         connection.commit()
#=============================================================================
#=================建立mrt table===============================================
# mrt_set = []
# for item in actual_data:
#     mrt = item['MRT']
#     if mrt == None:
#         pass
#     else:
#         mrt_str = ''.join(mrt)
#         if mrt_str not in mrt_set:
#             mrt_set.append(mrt_str)
# for station in range(len(mrt_set)):
#     cursor = connection.cursor(dictionary=True)
#     cursor.execute("INSERT INTO mrt(mrt) \
#                    VALUES (%s)",(mrt_set[station],))
#     connection.commit()
#===============================================================================

#================將attraction table中的mrtID與mrt table 的mrt名稱相同者改以ID表示
# cursor = connection.cursor(dictionary=True)
# cursor.execute("SELECT * FROM mrt")
# mrt_dict = cursor.fetchall()
# cursor.execute("SELECT mrt_id FROM attraction")
# attraction_mrt_dict = cursor.fetchall()
# mrt_dictionary = {}
# for station in mrt_dict:
#     mrt_mrt = station['mrt']
#     mrt_mrtID = station['mrtID']
#     mrt_dictionary[mrt_mrt]=mrt_mrtID
#     mrt_key = list(mrt_dictionary.keys())
    
# for i in range(len(attraction_mrt_dict)-1):
#     mrt_id = attraction_mrt_dict[i]['mrt_id']
#     if mrt_id in mrt_key:
#         attraction_mrt_dict[i]['mrt_id'] = mrt_dictionary[mrt_id]
#         cursor.execute("UPDATE attraction SET mrt_id = %s WHERE mrt_id = %s",(attraction_mrt_dict[i]['mrt_id'],mrt_id))
# connection.commit()
# #==========================================================================

#===============建立category table===============================================
# cat_set = []
# for item in actual_data:
#     cat = item['CAT']
#     cat_str = ''.join(cat)
#     if cat_str not in cat_set:
#         cat_set.append(cat_str)
# for type in range(len(cat_set)):
#     cursor = connection.cursor(dictionary=True)
#     cursor.execute("INSERT INTO category(category) \
#                    VALUES (%s)",(cat_set[type],))
#     connection.commit()
#===============================================================================

#================將attraction table中的categoryID與category table 的category名稱相同者改以ID表示
# cursor = connection.cursor(dictionary=True)
# cursor.execute("SELECT * FROM category")
# cat_dict = cursor.fetchall()
# cursor.execute("SELECT category_id FROM attraction")
# attraction_cat_dict = cursor.fetchall()
# cat_dictionary = {}
# for type in cat_dict:
#     cat_cat = type['category']
#     cat_catID = type['categoryID']
#     cat_dictionary[cat_cat]=cat_catID
#     mrt_key = list(cat_dictionary.keys())
    
# for i in range(len(attraction_cat_dict)):
#     cat_id = attraction_cat_dict[i]['category_id']
#     if cat_id in mrt_key:
#         attraction_cat_dict[i]['category_id'] = cat_dictionary[cat_id]
#         cursor.execute("UPDATE attraction SET category_id = %s WHERE category_id = %s",(attraction_cat_dict[i]['category_id'],cat_id))
# connection.commit()
#==========================================================================

