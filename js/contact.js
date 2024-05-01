document.getElementById("uploadProduct").addEventListener("click", async (e) => {
    e.preventDefault();

    const productname = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const raddress = document.getElementById("raddress").value;
    const imageUrl = document.getElementById("productimage").files[0];

    const formData = new FormData();
    formData.append("productname", productname);
    formData.append("price", price);
    formData.append("raddress", raddress);
    formData.append("imageUrl", imageUrl);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3001/uploadproduct',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log(res)
        if(res.data.status === "success"){
            alert(res.data.message)
            window.location.reload(true)
        }
    } catch (error) {
        console.error('Error uploading product', error);
    }
});
