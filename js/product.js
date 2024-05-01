document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('http://127.0.0.1:3001/getalldata');
        if (response.ok) {
            const data = await response.json();
            var formdata = ""; // Initialize formdata as an empty string
            data.forEach(element => {
                formdata+= `<div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.7s">
                <div class="product-item">
                    <div class="position-relative">
                    <img class="img-fluid" src="img/uploads/${element.imageUrl}" alt="">
                        <div class="product-overlay">
                            <a onclick="buyProduct(event, '${element._id}', '${element.raddress}', '${element.price}','${element.imageUrl}')" class="btn btn-square btn-secondary rounded-circle m-1" href="#" data-bs-toggle="modal" data-bs-target="#cartModal"><i class="bi bi-cart"></i></a>
                        </div>
                    </div>
                    <div class="text-center p-4">
                    <a class="d-block h5" href="">${element.productname}</a>
                    <span class="text-primary me-1">${element.price} xrp</span></br>
                    <span class="text-primary me-1">r-address : ${element.raddress}</span>
                    </div>
                </div>
            </div>`
            });
            console.log(formdata)
            var div = document.getElementById("addingfield");
            div.innerHTML = formdata;
        } else {
            throw new Error('Error fetching data');
        }
        
    } catch (error) {
        console.error(error);
    }
});

const buyProduct = (e, id, raddress, price,imageUrl) => {
    e.preventDefault();
    document.getElementById("ownerraddress").value = raddress
    document.getElementById("productprice").value = price
    document.getElementById("mongodbid").value = id
    document.getElementById("tempimageurl").value = imageUrl

    
};

document.getElementById("proceedwithPaymentID").addEventListener("click",async(e)=>{
    e.preventDefault()
    try {
        const id = document.getElementById("mongodbid").value
        const raddress = document.getElementById("ownerraddress").value
        const familyseed = document.getElementById("familyseed").value
        const price = document.getElementById("productprice").value
        const imageUrl = document.getElementById("tempimageurl").value
        // console.log(id,raddress,familyseed,price)

        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3001/processpayment',
            data: {
                id,
                raddress,
                familyseed,
                price,
                imageUrl
            },
        });
        if(res.data.status === "success"){
            alert(res.data.message)
            window.location.reload(true)
        }
        console.log('Product uploaded successfully');
    } catch (error) {
        console.error('Error uploading product', error);
    }
    
})

document.getElementById("viewitembought").addEventListener("click", async (e) => {
    e.preventDefault();
    const raddress = document.getElementById("placeholderforraddress").value;
    try {
        const res = await axios.get(`http://127.0.0.1:3001/getmyproduct/${raddress}`);
        console.log("console.log",res.data.data);
        var formdata ;
        res.data.data.forEach(element => {
            console.log("element",element)
            formdata+= `<div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.7s">
            <div class="product-item">
                <div class="position-relative">
                <img class="img-fluid" src="img/uploads/${element.imageUrl}" alt="">
                    <div class="product-overlay">
                    </div>
                </div>
                <div class="text-center p-4">
                <a class="d-block h5" href="">transaction id ${element.transactionid}</a>
                <span class="text-primary me-1">${element.price} xrp</span></br>
                <span class="text-primary me-1">r-address : ${element.raddress}</span>
                </div>
            </div>
        </div>`
        });
        console.log("formdata",formdata)
        document.getElementById("displayingallMyitem").innerHTML = formdata
    } catch (error) {
        console.error('Error fetching product data', error);
    }
});


