/* 
let name = prompt("What is your name?");
alert(`Hello, ${name}!`); 
let booleanValue = confirm("Are you sure?")
*/

/* Change default onChange not triggering for same file input?

*/

const imagePicker = document.getElementById("image-picker");
const displayImage = document.getElementById("display-image");
const image = new Image();

imagePicker.onchange = () => {
    let imageSrc = URL.createObjectURL(imagePicker.files[0]);
    image.src = imageSrc;
    displayImage.src = imageSrc;
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

context.fillText("Hello World", 10, 10);

image.onload = function() {
    console.log("Image loaded");
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
}

function alterImage() {

    if (!image.src) {
        alert("Please select an image first!");
    } else {
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        let rawPixelArray = imageData.data; // Pixel Array: [r, g, b, alpha(Transparency), r, g, b, alpha, ...] 
        for(let i = 0; i < rawPixelArray.length; i += 4) {
            rawPixelArray[i] = 255 - rawPixelArray[i];
            rawPixelArray[i + 1] = 255 - rawPixelArray[i + 1];
            rawPixelArray[i + 2] = 255 - rawPixelArray[i + 2];
        }
        context.putImageData(imageData, 0, 0);

        let test = pixelObjectGenerator(imageData);
        console.log(test);

    }
}

// Here, k (number of clusters) is 2.
function kMeans(pixelArray) {
    let c1 = [];
    let c2 = [];
    /* const randomNumberA = randomInt(0, data.length - 1);
    const randomNumberB = exclusiveRandomInt(0, data.length - 1, randomNumberA);
    let meanC1 = data[randomNumberA], meanC2 = data[randomNumberB]; */
    // let meanC1 = pixelArray[0], meanC2 = pixelArray[pixelArray.length - 1];
    let meanC1 = pixelArray[0][0], meanC2 = pixelArray[100][0];

    //console.log(pixelArray[0], pixelArray[100], "sugon")

    let oldMeanC1, oldMeanC2;

    let infinityDefender = 0;

    do {
        c1 = [], c2 = [];
        oldMeanC1 = meanC1, oldMeanC2 = meanC2;

        for (let i = 0; i < pixelArray.length; i++) {
            if (euclideanDistance(pixelArray[i][0], meanC1) < euclideanDistance(pixelArray[i][0], meanC2)) {
                c1.push(pixelArray[i]);
            } else {
                c2.push(pixelArray[i]);
            }
        }
        
        if (infinityDefender > 100) {
            break;
        }
        infinityDefender++;

        meanC1 = meanCalculator(c1);
        meanC2 = meanCalculator(c2);
        // console.log("In kmeans loop", oldMeanC1, meanC1, oldMeanC2, meanC2)
        
    // } while (!(linearArrayIsEqual(oldMeanC1, meanC1) && linearArrayIsEqual(oldMeanC2, meanC2)));
    } while (!(oldMeanC1 === meanC1 && oldMeanC2 === meanC2));
    
    // console.log(`Out of kmeans loop ${infinityDefender}`, oldMeanC1, meanC1, oldMeanC2, meanC2)
    console.log(c1.length, c2.length, "-Cluster length")
    return [c1, c2];
}

function meanCalculator(pixelArray) {
    if (pixelArray.length === 0) {
        return 0;
    }

    let sumR = 0;
    // let sumG = 0, sumB = 0;
    for (let i = 0; i < pixelArray.length; i++) {
        sumR += pixelArray[i][0];
        // sumG += pixelArray[i][1];
        // sumB += pixelArray[i][2];
    }
    return sumR / pixelArray.length;
}

function linearArrayIsEqual(array1, array2) {
    let equalFlag = true
    if (array1.length === array2.length) {
        i = 0;
        while (i < array1.length) {
            if (array1[i] !== array2[i]) {
                equalFlag = false;
                break;
            }
            i++;
        }
    } else {
        return !equalFlag;
    }
    return equalFlag;        
}

/* function euclideanDistance(pointA, pointB) {
    return Math.sqrt((pointA[0] - pointB[0]) ** 2 + (pointA[1] - pointB[1]) ** 2 + (pointA[2] - pointB[2]) ** 2);
} */

function euclideanDistance(pointA, pointB) {
    return Math.sqrt((pointA - pointB) ** 2);
}

function pixelObjectGenerator(imageData) {
    let pixelArray = [];
    for (let i = 0, j = 0; i < imageData.data.length; i += 4, j++) {
        pixelArray.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3], j, imageData.data[i] * 0.2126 + imageData.data[i + 1] * 0.7152 + imageData.data[i+2] * 0.0722]);
    }
    return pixelArray;
}

function testConvertImage(choice) {
    
    if (choice === "embed" && (!image.src || !inputMessage || !inputKey)) {
        alert("Please select an image, message and encrypting key first!");
        return;
    } else if (choice === "decode" && (!image.src || !inputKey)) {
        alert("Please select an image and decrypting key first!");
        return;
    }
    
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let pixelArray = pixelObjectGenerator(imageData);
    let [c1, c2] = kMeans(pixelArray);

    /* Call stack size exceeded error
    let intensityArrayC1 = c1.map((pixel) => pixel[5]);
    let intensityArrayC2 = c2.map((pixel) => pixel[5]);
    let highIntensityCluster = Math.max(...intensityArrayC1) > Math.max(...intensityArrayC2) ? c1 : c2; */

    let intensityArrayC1 = c1.map((pixel) => pixel[5]);
    let intensityArrayC2 = c2.map((pixel) => pixel[5]);
    let maxIntensityC1 = intensityArrayC1.reduce((max, intensity) => Math.max(max, intensity), -Infinity);
    let maxIntensityC2 = intensityArrayC2.reduce((max, intensity) => Math.max(max, intensity), -Infinity);
    let highIntensityCluster = maxIntensityC1 > maxIntensityC2 ? c1 : c2; //SWAPPED FOR DEBUGGING, CHANGE BACK WHEN DONE! UPDATE: REVERTED!

    // for (let i = 0; i < highIntensityCluster.length; i++) {
    //     imageData.data[highIntensityCluster[i][4] * 4] = 255;
    //     imageData.data[highIntensityCluster[i][4] * 4 + 1] = 0;
    //     imageData.data[highIntensityCluster[i][4] * 4 + 2] = 0;
    // }
    // context.putImageData(imageData, 0, 0);

    /* let ciphertext = document.getElementById("display-ciphertext").value;
    let ciphertextBits = base64ToBinary(ciphertext);

    for (let i = 0; i < ciphertextBits.length; i++) {
        for(let j = 0; j < 3; j++) {
            let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][j]);
            colorBitValue = colorBitValue.slice(0, 7) + ciphertextBits[i];
            highIntensityCluster[i][j] = parseInt(colorBitValue, 2);
        }
    }
    context.putImageData(imageData, 0, 0); */

    if (choice === "embed") {
        encryptButton();
        embedDataInImage(highIntensityCluster);
    } else if (choice === "decode") {
        decodeDataFromImage(highIntensityCluster);
        decryptButton();
    }
    
}

function embedDataInImage(highIntensityCluster) {
    let ciphertext = document.getElementById("display-ciphertext").value;
    let ciphertextBits = base64ToBinary(ciphertext);

    /* Wrong logic
    for (let i = 0; i < ciphertextBits.length; i++) {
        for(let j = 1; j < 3; j++) {
            let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][j]);
            colorBitValue = colorBitValue.slice(0, 7) + ciphertextBits[i];
            highIntensityCluster[i][j] = parseInt(colorBitValue, 2);
        }
    } */

    //Sugon
    /* for (let i = ciphertextBits.length; i < highIntensityCluster.length; i++) {
        for(let j = 1; j < 3; j++) {
            let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][j]);
            colorBitValue = colorBitValue.slice(0, 7) + "0";
            highIntensityCluster[i][j] = parseInt(colorBitValue, 2);
        }
    } */

    
    for (let i = 0, ciphertextBit = 0; i < highIntensityCluster.length; i++) {
        
        if (ciphertextBit < ciphertextBits.length) {
            // let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][pixelBit]);
            // colorBitValue = colorBitValue.slice(0, 7) + ciphertextBits[i];
            // highIntensityCluster[i][pixelBit] = parseInt(colorBitValue, 2);
            // pixelBit = (pixelBit === 1) ? 2 : 1;

            for (let pixelBit = 1; pixelBit < 3; pixelBit++) {
                let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][pixelBit]);
                colorBitValue = colorBitValue.slice(0, 7) + ciphertextBits[ciphertextBit++];
                highIntensityCluster[i][pixelBit] = parseInt(colorBitValue, 2);
            }
        } else {
        
            // let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][pixelBit]);
            // colorBitValue = colorBitValue.slice(0, 7) + '0';
            // highIntensityCluster[i][pixelBit] = parseInt(colorBitValue, 2);
            // pixelBit = (pixelBit + 1) % 3;   
            for (let pixelBit = 1; pixelBit < 3; pixelBit++) {
                let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][pixelBit]);
                colorBitValue = colorBitValue.slice(0, 7) + '0';
                highIntensityCluster[i][pixelBit] = parseInt(colorBitValue, 2);
            }     
        }
    }

    

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < highIntensityCluster.length; i++) {
        // imageData.data[highIntensityCluster[i][4] * 4] = highIntensityCluster[i][0];
        imageData.data[highIntensityCluster[i][4] * 4 + 1] = highIntensityCluster[i][1];
        imageData.data[highIntensityCluster[i][4] * 4 + 2] = highIntensityCluster[i][2];
    }

    context.putImageData(imageData, 0, 0);

    console.log("ciphertextBits: ", ciphertextBits.length, ciphertextBits)
}

function decodeDataFromImage(highIntensityCluster) {
    let extractedBits = "";
    for (let i = 0; i < highIntensityCluster.length; i++) {
        for(let j = 1; j < 3; j++) {
            let colorBitValue = convertIntToBinary8Bit(highIntensityCluster[i][j]);
            extractedBits += colorBitValue.slice(-1);
        }
    }
    console.log("Extracted bits: ", extractedBits.length, extractedBits, )
    let extractedMessage = binaryToBase64(extractedBits);
    console.log("Extracted message: ", extractedMessage.length, extractedMessage, )
    let ciphertextField = document.getElementById("display-ciphertext");
    ciphertextField.value = extractedMessage;
}

function convertIntToBinary8Bit(int) {
    let binary = int.toString(2);
    let binary8Bit = Array(8 - binary.length + 1).join('0') + binary;
    return binary8Bit;
}

console.log(convertIntToBinary8Bit(8));

//console.log(euclideanDistance([0,0,0], [1,2,3]))

// function testf() {
//     let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     let pixelArray = pixelObjectGenerator(imageData);
//     let clusters = kMeans(pixelArray);
// }

// function randomInt(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function exclusiveRandomInt(min, max, excludeNumber) {
//     let random = randomInt(min, max);
//     while (random === excludeNumber) {
//         random = randomInt(min, max);
//     }
//     return random;
// }

/* ************************************************************************************************************************************ */

// const CryptoJS = require("crypto-js");

const inputMessageField = document.getElementById("input-message");
const inputKeyField = document.getElementById("input-key");
let inputMessage, inputKey;

inputMessageField.onchange = () => {
    inputMessage = inputMessageField.value;
}

inputKeyField.onchange = () => {
    inputKey = inputKeyField.value;
}

function encryptMessage(inputMessage, inputKey) {
    const message = inputMessage;
    const secretKey = inputKey;
    const ciphertext = CryptoJS.AES.encrypt(message, secretKey).toString();
    resetKeyField();
    return ciphertext;
}

function resetKeyField() {
    inputKeyField.value = "";
    inputKey = "";
}

function decryptMessage(ciphertext, inputKey) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, inputKey);
    const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
    return originalMessage;
    
}

function encryptButton() {
    // if (!inputMessage || !inputKey) {
    //     alert("Please enter a message and a key!");
    // } else {
        
        let ciphertext = encryptMessage(inputMessage, inputKey);
        let ciphertextField = document.getElementById("display-ciphertext");
        ciphertextField.value = ciphertext;
        
    // }
}

function decryptButton() {
    // if (!inputKey) {
    //     alert("Please enter secret key!"); //Add encrypt button click listener...
    // } else {
        
        let ciphertext = document.getElementById("display-ciphertext").value;
        console.log("Testing decrypt: ", ciphertext, inputKey);
        let decryptedMessage = decryptMessage(ciphertext, inputKey);
        if (!decryptedMessage) {
            alert("Wrong key!");
        } else {
            let decryptedMessageField = document.getElementById("display-decrypted-message");
            decryptedMessageField.value = decryptedMessage;
        }

    //}
}

// function embedImage(cluster) {
//     let ciphertext = document.getElementById("display-ciphertext").value;
//     let ciphertextBits = base64ToBinary(ciphertext);

//     // let ciphertextBitsField = document.getElementById("display-ciphertext-bits");
//     // ciphertextBitsField.value = ciphertextBits;
//     console.log(ciphertextBits);

//     let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

// }

// The message you want to encrypt

// const message = inputMessage;

// // The secret key
// const secretKey = "my-secret-key";

// // Encrypt the message
// const ciphertext = CryptoJS.AES.encrypt(message, secretKey).toString();

// // Decrypt the ciphertext
// const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
// const originalMessage = bytes.toString(CryptoJS.enc.Utf8);

// console.log(originalMessage); // Outputs: "Hello, world!"

function base64ToBinary(base64) {
    const decoded = atob(base64); //Decoding Base64 [A-Z, a-z, =, +...] to ASCII string.
    console.log("ASCII: ", decoded)
    let binary = "";
    for(let i = 0; i < decoded.length; i++) {
        const bin = decoded.charCodeAt(i).toString(2);
        binary += Array(8 - bin.length + 1).join('0') + bin; // pad with zeros to ensure it's 8 bits long
        console.log("binary: ", binary, "binlength", bin.length, "bin: ", bin);
    }
    return binary;
}

function binaryToBase64(binary) {
    binary = binary.replace(/0+$/, ''); // Remove trailing zeros
        
    while (binary.length % 8 !== 0) {
        binary = binary + '0';
    }

    console.log("Amogi!: ", binary.includes(' '), binary.length)

    let ascii = "";
    for(let i = 0; i < binary.length; i += 8) {
        ascii += String.fromCharCode(parseInt(binary.substr(i, 8), 2));
    }
    console.log("ASCII: ", ascii.includes(' '), ascii.length); 
    // console.log(btoa(ascii));
    return btoa(ascii);
}

function downloadButton() {
    if (!image.src) {
        alert("Please select an image first!");
    } else {
        let canvas = document.getElementById("canvas");
        let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let link = document.createElement("a");
        link.download = "test_embedded_image.png";
        link.href = image;
        link.click();
    }
}

/**************************************************************************************/

const modeSelector = document.getElementById("site-mode-selector");

const embedElements = document.getElementsByClassName("embed-element");
const decodeElements = document.getElementsByClassName("decode-element");
const title = document.getElementById("main-content-title");

for (let i = 0; i < decodeElements.length; i++) {
    decodeElements[i].style.display = "none";
}

modeSelector.onchange = () => {
    console.log("Test change")
    const currentMode = modeSelector.value;
    title.innerText = currentMode === "embed" ? "Embed Message" : "Decode Image";
    
    if (currentMode === "embed") {
        for (let j = 0; j < embedElements.length; j++) {
            embedElements[j].style.display = "block";
        }
        for (let i = 0; i < decodeElements.length; i++) {
            decodeElements[i].style.display = "none";
        }
    } else {
        for (let i = 0; i < decodeElements.length; i++) {
            decodeElements[i].style.display = "block";
        }
        for (let i = 0; i < embedElements.length; i++) {
            embedElements[i].style.display = "none";
        }
    }
}