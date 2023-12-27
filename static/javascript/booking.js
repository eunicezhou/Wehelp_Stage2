const token = localStorage.getItem('token');
const content = document.querySelector(".content");
const headerTopWelcome = document.querySelector(".header--top_div--welcome");
const headerRecord = document.querySelector(".header--top_div--record");
const headerButtom = document.querySelector('.header--buttom');
const headerLeft = document.querySelector('.header--left');
const headerRight = document.querySelector('.header--right');
const headerAttraction = document.querySelector('#attraction');
const total = document.querySelector('#total');
const deleteCan = document.querySelector(".delete");
const purchaseInfor = document.querySelector('.header--purchase');
const submitButton = document.querySelector("#fakeButton");

const userInfoRequestMethod = {method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${token}`
                }}
const bookingDeleteMethod = {method:"DELETE",
                        headers:{
                            "Content-Type":"application/json",
                            "Authorization": `Bearer ${token}`}}
const fetchUserInfo = fetchInformation('/api/user/auth',userInfoRequestMethod)
    .then((data)=>{return data.data;})
const fetchBookingInfo = fetchInformation('/api/booking',userInfoRequestMethod)

//建立預定資訊
function init(token) {
    if(!token){
        window.location.href="/";
    }else{
        fetchBookingInfo.then((data) => {
            if(data.data === "尚無任何資料"){
                fetchUserInfo.then(data=>data.name).then(username=>headerTopWelcome.textContent=`您好，${username}。待預定行程如下:`)
                
                headerRecord.textContent="目前尚無預定行程";
                headerButtom.style.display= "none";
                content.style.display= "none";
            }else{
                fetchUserInfo.then(data=>data.name).then(username=>headerTopWelcome.textContent=`您好，${username}。待預定行程如下:`)
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
        })
    }
    
    }
window.addEventListener('load',init(token));

//刪除資料
function deleteSession(){
    fetchInformation('/api/booking',bookingDeleteMethod)
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
        if(payment===0){
            window.location.href=`/thankyou?number=${orderID}`
        }else{
            window.alert("付款未成功，請重新輸入資訊")
        }
    })
})

let clientInfor = async function getClientInfor(){
    //因為booking是一個promise物件，所以可以直接使用await等待他執行結束，再取得他的值
    const attraction = await fetchBookingInfo.then(data=> data['attraction']['name']);
    const address = await fetchBookingInfo.then(data=> data['attraction']['address']);
    const image = await fetchBookingInfo.then(data=> data['attraction']['image'][0]);
    const id =  await fetchBookingInfo.then(data=> data['attraction']['id']);
    const price = await fetchBookingInfo.then((data)=> {
    let priceString = data['price'];
    console.log(priceString);
    let match = priceString.match(/\d+/);
    let price = parseInt(match);
    return price;
    });
    const date = await fetchBookingInfo.then(data=> data['date']);
    const time = await fetchBookingInfo.then(data=> data['time']);

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

async function pay(prime){
    try{
        //這邊的clientInfor是一個異步函式，因此必須等他先執行完才可以取其回傳值
        let clientInfo = await clientInfor(); // 注意這裡的寫法，呼叫函式需要使用 ()
        let attraction = clientInfo['attraction'];
        let address = clientInfo['address'];
        let image = clientInfo['image'];
        let id = clientInfo['id'];
        let price = clientInfo['price'];
        let date = clientInfo['date'];
        let time = clientInfo['time'];
        let contactName = clientInfo['contactName'];
        let contactMail = clientInfo['contactMail'];
        let contactPhone = clientInfo['contactPhone'];
        const orderPostMethod = {method: 'POST',
                        body:JSON.stringify({
                            "prime":prime,
                            "order": {
                                "price": price,
                                "trip": {
                                "attraction": {
                                    "id": id, "name": attraction, "address": address, "image": image
                                },
                                "date": date,
                                "time": time
                                },
                                "contact": {
                                "name": contactName, "email": contactMail, "phone": contactPhone
                                }
                            }
                        })
                        }
        const fetchOrderInfo = fetchInformation('/api/orders', orderPostMethod)
        return fetchOrderInfo;
    }catch {
        console.log("error");
    }
}

