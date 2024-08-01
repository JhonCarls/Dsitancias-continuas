// script.js

// Analiza las imágenes cargadas y extrae sus características
function analyzeImages(files) {
    return Promise.all(Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const avgColor = getAverageColor(imageData);
                const texture = getTexture(imageData);
                const shape = getShape(imageData);

                resolve({ file, avgColor, texture, shape });
            };
        });
    }));
}

// Funciones de análisis (color promedio, textura, forma)
function getAverageColor(imageData) {
    const { data, width, height } = imageData;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    const pixelCount = width * height;
    return [r / pixelCount, g / pixelCount, b / pixelCount];
}

function getTexture(imageData) {
    const { data, width, height } = imageData;
    let texture = 0;
    for (let i = 0; i < data.length - 4; i += 4) {
        texture += Math.abs(data[i] - data[i + 4]) + Math.abs(data[i + 1] - data[i + 5]) + Math.abs(data[i + 2] - data[i + 6]);
    }
    return texture / (width * height);
}

function getShape(imageData) {
    const { data, width, height } = imageData;
    let shape = 0;
    for (let i = 0; i < data.length; i += 4) {
        shape += data[i] + data[i + 1] + data[i + 2];
    }
    return shape / (width * height);
}

// Calcula la distancia euclidiana entre dos vectores
function euclideanDistance(vec1, vec2) {
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

// Calcula la distancia entre dos imágenes basándose en sus características
function calculateDistance(image1, image2) {
    const colorDistance = euclideanDistance(image1.avgColor, image2.avgColor);
    const textureDistance = Math.abs(image1.texture - image2.texture);
    const shapeDistance = Math.abs(image1.shape - image2.shape);
    return colorDistance + textureDistance + shapeDistance;
}

document.getElementById('calculateButton').addEventListener('click', () => {
    const files = document.getElementById('imageUpload').files;
    if (files.length === 0) return;

    analyzeImages(files).then(images => {
        const queryImage = images[0]; // Usamos la primera imagen como consulta
        const distances = images.slice(1).map(image => {
            return {
                image: image,
                distance: calculateDistance(queryImage, image)
            };
        });

        displayResults(queryImage, distances);
    });
});

function displayResults(queryImage, distances) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const queryImgElement = document.createElement('img');
    queryImgElement.src = URL.createObjectURL(queryImage.file);
    resultsDiv.appendChild(queryImgElement);

    distances.sort((a, b) => a.distance - b.distance);

    distances.forEach(item => {
        const resultDiv = document.createElement('div');
        const imgElement = document.createElement('img');
        const distanceElement = document.createElement('p');

        imgElement.src = URL.createObjectURL(item.image.file);
        distanceElement.textContent = `Distancia: ${item.distance.toFixed(2)}`;

        resultDiv.appendChild(imgElement);
        resultDiv.appendChild(distanceElement);
        resultDiv.classList.add('distance');

        resultsDiv.appendChild(resultDiv);
    });
}
