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
在我們的專案中有⼀個 data 資料夾，裡⾯存放了⼀個 taipei-attractions.json 檔案，包含所有
景點的相關資料。請在 MySQL 資料庫中，設計你的資料表，在 data 資料夾下，額外寫⼀隻
獨立的 Python 程式統⼀將景點資料存放到資料庫中。
請特別注意景點圖片的處理，我們會過濾資料中，不是 JPG 或 PNG 的檔案， 景點的每張圖
片網址 都必須被想辦法儲存在資料庫中。
## Part 1 - 2：開發旅遊景點 API
請仔細的按照 API 文件「旅遊景點」、「捷運站」部份的指⽰，完成三個 API。 景點的圖片
網址以及捷運站名稱列表皆為陣列格式，可能包含⼀到多筆資料。
## Part 1 - 3：將網站上線到 AWS EC2
請在 AWS EC2 的服務上建立⼀台 Linux 機器，透過遠端連線進⾏管理，最終將網站上線
