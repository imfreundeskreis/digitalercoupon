"use strict";

/* 
UI-Sprache setzen
{de : {time:"Zeit",place:"Ort",date:"Datum"} ,
 en : {} ,
 fr : {} }  
*/

// DOM load
	document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('VerifyBtn').addEventListener('click', verifyCoupon);
    document.getElementById('AcceptCouponButton').addEventListener('click', acceptCoupon);
    document.getElementById('SignAcceptButton').addEventListener('click', signAcceptance);
    document.getElementById('CouponToEmailButton').addEventListener('click', SendCouponByEmail);
	document.getElementById('CouponToClipboardButton').addEventListener('click', CouponToClipboard);
	document.getElementById('CouponToTxtFileButton').addEventListener('click', CouponToTxtFile);
	document.getElementById('CouponToPDFfileButton').addEventListener('click', CouponToPDFfile);
    setGUI('loadCoupon')
    });

    var couponObj = {}
    var actionsArray = {}
    var origCouponDataStr = ''
    var newCoupon = ''
    
function verifyCoupon(){

    //setGUI('verifyCoupon')

    const inputFieldText = document.getElementById('CouponData').value
    let actionsArray = []

    if (origCouponDataStr){
        actionsArray = JSON.parse(origCouponDataStr)
    } else if (inputFieldText) {
        origCouponDataStr = inputFieldText
        actionsArray = JSON.parse(inputFieldText)
    } else {
        window.alert('Bitte Datei laden oder Text in das Feld kopieren.')
        return;
    }
    console.log('weiter')

    setGUI('showContent')
    showCouponContent()

    readCouponActionsList()

    // Ist der Coupon aktuell oder ist ein aktueller im FK veröffentlicht?
    calculateResidualValidity()

    // alle pubkeys auslesen
    getAllPubKeysFromActionList()
    
    // Lade die Public Keys aus dem FK
    loadPubKeysFromCommunity()

    // pubkeys von Aktionsliste und FK-Liste abgleichen
    // Public Keys aus Transaktionen im FK bekannt?
    searchForUnkownPubKeys()

    // verifySignaturesOfAllActions()

    // verify transactions 
    for (var i = 0; i < actionsArray.length; i++) {
        const PubKey = window.HexToUI8(actionsArray[i].action.public_key)
        const Signature = window.HexToUI8(actionsArray[i].signature)
        const CouponData = new TextEncoder().encode(actionsArray[i].action)
        console.log('pubkey:', PubKey)
        Verify(Signature, CouponData, PubKey)
    }
}

function setGUI(stateOfGUI) {
	/*if (!stateOfGUI) {
		stateOfGUI = document.getElementById('standard').value
	}
*/
	switch(stateOfGUI) {

        case 'loadCoupon':
            document.getElementById('loadCoupon').hidden = false
            break;
        case 'showContent':
            document.getElementById('loadCoupon').hidden = true
            document.getElementById('VerificationResult').hidden = false
            break;
        case 'structuredViewOnCoupon':
            document.getElementById('loadCoupon').style.visibility = "hidden"; 
            document.getElementById('verifyCoupon').hidden = false
            break;        
        case 'verifyCoupon':
            document.getElementById('loadCoupon').hidden = true
            document.getElementById('verifyCoupon').hidden = false
            break;        
		case 'signAcceptance':
            document.getElementById('verifyCoupon').hidden = true
            document.getElementById('signAcceptance').hidden = false
			break;
        case 'processNewCoupon':
            document.getElementById('signAcceptance').hidden =true
            document.getElementById('processNewCoupon').hidden = false
	}
}

function showCouponContent() {

//    const couponStr = '[{"action":{"action_type":"Creation","standard":"gedanke","promises":"Mein Wort an Dich...","contact":"asdf","gender":"m","nickname":"Nicky","role":"Helfer","additional_resources":"BTC","comments":"Ich freue mich auf unseren Austausch.","timestamp":1734822382524,"legal_sphere":"private","public_key":"A9FBCBE7C9BF789C12E30223BCB235B3005FAADB2ED97219BD617BFE294E249C"},"signature":"4F0E05E28D05AFE169659540EC6CB7F951571AA4DB74C564ABA604950442A046E51DD17E9EC907F6FCC187960CDA33213F311FA8411B8755EFAD3FF7D8E0630E"}]'
   
    const couponObj = JSON.parse(origCouponDataStr) 

    const propValuePairs = {...couponObj[0].action}

    for (const prop in propValuePairs) {
        const para = document.createElement("code");
        // const brElem = docu
        const node = document.createTextNode(`${prop} : ${propValuePairs[prop]}`);
        para.appendChild(node);
        const outputElement = document.getElementById("VerificationResult");
        outputElement.appendChild(para)
        outputElement.appendChild(document.createElement("br"))

    }
}

async function loadPubKeysFromCommunity() {
    console.log('OK : Public Keys vom FK geladen')
    return;
}

    async function logResult(valid) {
        console.log('Verifikation des Coupons : ', valid)
    }

async function Verify(Signature, CouponData, PubKey) {
	try {
		var valid = await window.nobleEd25519.verify(Signature, CouponData, PubKey);
        await logResult(valid)
	} catch (error) {
		console.error(error);
	}

    const para = document.createElement("p");
    const element = document.getElementById("VerificationResult");

    if (!valid) {
        const node = document.createTextNode("FEHLERHAFTER Coupon !");
        para.appendChild(node);
        element.appendChild(para);
		return;
	}
        const node = document.createTextNode("Verifikation OK !");
        para.appendChild(node);
        element.appendChild(para);
    return valid
}

function acceptCoupon() {
    setGUI('signAcceptance')
    document.getElementById('header').innerText = 'Coupon annehmen'
}

async function signAcceptance() {
    setGUI('processNewCoupon')

    const couponObj = {
        action : 'actionObj_as_String',
        signature : 'couponSignature'
    }

    const actionObj = {
        public_key : '',
        hash : '',  // hash value of original coupon
        timestamp : '',
        comments : ''
    }

    const actionObjAsStr = JSON.stringify(actionObj)
    const secKeyUi8 = window.HexToUI8(document.getElementById('SecKey').value)
    const dataToSign = new TextEncoder().encode(actionObjAsStr)
    const signature = await Sign(dataToSign,secKeyUi8)
    const origCoupon = origCouponDataStr.trim().slice(0,-1)
    
    newCoupon = `${origCoupon},{"action":"${actionObjAsStr}","signature":"${signature}"}]`

    document.getElementById('header').innerText = 'Coupon speichern'
    document.getElementById('OutputCoupon').innerText = newCoupon
}

async function Sign(dataToSign, secKey) {
    let signature = await ArrayBufferToHex(await window.nobleEd25519.sign(dataToSign, secKey));
    return signature
}

/**
ArrayBufferToHex accepts an array buffer and returns a string of hex.
Taken from https://stackoverflow.com/a/50767210/1923095
@param   {ArrayBuffer} buffer     Buffer that is being converted to UTF8
@returns {string}                 String with hex.
 */
async function ArrayBufferToHex(buffer) {
	return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join('').toUpperCase();
};

function CouponToClipboard() {
	window.copyTextToClipboard(newCoupon)
}

async function CouponToTxtFile() {
    const currTimeInMs = Date.now()
    const fileName = `GDC-${currTimeInMs}.GDC`
    await window.saveTextToFile(newCoupon, fileName)
    
    /*	const fileContent = JSON.stringify(couponObj)
	const fileName = 'coupon'
	window.saveTextToFile(fileContent, fileName)
*/
}

function CouponToPDFfile() {
	// calls window.saveToPDFfile
}

function SendCouponByEmail() {
    const couponData = JSON.stringify(newCoupon)
    const emailAdress = 'test@test.de'
    const emailSubject = 'Coupon-Nr. 3324 vom 12.12.22024'
    const emailData = 'mailto:' + emailAdress + '?subject=' + emailSubject + '&body=' + couponData
    window.open(emailData);
};

function previewFile() {
  const content = document.querySelector(".content");
  const [file] = document.querySelector("input[type=file]").files;
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
        origCouponDataStr = reader.result
        document.getElementById('CouponData').innerText = reader.result;
    },
    false,
  );

  if (file) {
    reader.readAsText(file);
  }
}

function calculateResidualValidity() {
    const para = document.createElement("p");
    const node = document.createTextNode("Prüfe Ablaufdatum...");
    para.appendChild(node);

    const element = document.getElementById("VerificationResult");
    element.appendChild(para);
    return;
}

function readCouponActionsList() { 
    const para = document.createElement("p");
    const node = document.createTextNode("OK : xx Aktionen in Aktionsliste.");
    para.appendChild(node);

    const element = document.getElementById("VerificationResult");
    element.appendChild(para);
    return;
}

function getAllPubKeysFromActionList() {
    console.log('Lese alle Public Keys aus der Aktionsliste...')
    return;
}

function searchForUnkownPubKeys() {
    console.log('OK : Public Keys der Teilnehmer bekannt.')
    return;
}

function verifySignaturesOfAllActions() {
    console.log('Prüfe die Signatur jeder Transaktion...')

    for (var i = 0; i < actionsArray.length; i++) {
        const PubKey = window.HexToUI8(actionsArray[i].public_key)
        const Signature = window.HexToUI8(actionsArray[i].signature)
        const CouponData = new TextEncoder().encode(actionsArray[i].action)

        const validCoupon = Verify(Signature, CouponData, PubKey)

        if (!validCoupon) {
            console.log('FEHLER : Signatur NICHT GÜLTIG !')
        } else {
            console.log('OK : Signatur ist gültig !')
        }
    }
}

/*
https://wiki.selfhtml.org/wiki/JavaScript/Tutorials/Eigene_modale_Dialogfenster

window.myPrompt function (text, OK, cancel, defaultValue) {
    var dialog = document.querySelector("#prompt"),
      inputElement = document.querySelector('#prompt [name="data"]'),
      textElement = document.querySelector("#prompt [data-text]");
  
    if (dialog && textElement) {
  
      inputElement.value = (defaultValue && defaultValue.length ? defaultValue : "");
      textElement.innerText = (text && text.length ? text : "");
      dialog.setCallback("cancel", cancel);
      dialog.setCallback("ok", function () {
        OK(inputElement.value);
      });
      dialog.show();
    }
  }
*/