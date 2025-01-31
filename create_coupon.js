"use strict";

var newCoupon = ''

// DOM load
	document.addEventListener('DOMContentLoaded', async () => {
	document.getElementById('CreateCouponBtn').addEventListener('click', CreateCoupon);
	document.getElementById('CouponToEmailButton').addEventListener('click', SendCouponByEmail);
	document.getElementById('CouponToClipboardButton').addEventListener('click', CouponToClipboard);
	document.getElementById('CouponToTxtFileButton').addEventListener('click', CouponToTxtFile);
	document.getElementById('CouponToPDFfileButton').addEventListener('click', CouponToPDFfile);
	const selectElement = document.querySelector("#standard");
	selectElement.addEventListener("change", setGUItheme);
});


function setGUItheme() {
	const selectedStandard = document.getElementById("standard").value
	setGUI(selectedStandard)

	// const crypto = require('crypto');
	
	// const text = 'Hello, World!';
	// const hash = crypto.createHash('sha256').update(text).digest('hex');
	
	// console.log(hash);
}

setTimeout(( ) => {
    let selectTag = document.getElementById('unitsSelect');
    const unitsForSelect = [ 'AuOz', 'eMNT', 'dMNT', 'BTC', 'ETH', 'G1', 'GDD' ];
    unitsForSelect.forEach((element) => {
    let opt = document.createElement("option");
    opt.value = element; // the index
    opt.innerHTML = element;
    selectTag.append(opt);
});
}, 100);

function buildSelectElement(elementID, itemsForSelect) {
    let selectTag = document.getElementById(elementID);
    itemsForSelect.forEach((element) => {
    let opt = document.createElement("option");
    opt.value = element; // the index
    opt.innerHTML = element;
    selectTag.append(opt);
	})
}

async function CreateCoupon() {
	// if pubKey || secKey Field empty -> generateRandom secKey -> generate pubKey from secKey

	const actionObj = getUserData()
	const secKeyAsHexStr = document.getElementById('your_private_key').value

	const secKey = window.HexToUI8(secKeyAsHexStr) 
	const pubKey = await publicKeyFromSecKey(secKey)
	actionObj.public_key = pubKey

	const actionObjAsStr = JSON.stringify(actionObj)
	const actionData = new TextEncoder().encode(actionObjAsStr)
	const couponSignature = await Sign(actionData,secKey)

    newCoupon = `[{"action":${actionObjAsStr},"signature":"${couponSignature}"}]`
	document.getElementById('OutputCoupon').innerText = newCoupon
	setGUI('processNewCoupon')
}

function CouponToClipboard() {
	window.copyTextToClipboard(newCoupon)
}

async function CouponToTxtFile() {
	const currTimeInMs = Date.now()
    const fileName = `GDC-${currTimeInMs}.GDC`
	window.saveTextToFile(newCoupon, fileName)
}

async function publicKeyFromSecKey(secKey) {
	// Ed25519 uses the lower 32 bytes of SHA-512
	// https://datatracker.ietf.org/doc/html/rfc8032#section-5.1.5
	let k = await window.nobleEd25519.utils.getExtendedPublicKey(secKey);
	return k.point.toHex().toUpperCase();
}

/**
Sign signs the current input message, depending on selected encoding method.
@returns  {void}
 */
async function Sign(dataToSign, secKey) {
	const Signatur = await window.ArrayBufferToHex(await window.nobleEd25519.sign(dataToSign, secKey));
	return Signatur;
}

function setGUI(stateOfGUI) {
	if ( stateOfGUI == 'processNewCoupon' ) {
		document.getElementById('loadForm').hidden = true
			document.getElementById('processNewCoupon').hidden = false
			console.log('in dem if', stateOfGUI)
			return;
		}
		
	document.getElementById('name_of_coupon').hidden = true

	switch (stateOfGUI) {
		case 'gedanke':
			document.getElementById('Title').textContent = 'GeDANKE schöpfen';
			break;
		case 'eminuto':
			document.getElementById('Title').textContent = 'eMinuto schöpfen';
			// hide Euro, Silber, ExtraRessourcen
			break;
		case 'dminuto':
			document.getElementById('Title').textContent = 'dMinuto schöpfen'
			break;
		case 'dank':
			document.getElementById('Title').textContent = 'DANK schöpfen'
			break;
		case 'gutschein_fuer_freunde':
			document.getElementById('Title').textContent = 'Gutschein für Freunde'
			break;
		case 'talente':
			document.getElementById('Title').textContent = 'Talente schöpfen'
			break;
		case 'gdc_kids':
			document.getElementById('Title').textContent = 'Kinder-GeDANKE'	
			break;
		case 'aminuto':
			document.getElementById('Title').textContent = 'minuto schöpfen'
			break;
		case 'nahla_tala':
			document.getElementById('Title').textContent = 'NahlaTala schöpfen'
			break;		
		case 'noams_geld_welt':
			document.getElementById('Title').textContent = 'Noams Geldwelt'
			break;
		case 'new_standard':
			document.getElementById('Title').textContent = 'Coupon gestalten'
			document.getElementById('name_of_coupon').hidden = false
			break;
			}
		} 
		
		function getUserData(){
			/* existiert ein valider secKey*/
	let secKey = document.getElementById('your_private_key').value
	/*if (typeof(secKey) != string || length(secKey) != 32 ){
		alert("gültigen geheimen Schlüssel eingeben. Dieser hat die Form: 1D76F9F47C5DA078CE0A3722319EB876087B7AEF95916B5563B61550BC970104");
	}
	*/
	const actionObj = {
		MODEL_TYPE: '',  // defines the algorithms and transaction methods to use
		ACTION_TYPE : 'Creation',  // Creation, Tranfer, Split, BLOCKED, HONORED 
		STANDARD : document.getElementById('standard').value, //eMinuto, dMinuto, Talente
		PROMISE : 'Mein Wort an Dich...',
		HOURS : document.getElementById('hours').value,
		MINUTES : checkMinutes(),
		OFFERS : document.getElementById('talents').value,  // things or talents you offer
		NEEDS : document.getElementById('needs').value,  // things or talents you need
		CONTACT : document.getElementById('contact').value,
		RECEIVER_EMAIL_ADDRESS : document.getElementById('receiver_email_address').value,
		RECEIVER_PUB_KEY : document.getElementById('receiver_pub_key').value,
		EMAIL : document.getElementById('your_email_address').value, 
		COMMUNITY : document.getElementById('community').value,  // are you part of a community?
		NUMBER : document.getElementById('number').value,  // a number or code you can freely choose 
		EXPIRES : document.getElementById('expires').value, // when does this coupon expire
		DATE : document.getElementById('curr_date').value,  // date of signature
		PUBLIC_KEY : addOwnPublicKey(),  // your public key
		PLACE : document.getElementById('place').value,  // place of signature
		ZIP_CODE : '',
		HASH : '',  // hash value of original coupon
		STREET : '',
		HOUSE_NUMBER : getHouseNumber(),
		GEO_LOCATION : '',
		NAME: '',  // your legal name (name of the persona)
		NICKNAME: '',
		NOTE: '',  // leave a note resp. comment
		RELATED: '', // your relations to other friends
		ROLE: '',  // administrator, manifestor etc.
		LANG: '', // language
		TEL: '', // Telefonnummer
		TZ: '',  //time zone
		UID: '',
		URL: '',  // website
		MESSENGER: '', // Telegram, Matrix, Whatsapp, Jabber, Skype, 
		EXPERTISE : '',  // your know something very good?
		BIRTHPLACE : '',
		DATE_OF_BIRTH: '', //  e.g. 01.01.1990
		BIRTH_NAME: '',  // your name before e.g. marriage.
		HOBBY : '',  // actively practiced 
		INTEREST: '', 
		IMPP: '', // Instant Messenger
		GENDER: '', // male / female
		ADR : '',  // Adresse
		CLASS: '', // classification: public or private (pseudo anonym per pool),
		ONBOARDING: '', // yes, no, auto, manual to the map
		ADDITIONAL_RESSOURCES: addRessources(),  // e.g. wood, tools, a place to stay
		TIMESTAMP : Number(new Date()), // current time as number
		SERVICE_OFFER_RANGE :  document.getElementById('range').value,
		DECREASE_RATE : document.getElementById('decrease_rate').value,
		LEGAL_SPHERE : '',  // private, commercial=UCC, canon law etc.
		COMMERCIAL_USE: '',  // yes, no
		PRIVATE_USE: '', // yes, no
		RESTRICT_RECIPIENTS :  document.getElementById('restrict_recipients').value,  // e.g. only friends of a certain community can accept this coupon
		RESTRICT_OFFERS : document.getElementById('restrict_offers').value, // this coupon can not be use in exchange of e.g. alcohol.
		REDEMPTION_PERIOD: '',  // the time span with this coupon has to bei redemed.
	} 
	
	function addRessources() {
		const resources = 'BTC'
		return resources
	}
	
	function getHouseNumber() {
		return
	}
	
	function addOwnPublicKey() {
		/* existiert ein valider secKey
		if typeOf(Signature) != base64 || length(Signature) != 32 return;
		
		if !(hours || minutes) || euro || silber || andere Ressourcen = 0 return;
		
		if !(Talente && Kontaktdaten && Ort && Datum) return;
		*/
		// vorhanden ? gültig? 
		let public_key = document.getElementById('YourPubKey')
	}
	
	removeEmptyProperties(actionObj)
	console.log(actionObj)
	return actionObj
}

function CouponToPDFfile() {
	// calls window.saveToPDFfile
}

function SendCouponByEmail() {
	const emailAdress = 'test@test.de'
	const emailSubject = 'Coupon-Nr. 3324 vom 12.12.22024'
	const emailData = 'mailto:' + emailAdress + '?subject=' + emailSubject + '&body=' + newCoupon
	window.open(emailData);
};

function removeEmptyProperties(obj) {
	for (const key in obj) {
		if (obj[key] === null || obj[key] == '' || obj[key] === undefined) {
			delete obj[key];
		}
	}
}

function checkMinutes() {
	const minutes = document.getElementById('minutes').value

	if (typeof minutes !== 'number') {
		// || typeof integer
		// popup: Bitte gebe ein ganze Zahl ein.
		return false;
	}
	
	if (minutes < 0 || minutes >= 60) {
		// popup: Bitte gebe ein ganze Zahl zwischen 0 und 59 ein.
	  return false;
	}

	// if minutes + hours = 0 & Talente != ''
	// du hast Talente eingetragen, jedoch keinen Zeitwert.
	return minutes;
}

function checkhours() {
	const hours = document.getElementById('hours').value

	if (typeof hours !== 'number') {
		// || typeof integer
		// popup: Bitte gebe ein ganze Zahl ein.
		return false;
	}
	
	if (hours <= 0 ) {
		// popup: Bitte gebe ein ganze Zahl gleich 0 oder größer ein.
	  return false;
	}
	return hours;
  }
  
// let selectedStandard = ''
// if ( typeof stateOfGUI !== 'string') {
	// 	stateOfGUI = ''
	// 	const e = document.getElementById("standard");
	// 	selectedStandard = e.value;
	// 	const text = e.options[e.selectedIndex].text;
	// }
	