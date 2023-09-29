let token = localStorage.getItem('token');
const content = document.querySelector(".content");

//建立預定資訊
let user = fetch('/api/user/auth',
    {method:"GET",
    headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`
    }}).then((response)=>{
        return response.json();
    }).then((data)=>{
        return data.data.name;})

function init(token) {
    fetch('/api/booking',
        {method:"GET",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`
        }}).then((response) => {
            let data = response.json();
            return data;
        }).then((data) => {
            console.log(data);
            if(data.data === "尚無任何資料"){
                let text = document.querySelector("#header--top");
                user.then(username=>text.innerHTML=`您好，${username}。待預定行程如下:`)
                let record = document.createElement("div");
                record.setAttribute('class','record');
                record.textContent="目前尚無預定行程";
                header.appendChild(record);
                const content = document.querySelector('.content');
                content.style.display="none";
            }else{
                let text = document.querySelector("#header--top");
                user.then(username=>text.innerHTML=`您好，${username}。待預定行程如下:`)
                let attraction = data['attraction']['name'];
                
                const headerRight = document.createElement('div');
                const headerImage = document.createElement('img');
                const headerAttraction = document.createElement('div');
                const headerButtom = document.createElement('div');
                const headerLeft = document.createElement('div');
                const purchaseInfor = document.createElement('div');
                
                headerButtom.setAttribute('class','header--buttom');
                headerLeft.setAttribute('class','header--left');
                headerRight.setAttribute('class','header--right');
                headerImage.setAttribute('class','header__img');
                headerImage.setAttribute('src',data['attraction']['image'][0]);
                headerAttraction.setAttribute('class','header--attraction bold');
                purchaseInfor.setAttribute('class','purchase');

                headerLeft.appendChild(headerImage);
                headerRight.appendChild(headerAttraction);
                headerRight.appendChild(purchaseInfor);
                headerButtom.appendChild(headerLeft);
                headerButtom.appendChild(headerRight);
                
                headerAttraction.innerHTML=`<span>台北一日遊 : ${attraction}</span>\
                <img class="delete" src="./static/image/icon_delete.png">`;
                header.appendChild(headerButtom);
                
                purchaseInfor.innerHTML=`
                <div><span class="bold text">日期 :</span><span>${data['date']}</span></div>
                <div><span class="bold text">時間 :</span><span>${data['time']}</span></div>
                <div><span class="bold text">費用 :</span><span>${data['price']}</span></div>
                <div><span class="bold text">地點 :</span><span>${data['attraction']['address']}</span></div>
                `
                const content = document.querySelector('.content');
                content.style.display="block";
                const total = document.querySelector('#total');
                total.innerHTML = data['price'];
            }
            let deleteCan = document.querySelector(".delete");
            deleteCan.addEventListener('click',deleteSession)
        })
    }
window.addEventListener('load',init(token));

//刪除資料
function deleteSession(){
    fetch('/api/booking',{
        method:"DELETE",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`}
    }).then(()=>{
        window.location.reload();
    })
}

