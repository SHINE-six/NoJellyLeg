const convertImgToBase64 = async () => {
  const imgPromises = imageFile.map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  });

  const imgBase64 = await Promise.all(imgPromises);
  console.log(imgBase64);

  setImageBase64(imgBase64);
}

