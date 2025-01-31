"use strict";

// DOM load
document.addEventListener('DOMContentLoaded', async () => {
document.getElementById('GenerateKeyPairBtn').addEventListener('click', GenerateKeyPairBtn);
document.getElementById('KeyPairToClipboardBtn').addEventListener('click', KeyPairToClipboardBtn);
document.getElementById('QRcodeBtn').addEventListener('click', generateQRcode);
});

async function GenerateKeyPairBtn() {
    const [PubKey, SecKey] = await GenerateKeyPair();

    document.getElementById('SecKey').innerText = SecKey
    document.getElementById('PubKey').innerText = PubKey
    document.getElementById('CreateAccountStart').hidden = true
    document.getElementById('header-text').innerText = "Schlüsselpaar"
    document.getElementById('CreateAccountFirstStep').hidden = false
}

/**
GenRadomGUI generates a random seed, private key, and public key.
@returns  {void}
 */
async function GenerateKeyPair() {
	const secKey = await crypto.getRandomValues(new Uint8Array(32));
	const secKeyHex = await ArrayBufferToHex(secKey);
	let k = await window.nobleEd25519.utils.getExtendedPublicKey(secKeyHex);
	const pubKey = k.point.toHex().toUpperCase();
    
    // 64-stelligen Hex-Schlüssel in 21 mal drei Stellen plus eine Stelle = 22 seed Wörter 
    let hexString = 'FFF'
    const decimalNumber = parseInt(hexString, 16).toString();
    console.log(decimalNumber)
    
    return [pubKey , secKeyHex];
}


function KeyPairToClipboardBtn() {
    const SecKey = document.getElementById('SecKey').value
    const PubKey = document.getElementById('PubKey').value
	const textToClipboard = 'Public Key : ' + PubKey + '\n' + 'Secret Key : ' + SecKey
    navigator.clipboard.writeText(textToClipboard);
    alert("Kopiert " + '\n \n'  + textToClipboard);
}

// helper functions

async function ArrayBufferToHex(buffer) {
	return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join('').toUpperCase();
};

function generateQRcode() {
    document.getElementById('QRcodeBtn').hidden = true
    document.getElementById('qrcode').innerHTML = ""

    var qrcode = new QRCode(document.getElementById("qrcode"), {
    width : 250,
    height : 250,
    useSVG : true
    });

    let qrcodeObj = qrcode.makeCode(document.getElementById('PubKey').innerText);
    document.getElementById('qrcode').hidden = false;
}