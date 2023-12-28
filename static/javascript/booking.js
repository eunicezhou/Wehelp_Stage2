const content = document.querySelector(".content");
const headerLeft = document.querySelector('.header--left');
const headerRight = document.querySelector('.header--right');
const headerAttraction = document.querySelector('#attraction');
const total = document.querySelector('#total');
const deleteCan = document.querySelector(".delete");
const purchaseInfor = document.querySelector('.header--purchase');
const submitButton = document.querySelector("#fakeButton");

// Model: 抓取預定資訊
async function orderData(){
    const token = localStorage.getItem('token');
    if(!token){
        window.location.href="/";
    }else{
        let method = {method:"GET",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization": `Bearer ${token}`
                    }}
        
        return await fetchInformation('/api/booking', method);
    }
}

// View: 建立預定內容
async function displayOrder() {
    let data = await orderData();
    let username = await confirmMember();
    document.querySelector(".header--top_div--welcome").textContent=`您好，${username}。待預定行程如下:`
    if(data.data === "尚無任何資料"){
        document.querySelector(".header--top_div--record").textContent="目前尚無預定行程";
        document.querySelector('.header--buttom').style.display= "none";
        content.style.display= "none";
    }else{
        let attraction = data['attraction']['name'];
        const headerImage = document.createElement('img');
        headerImage.setAttribute('src',data['attraction']['image'][0]);
        headerImage.className = 'header__img';
        headerLeft.appendChild(headerImage);
        
        headerAttraction.textContent=`${attraction}`;
        purchaseInfor.innerHTML=`
        <div><span class="bold text">日期 :</span><span>${data['date']}</span></div>
        <div><span class="bold text">時間 :</span><span>${data['time']}</span></div>
        <div><span class="bold text">費用 :</span><span>${data['price']}</span></div>
        <div><span class="bold text">地點 :</span><span>${data['attraction']['address']}</span></div>
        `
        content.style.display="block";
        total.textContent = data['price'];
    }
}

window.addEventListener('load', displayOrder);

//刪除資料
function deleteSession(){
    const token = localStorage.getItem('token');
    let method = {method:"DELETE",
    headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`}};
    
    fetchInformation('/api/booking', method)
    .then((data)=>{return data.data;})
    .then(()=>{
        window.location.reload();
    })
}
deleteCan.addEventListener('click',deleteSession)

//設定TPDirect
TPDirect.setupSDK('137075', 'app_txMHDecsEW8QxquSi1sB6C5x4mk8GysladlwC2UNcnR3K5caIoL7cDtzw9VB', 'sandbox');

const iframeFields= {
    number: {
        element: '#card-number',    
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM/YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'CCV'
    }
}
const styles={
    '.valid': {
        'color': 'green'
    },
    '.invalid': {
        'color': 'red'
    }
}

TPDirect.card.setup({
    fields: iframeFields,
    style:styles,
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 3,
        endIndex: 15
    }
})

//獲取prime
submitButton.addEventListener('click', () => {
    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    console.log(tappayStatus);
    // 確認是否可以獲得prime
    if (tappayStatus.canGetPrime === false) {
        console.log('無法獲得prime')
        return
    }

    // Get prime
    TPDirect.card.getPrime(async(result)=> { 
        const prime = result.card.prime;
        let whetherPay = await pay(prime);
        console.log(whetherPay)
        let payment = whetherPay.data.payment.status;
        let orderID = whetherPay.data.number;
        if(payment === 0){
            window.location.href=`/thankyou?number=${orderID}`
        }else{
            window.alert("付款未成功，請重新輸入資訊")
        }
    })
})
async function pay(prime){
    try{
        const token = localStorage.getItem('token');
        let clientorder = await clientInfor(); 
        let attraction = clientorder['attraction'];
        let address = clientorder['address'];
        let image = clientorder['image'];
        let id = clientorder['id'];
        let price = clientorder['price'];
        let date = clientorder['date'];
        let time = clientorder['time'];
        let contactName = clientorder['contactName'];
        let contactMail = clientorder['contactMail'];
        let contactPhone = clientorder['contactPhone'];
        let method = {method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body:JSON.stringify({
            "prime":prime,
            "order": {
                "price": price,
                "trip": {
                    "attraction": {
                        "id": id, "name": attraction, "address": address, "image": image
                    },"date": date,"time": time
                },
                "contact": {
                "name": contactName, "email": contactMail, "phone": contactPhone
                }
            }
        })
        }
        const fetchOrderInfo = await fetchInformation('/api/orders', method);
        console.log(fetchOrderInfo);
        return fetchOrderInfo;
    }catch(error){
        return error;
    }
}

async function clientInfor(){
    const token = localStorage.getItem('token');
    let method = {method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let fetchBookingInfo = await fetchInformation('/api/booking', method)
    const attraction = fetchBookingInfo['attraction']['name'];
    const address = fetchBookingInfo['attraction']['address'];
    const image = fetchBookingInfo['attraction']['image'][0];
    const id =  fetchBookingInfo['attraction']['id'];
    const priceString = fetchBookingInfo['price'];

    let match = priceString.match(/\d+/);
    let price = parseInt(match);

    const date = fetchBookingInfo['date'];
    const time = fetchBookingInfo['time'];

    const contactNameElement = document.querySelector("#subscribename");
    let contactName = contactNameElement.value;
    const contactMailElement = document.querySelector("#contactMail");
    let contactMail = contactMailElement.value;
    const contactPhoneElement = document.querySelector("#contactPhone");
    let contactPhone = contactPhoneElement.value;
    let inforList = {
        "attraction":attraction,
        "address":address,
        "image":image,
        "id":id,
        "price":price,
        "date":date,
        "time":time,
        "contactName":contactName,
        "contactMail":contactMail,
        "contactPhone":contactPhone
    };
    return inforList;
}

