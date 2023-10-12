# Wehelp_Stage2
http://52.198.121.57:3000

# 台北一日遊網站開發專案
運⽤前後端分離的架構，根據 RESTful API 的設計，整合⾦流服務，完成⼀個旅遊電商網站

# 版本管理工具
利用Git 版本管理⼯具以及 GitHub 雲端版控服務，來管理⼀個持續開發的專案
### 1. 在GitHub帳戶中創建一個Repository，用以儲存本機專案
### 2. 設定Collaborators，將專案協作者加入
### 3. 為main分支新增保護原則:Require a pull request before merging，並選擇Require approvals至少1次
### 4. 當本地端的專案完成到一個階段時，透過git add及git commit指令，將新版本的本機專案放到develop分支中
### 5. Pull request，將合併需求發送給code reviewer
### 6. 待code reviewer核准後，將develop合併到main中

# 開始製作專案:
## Part 1 - 1：建立存放景點資料的資料庫
#### 獨立寫一支python檔案，將景點資訊建立到MySQL中

在我們的專案中有⼀個 data 資料夾，裡⾯存放了⼀個 taipei-attractions.json 檔案，包含所有
景點的相關資料。請在 MySQL 資料庫中，設計你的資料表，在 data 資料夾下，額外寫⼀隻
獨立的 Python 程式統⼀將景點資料存放到資料庫中。
請特別注意景點圖片的處理，我們會過濾資料中，不是 JPG 或 PNG 的檔案， 景點的每張圖
片網址 都必須被想辦法儲存在資料庫中。

Step 1 建立連接池，並從連接池中取得連結
```python
#載入connector模組
import mysql.connector
from mysql.connector import pooling
#設定欲連接的資料庫檔案
con ={
    'user':'root', #資料庫使用者名稱
    'password':'password', #資料庫密碼
    'host':'localhost', #資料庫主機位置(這裡是)
    'database':'stage2',
}
# 建立連接池
connection_pool = pooling.MySQLConnectionPool(pool_name='mypool',pool_size=5,**con)
# 從連接池中取得連接
connection = connection_pool.get_connection()
cursor = connection.cursor()
cursor.execute("USE stage2")
connection.commit()
```
Step 2 讀取並開啟 taipei-attractions.json 這個檔案
```python
#載入JSON模組
import json
#開啟taipei-attractions.json檔案並進行資料讀取
#with open負責開啟檔案，執行相關的操作，並在執行完後自動關閉檔案，這樣可以避免忘記手動關閉檔案而導致的問題
#'r': 以讀取模式打開檔案
#encoding='utf-8': 指定檔案的編碼方式為 UTF-8
with open('taipei-attractions.json','r',encoding='utf-8') as attract_file:
    data = json.load(attract_file)
    actual_data = data['result']['results']
```
Step 3 在MySQL中建立藥使用的database和tables
```mysql
//建立database
CREATE DATABASE stage2;
USE stage2;

//建立attraction table
CREATE TABLE attraction(
id INT PRIMARY KEY AUTO_INCREMENT,
attraction VARCHAR(25) NOT NULL,
transportation TEXT,
introduction TEXT,
image TEXT,
address TEXT,
lat VARCHAR(25),
lng VARCHAR(25),
mrt_id VARCHAR(10),
category_id VARCHAR(10)
);
```
Step 4 將資料放到attraction table中
```python
for item in actual_data:
  file = item['file']
  file_str = ''.join(file)
  file_list = file_str.split('http')
  picture = []
  for file_item in file_list:
    if "jpg" in file_item :
      picture.append('http' + file_item)
    elif "png" in file_item :
       picture.append('http' + file_item)
    else:
       pass
    name = item['name']
    transportation = item['direction']
    category = item['CAT']
    description = item['description']
    address = item['address']
    mrt = item['MRT']
    name_str = ''.join(name)
    transportation_str = ''.join(transportation)
    category_str = ''.join(category)
    description_str = ''.join(description)
    address_str = ''.join(address)
    lat = item['latitude']
    lng = item['longitude']
    if mrt == None:
       mrt_str = None
       print(mrt_str)
    else:
       mrt_str = ''.join(mrt)
    cursor = connection.cursor(dictionary=True)
    cursor.execute("INSERT INTO attraction(attraction,transportation,introduction,address,mrt_id,category_id,lat,lng) \
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",(name_str,transportation_str,description_str,address_str,mrt_str,category_str,lat,lng))
    connection.commit()
```
上面的步驟是將所有資料都放到table中，下面為了節省MySql的table空間，會對資料進行資料正規化，將有重複的資料拉出來另外建立索引table
Step 5 建立資料正規化
```mysql
#建立mrt table
CREATE TABLE mrt(
mrtID INT PRIMARY KEY AUTO_INCREMENT,
mrt VARCHAR(10) NOT NULL
);
#將attraction table中的mrt_id欄位的資料進行型態轉換
ALTER TABLE attraction MODIFY mrt_id INT;
#對attraction中的mrt_id建立外鍵
ALTER TABLE attraction ADD FOREIGN KEY(mrt_id)REFERENCES mrt(mrtID);

#建立category表格
CREATE TABLE category(
categoryID INT PRIMARY KEY AUTO_INCREMENT,
category VARCHAR(10) NOT NULL
);
#將attraction table中的category_id欄位的資料進行型態轉換
ALTER TABLE attraction MODIFY category_id INT;
#對attraction中的category_id建立外鍵
ALTER TABLE attraction ADD FOREIGN KEY(category_id) REFERENCES category(categoryID);

#建立img table
CREATE TABLE img(
id INT PRIMARY KEY AUTO_INCREMENT,
attraction_id INT,
image TEXT
);
#對img table新增索引attraction_id
ALTER TABLE img ADD INDEX (attraction_id);
#對attraction中的id建立外鍵
ALTER TABLE attraction ADD FOREIGN KEY(id) REFERENCES img(attraction_id);
```
Step 6 在python中將資料寫入MySql
```
#將資料放入img table中
for index, item in enumerate(actual_data):
    file = item['file']
    file_str = ''.join(file)
    file_list = file_str.split('http')
    picture_list = []
    for file_item in file_list:
        print(file_item)
        lowerCase = file_item.lower()
        if "jpg" in lowerCase :
            picture_list.append('http' + file_item)
        elif "png" in lowerCase :
            picture_list.append('http' + file_item)
        else:
            pass
        print(file_item)
    new_index = index + 1
    for picture in picture_list:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("INSERT INTO img(attraction_id,image) \
                   VALUES (%s,%s)",(new_index,picture))
        connection.commit()

#將資料放入mrt table中
mrt_set = []
for item in actual_data:
    mrt = item['MRT']
    if mrt == None:
        pass
    else:
        mrt_str = ''.join(mrt)
        if mrt_str not in mrt_set:
            mrt_set.append(mrt_str)
for station in range(len(mrt_set)):
    cursor = connection.cursor(dictionary=True)
    cursor.execute("INSERT INTO mrt(mrt) \
                   VALUES (%s)",(mrt_set[station],))
    connection.commit()

#將attraction table中的mrtID與mrt table 的mrt名稱相同者改以ID表示
cursor = connection.cursor(dictionary=True)
cursor.execute("SELECT * FROM mrt")
mrt_dict = cursor.fetchall()
cursor.execute("SELECT mrt_id FROM attraction")
attraction_mrt_dict = cursor.fetchall()
mrt_dictionary = {}
for station in mrt_dict:
    mrt_mrt = station['mrt']
    mrt_mrtID = station['mrtID']
    mrt_dictionary[mrt_mrt]=mrt_mrtID
    mrt_key = list(mrt_dictionary.keys())
    
for i in range(len(attraction_mrt_dict)-1):
    mrt_id = attraction_mrt_dict[i]['mrt_id']
    if mrt_id in mrt_key:
        attraction_mrt_dict[i]['mrt_id'] = mrt_dictionary[mrt_id]
        cursor.execute("UPDATE attraction SET mrt_id = %s WHERE mrt_id = %s",(attraction_mrt_dict[i]['mrt_id'],mrt_id))
connection.commit()

#建立category table
cat_set = []
for item in actual_data:
    cat = item['CAT']
    cat_str = ''.join(cat)
    if cat_str not in cat_set:
        cat_set.append(cat_str)
for type in range(len(cat_set)):
    cursor = connection.cursor(dictionary=True)
    cursor.execute("INSERT INTO category(category) \
                   VALUES (%s)",(cat_set[type],))
    connection.commit()

#將attraction table中的categoryID與category table 的category名稱相同者改以ID表示
cursor = connection.cursor(dictionary=True)
cursor.execute("SELECT * FROM category")
cat_dict = cursor.fetchall()
cursor.execute("SELECT category_id FROM attraction")
attraction_cat_dict = cursor.fetchall()
cat_dictionary = {}
for type in cat_dict:
    cat_cat = type['category']
    cat_catID = type['categoryID']
    cat_dictionary[cat_cat]=cat_catID
    mrt_key = list(cat_dictionary.keys())
    
for i in range(len(attraction_cat_dict)):
    cat_id = attraction_cat_dict[i]['category_id']
    if cat_id in mrt_key:
        attraction_cat_dict[i]['category_id'] = cat_dictionary[cat_id]
        cursor.execute("UPDATE attraction SET category_id = %s WHERE category_id = %s",(attraction_cat_dict[i]['category_id'],cat_id))
connection.commit()
```
## Part 1 - 2：開發旅遊景點 API
請仔細的按照 API 文件「旅遊景點」、「捷運站」部份的指⽰，完成三個 API。 景點的圖片
網址以及捷運站名稱列表皆為陣列格式，可能包含⼀到多筆資料。
#### 1. 建立app.py，作為所有後端路徑的接口檔案

```python
#載入所有使用到的模組
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

#初始化flask這個模組，並將它儲存在app這個變數中
#__name__ 是 Python 中的特殊變數，代表目前模組的名稱。在這個情況下，它代表了這個應用程式所在的模組（也就是你的 Python 檔案）
app=Flask(__name__)

#設定session的secret-key
app.secret_key = 'your_secret_key'

#將資料轉為JSON格式
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
```
#### 2. 依照api功能建立blueprint檔案
1. api_attractions.py
```
#先載入會使用到的模組、session_key、資料庫等等
#建立blueprint物件
attractions_blueprint = Blueprint('api_attractions',__name__,template_folder= 'api')

#建立路徑
@attractions_blueprint.route("/attractions",methods=["POST"])
def apiattraction():
   #執行程式碼

@attractions_blueprint.route("/attractions/<int:attractionID>")
def get_attraction(attractionID):
   #執行程式碼
```
2. api_mrts.py
```
#先載入會使用到的模組、session_key、資料庫等等
#建立blueprint物件
mrts_blueprint = Blueprint('api_mrts',__name__,template_folder= 'api')

#建立路徑
@mrts_blueprint.route("mrts")
def mrt_api():
   #執行程式碼
```
#### 3. 設計景點api
/api/attractions,method=GET
取得不同分頁的旅遊景點列表資料，也可以根據標題關鍵字或捷運名稱篩選
response物件
|status|description|response|
|------|-----------|--------|
|200|正常運作|{"nextPage": 1,"data": [{"id": 10,"name": "平安鐘","category": "公共藝術","description": "平安鐘祈求大家的平安，這是為了紀念 921 地震週年的設計","address": "臺北市大安區忠孝東路 4 段 1 號","transport": "公車：204、212、212直","mrt": "忠孝復興","lat": 25.04181,"lng": 121.544814,"images": ["http://140.112.3.4/images/92-0.jpg"]}]}|
|500|伺服器內部異常|{"error": true,"message": "請按照情境提供對應的錯誤訊息"}|

/api/attraction/{attractionId},method=GET
根據景點編號取得景點資料
|status|description|response|
|------|-----------|--------|
|200|正常運作|{"data": {"id": 10,"name": "平安鐘","category": "公共藝術","description": "平安鐘祈求大家的平安，這是為了紀念 921 地震週年的設計","address": "臺北市大安區忠孝東路 4 段 1 號","transport": "公車：204、212、212直","mrt": "忠孝復興","lat": 25.04181,"lng": 121.544814,"images": ["http://140.112.3.4/images/92-0.jpg"]}}|
|400|景點編號不正確|{"error": true,"message": "請按照情境提供對應的錯誤訊息"}|
|500|伺服器內部異常|{"error": true,"message": "請按照情境提供對應的錯誤訊息"}|

(1) 獲取資訊的流程

![image](https://github.com/eunicezhou/Wehelp_Stage2/assets/131647842/4f7d4545-49c9-49bd-90ee-a0f0a45e0694)

- javascript
  1. 從後端索取景點資訊:
  設定基本函式
  ->設定if...else由有無關鍵字決定要執行的函式
```
//設定變數
let currentPage = 0;
let next_page;
let keyword;

//設定基本函式
async function attractionlist(url){
  let response = await fetch(url);
  let result = await response.json();
  let results = result.data;
  next_page = result.nextPage;
  return[results,next_page];
}

//設定if...else
async function getAttraction(){
    let resultList;
    let results;
    if(keyword === undefined){
        let url = `/api/attractions?page=${currentPage}`;
        resultList = await attractionlist(url);
        results = resultList[0];
    }else{
        let url = `/api/attractions?page=${currentPage}&keyword=${keyword}`;
        resultList = await attractionlist(url);
        results = resultList[0];
    }
    //其他程式碼......
}
  ```
   2. 將獲取的資料放進動態生成的元素中，並插入HTML裡面
```
async function getAttraction(){
  //其他程式碼......
  //設定若獲取的資料長度>0，則將資料放進動態生成的元素中
  if (results.length>0){
        let nextPage = resultList[1];
        let r;
        for(r=0;r<results.length;r++){
            let wrapAttraction = document.createElement("div");
            let site = results[r];
            let attractionInmation = {'category':site["category"],
            'imageURL':site["image"][0],
            'mrt':site["mrt"],
            'name':site["name"],
            'id':site["id"]}
            wrapAttraction.innerHTML=`
                <a href="/attraction/${attractionInmation['id']}">
                    <div id="${attractionInmation['id']}" class="attractionImage" style="background-image:url(${attractionInmation['imageURL']})">
                    </div>
                </a>
                <div class="attractionName bold">${attractionInmation['name']}</div>
                <div class="description bold">
                    <div class="floatLeft">${attractionInmation['mrt']}</div>
                    <div class="floatright">${attractionInmation['category']}</div>
                </div>`;   
            attractions.appendChild(wrapAttraction);
        }
        //檢查這個分頁後面是否還有其他資料，若無則不繼續偵測observer元素
        if(nextPage===null){
            observer.unobserve(footer);
        }
        return nextPage;
  }else{
     let nextPage = null;
     observer.unobserve(footer);
     return nextPage 
  }
}
```
  3.建立observer元素
  建立一個 IntersectionObserver 物件
  ->設定callback函式，當observer物件進入或離開視窗，該函式會被呼叫
```
let observer = new IntersectionObserver(async(entries)=>{
    for(const entry of entries){
        if(entry.isIntersecting){
            let nextPage = await getAttraction();
            currentPage = nextPage;
        }
    }
});
const footer = document.querySelector(".footer");
observer.observe(footer);
```
## Part 1 - 3：將網站上線到 AWS EC2
請在 AWS EC2 的服務上建立⼀台 Linux 機器，透過遠端連線進⾏管理，最終將網站上線
