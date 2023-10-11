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
#### 1. 獨立寫一支python檔案，將景點資訊建立到MySQL中

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
Step 6 

## Part 1 - 2：開發旅遊景點 API
請仔細的按照 API 文件「旅遊景點」、「捷運站」部份的指⽰，完成三個 API。 景點的圖片
網址以及捷運站名稱列表皆為陣列格式，可能包含⼀到多筆資料。
## Part 1 - 3：將網站上線到 AWS EC2
請在 AWS EC2 的服務上建立⼀台 Linux 機器，透過遠端連線進⾏管理，最終將網站上線
