const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "sk-proj-yrIT10tejtEImcaOLc14T3BlbkFJRUtqCdVfQS06jOTdTSrF"; //  API OpenAI aqui
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    
    // Defina a origem da imagem para os dados de imagem gerados por IA
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;
    
    // Quando a imagem for carregada, remova a classe de carregamento e defina os atributos de download
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    }
  });
}

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    // Enviar uma solicitação à API OpenAI para gerar imagens com base nas entradas do usuário
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512",
        response_format: "b64_json"
      }),
    });

    // Lançar uma mensagem de erro se a resposta da API não for bem-sucedida
    if(!response.ok) throw new Error("Falha ao gerar imagens de IA. Certifique-se de que sua chave API seja válida");

    const { data } = await response.json(); // Obter dados da resposta
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
}

const handleImageGeneration = (e) => {
  e.preventDefault();
  if(isImageGenerating) return;

  // Obter valores de entrada do usuário e quantidade de imagem
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);
  
  // Desative o botão gerar, atualize seu texto
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Gerando";
  isImageGenerating = true;
  
  // Criando marcação HTML para cartões de imagem com estado de carregamento
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
      `<div class="img-card loading">
        <img src="images/loader.svg" alt="AI generated image">
        <a class="download-btn" href="#">
          <img src="images/download.svg" alt="download icon">
        </a>
      </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuantity);
}

generateForm.addEventListener("submit", handleImageGeneration);