let token = localStorage.getItem('token');
let user = fetch('/api/user/auth',
    {method:"GET",
    headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`
    }}).then((response)=>{
        return response.json();
    }).then((data)=>{
        return data.data;})

window.addEventListener('DOMContentLoaded',async function init(){
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let orderID = urlParams.get('number');
    let username = await user.then(result=> result.name);
    fetch(`/api/orders/${orderID}`,
            {method:"GET",
            headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${token}`
            }}).then(response=> response.json()
            ).then(result=>{
                    this.document.querySelector(".thankyou").innerHTML =`${username}，感謝訂購:`;
                    this.document.querySelector(".neworder").innerHTML = `本次訂單編號:${orderID}`;
                    console.log(result.length);
                    for (let key in result){
                        console.log(result[key]);
                        const orderedData = this.document.createElement('div');
                        const image = this.document.createElement('img')
                        image.setAttribute('src',result[key]['trip']['attraction']['image'])
                        image.setAttribute('class',"orderImg");
                        orderedData.appendChild(image);

                        const dataInfo = this.document.createElement('div');
                        dataInfo.setAttribute('class',"dataInfo")
                        dataInfo.innerHTML=`
                        <div class="dataInfo--top">
                            <div class="title bold">訂單資訊</div>
                            <div class="orderNumber">訂單編號:${result[key]['number']}</div>
                            <div class="attraction">旅遊景點:${result[key]['trip']['attraction']['name']}</div>
                            <div class="dataDate">旅遊時間:${result[key]['trip']['date']}${result[key]['trip']['time']}</div>
                        </div>
                        <div class="dataInfo--bottom">
                            <div class="title bold">訂購人資訊</div>
                            <div class="contactName">聯絡人姓名:${result[key]['contact']['name']}</div>
                            <div class="contactMail">聯絡人信箱:${result[key]['contact']['email']}</div>
                            <div class="contactPhone">聯絡人電話:${result[key]['contact']['phone']}</div> 
                        </div>
                        `
                        orderedData.appendChild(dataInfo);
                        orderedData.setAttribute('class',"orderedData");
                        const historyList = this.document.querySelector(".history");

                        const status = document.createElement('div');
                        status.setAttribute('class',"status");
                        status.textContent=`${result[key]['status']}`;
                        orderedData.appendChild(status);
                        historyList.appendChild(orderedData);
                    }
            })
})