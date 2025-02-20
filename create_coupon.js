"use strict";

var newCoupon = ''

// DOM load
	document.addEventListener('DOMContentLoaded', async () => {
	byID('createCouponBtn').addEventListener('click', createCoupon);
	byID('CouponToEmailButton').addEventListener('click', SendCouponByEmail);
	byID('CouponToClipboardButton').addEventListener('click', CouponToClipboard);
	byID('CouponToTxtFileButton').addEventListener('click', CouponToTxtFile);
	byID('CouponToPDFfileButton').addEventListener('click', CouponToPDFfile);
	byID('extra_data_input').addEventListener('click', ExtraDataInputsToggle);
	byID('extra_properties_input').addEventListener('click', ExtraPropertiesToggle);
	byID('extra_ressources_input').addEventListener('click', ShowAddRessourcesInputs);
	byID('no_extra_ressources_input').addEventListener('click', HideAddRessourcesInputs);
	byID('commercial_use').addEventListener('change', ShowCommercialDataInputs);
	byID('send_coupon_now').addEventListener('change', ShowReceipientDataInputs);
	byID('save_coupon').addEventListener('change', HideReceipientDataInputs);
	byID('toggle_expire_data_input').addEventListener('click', ToggleExpireDataInputs);

	const selectElement = document.querySelector("#standard");
	selectElement.addEventListener("change", setGUItheme);

	const start_date = new Date().toISOString().slice(0, 10)
	document.getElementById('signing_date').value = start_date //new Date().toISOString().slice(0, 10)
	document.getElementById('start_date').value = start_date
});
	

function setGUItheme() {
	const selectedStandard = getVal("standard")
	setGUI(selectedStandard)
}

setTimeout(( ) => {
    let selectTag = byID('unitsSelect');
    const unitsForSelect = [  'June/ G1', 'Chiemgauer', 'Gradido (GDD)', 'Wertbon im Freundeskreis','GeDANKE (GDC)', 'Talente' , 'eMinuto (eMNT)', 'dMinuto (dMNT)' ];
    unitsForSelect.forEach((element) => {
		let opt = document.createElement("option");
		opt.value = element; // the index
		opt.innerHTML = element;
		selectTag.append(opt);
		});
}, 100);

setTimeout(( ) => {
    let selectTag = byID('metal_unit_type');
    const unitsForSelect = [ '1/10 Unzen (oz)', '1/2 Unzen (oz)', 'Unzen (oz)', 'Gramm (g)', 'Kilogramm (kg)' ];
    unitsForSelect.forEach((element) => {
		let opt = document.createElement("option");
		opt.value = element; // the index
		opt.innerHTML = element;
		selectTag.append(opt);
		});
}, 100);

setTimeout(( ) => {
    let selectTag = byID('metal_type');
    const unitsForSelect = [ 'Silber (Ag)', 'Gold (Au)', 'Platin (Pt)' ];
    unitsForSelect.forEach((element) => {
		let opt = document.createElement("option");
		opt.value = element; // the index
		opt.innerHTML = element;
		selectTag.append(opt);
		});
}, 100);

setTimeout(( ) => {
    let selectTag = byID('crypto_type');
    const unitsForSelect = [ 'Bitcoin (BTC)', 'Ethereum (ETH)', 'Litecoin (LTC)', 'Monero (XMR)', 'Bitcoin Cash (BCH)', 'Cardano (ADA)' , 'Dash' ];
    unitsForSelect.forEach((element) => {
		let opt = document.createElement("option");
		opt.value = element; // the index
		opt.innerHTML = element;
		selectTag.append(opt);
		});
}, 100);

function buildSelectElement(elementID, itemsForSelect) {
    let selectTag = byID(elementID);
    itemsForSelect.forEach((element) => {
    let opt = document.createElement("option");
    opt.value = element; // the index
    opt.innerHTML = element;
    selectTag.append(opt);
	})
}

function checkUserInputData() {
	
	if (getVal('standard') == '') {
		alert("Definiere einen Standard!")
		return false
	}
	
	if (!checkSecKeyForValidity()) {return false} 
	if (checkTalentsAndTimeValue()) {return 'false'}
	if (checkStartDate()) {return 'false'}
	if (checkRadiusAndGeoLocation()) {return 'false'}

	if (checkForPositiveValidityPeriod () == 'false') {return false}
	if (checkKidsCoupon() == 'false') {return false}
	if (checkDecreaseRate() == 'false') {return false}
	if (checkPrivateCommercialUse() == 'false') {return false}
	if (checkAcceptancePeriod() == 'false') {return false}
	if (checkSigningPlace() == 'false') {return false}
	if (checkSigningDate() == 'false') {return false}
	if (checkSendCouponNow() == 'false') {return false}
	if (checkPrivateCommercialUse() == 'false') {return false}


}

async function createCoupon() {

	if (checkUserInputData() == 'false') {return 'false'}
	
	const actionObj = getUserData()
	console.log('hierhier')

	const secKeyAsHexStr = getVal('your_private_key')
	console.log('secKeyAsHexStr',secKeyAsHexStr)

	const secKey = window.HexToUI8(secKeyAsHexStr) 
	const pubKey = await publicKeyFromSecKey(secKey)
	actionObj.public_key = pubKey

	const actionObjAsStr = JSON.stringify(actionObj)
	const actionData = new TextEncoder().encode(actionObjAsStr)
	const couponSignature = await Sign(actionData,secKey)

    newCoupon = `[{"action":${actionObjAsStr},"signature":"${couponSignature}"}]`
	byID('OutputCoupon').innerText = newCoupon
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
		hideID('loadForm')
			byID('processNewCoupon').hidden = false
			return;
		}
		
	hideID('name_of_coupon')

	switch (stateOfGUI) {
		case 'wertbon':
			byID('Title').textContent = 'WertBon schöpfen';
			break;
		case 'gedanke':
			byID('Title').textContent = 'GeDANKE schöpfen';
			break;
		case 'eminuto':
			byID('Title').textContent = 'eMinuto schöpfen';
			// hide Euro, Silber, ExtraRessourcen
			break;
		case 'dminuto':
			byID('Title').textContent = 'dMinuto schöpfen'
			break;
		case 'dank':
			byID('Title').textContent = 'DANK schöpfen'
			break;
		case 'gutschein_fuer_freunde':
			byID('Title').textContent = 'Gutschein für Freunde'
			break;
		case 'talente':
			byID('Title').textContent = 'Talente schöpfen'
			break;
		case 'gdc_kids':
			byID('Title').textContent = 'Kinder-Coupon'	
			break;
		case 'aminuto':
			byID('Title').textContent = 'minuto schöpfen'
			break;
		case 'nahla_tala':
			byID('Title').textContent = 'NahlaTala schöpfen'
			break;		
		case 'noams_geld_welt':
			byID('Title').textContent = 'Noams Geldwelt'
			break;
		case 'new_standard':
			byID('Title').textContent = 'Coupon gestalten'
			byID('name_of_coupon').hidden = false
			break;
			}
		} 
		
function getUserData(){

	/* existiert ein valider secKey*/
	const secKey = getVal('your_private_key')
	if (typeof(secKey) != 'string' || secKey.length !== 64 ){
	alert("gültigen geheimen Schlüssel eingeben. Dieser hat die Form: 1D76F9F47C5DA078CE0A3722319EB876087B7AEF95916B5563B61550BC970104");
	}


	function getIdsByClass(className) {
		const idsArray = [];

		const elements = document.querySelectorAll(`.${className}`);

		elements.forEach(element => {
			if (element.id) {
				idsArray.push(element.id);
			}
		});
		return idsArray;
	}

	const ids = getIdsByClass('input');
	console.log(ids);

	const actionObj = {
		MODEL_TYPE: 'ED25519',  // defines the algorithms and transaction methods to use. Option ONLY for developers!
		ACTION_TYPE: 'creation',  // Creation, Tranfer, Split, BLOCKED, HONORED 
		STANDARD: getStandard(), //eMinuto, dMinuto, Talente
		COUPON_NAME: getCouponName(),
		PROMISE: 'Mein Wort an Dich: Für diesen Coupon erhältst Du nach Absprache folgende Talente / Ressourcen',
		HOURS: getHours(),
		MINUTES: getMinutes(),
		OFFERS: getOffers(),
		SERVICE_OFFER_RANGE: getServiceOfferRange(),
		EURO: getEuro(),
		//SILVEROZ: getSilver(),
		ADDITIONAL_RESSOURCES: addRessources(),  // e.g. wood, tools, a place to stay
		GEO_LOCATION: getGeoLocation(),
		NEEDS: getNeeds(),
		COMMENT: checkComment(),  // leave a note resp. comment
		NICKNAME: getNickName(),
		EMAIL: getEmail(),
		TELEGRAM: getTelegram(), 
		IMPP: getIMPP(),
		WEBSITE: getWebsite(),
		WHATSAPP: getWhatsApp(),
		MATRIX: getMatrix(),
		OTHER_MESSENGER: getOtherMessenger(),
		CONTACT: getContact(),
		COMMUNITY: getCommunity(),
		PRIVATE_USE: getPrivateUse(),
		COMMERCIAL_USE: getCommercialUse(),
		TITLE: getTitle(),
		FIRST_NAME: getFirstName(),  // your legal name (name of the persona)
		FAMILY_NAME: getFamilyName(),
		BIRTH_NAME: getBirthName(),
		DATE_OF_BIRTH: getDateOfBirth(),
		PLACE_OF_BIRTH: getPlaceOfBirth(), 
		STREET: getStreet(),
		HOUSE_NUMBER: getHouseNumber(),
		ZIP_CODE: getZipCode(),
		RESIDENCE: getResidence(),
		TAX_NUMBER: getTaxNumber(),
		QUASI_ANONYM: getQuasiAnonym(),
		SPLITABLE_COUPON: getSplitableCoupon(),
		ONBOARDING: getOnboarding(),
		START_DATE: getStartDate(),
		START_TIME: getStartTime(),
		VALIDITY_YEARS: getValidtyYears(),
		VALIDITY_DAYS: getValidityDays(),
		VALIDITY_HOURS: getValidityHours(),
		ACCEPTANCE_PERIOD: getAcceptancePeriod(),
		NUMBER: getNumber(),
		RECEIVER_EMAIL_ADDRESS: getReceiverEmailAddress(),
		RECEIVER_PUB_KEY: getReceiverPubKey(),
		EXPIRES: getExpires(),  // when does this coupon expire 
		PLACE: getSigningPlace(),
		SIGNING_DATE: getSigningDate(),
		PUBLIC_KEY: addOwnPublicKey(),  // your public key
		DECREASE_RATE: getDecreaseRate(),
		DECREASE_RATE_PURPOSE : getVal('decrease_rate_purpose'),
		RESTRICT_RECIPIENTS: getRestrictRecipients(), // e.g. only friends of a certain community can accept this coupon
		RESTRICT_OFFERS: getRestrictOffers(), // this coupon can not be use in exchange of e.g. alcohol.
		GUARANTOR: getGuarantor(),
		HASH: getHash(),  // !!! hash value of original coupon
		TEST_COUPON: getTestCoupon(),
		KIDS_COUPON: checkKidsCoupon(),
		RELATED: getRelated(), // your relations to other friends
		ROLE: getRole(),
		LANG: getLang(), // language
		TEL: getTel(),  // Telefonnummer
		TZ: getTimeZone(), //time zone
		EXPERTISE: getExpertise(), // your know something very good?
		HOBBY: getHobby(),   // actively practiced
		INTERESTS: getInterests(),
		GENDER: getGender(), // male / female
		//CLASS: getClassification(), // classification: public or private (pseudo anonym per pool),
		TIMESTAMP: Number(new Date()), // current time as number
	}
	
	function addRessources() {
		const resources = 'BTC'
		return resources
	}
	
	function getHouseNumber() {
		const houseNumber = getVal('house_number')

		if (houseNumber !== Number || houseNumber == '' || houseNumber == 0) {
			return ''
		} else {
			return houseNumber
		}
	}

	function addOwnPublicKey() {
		
		/* existiert ein valider secKey
		if typeOf(Signature) != base64 || length(Signature) != 32 return;
		
		if !(hours || minutes) || euro || silber || andere Ressourcen = 0 return;
		
		if !(Talente && Kontaktdaten && Ort && Datum) return;
		*/
		// vorhanden ? gültig? 

		// !!! PUBLIC KEY wird automaitsch aus SecKey generiert!
		let public_key = ''
		return public_key
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
}

function removeEmptyProperties(obj) {
	for (const key in obj) {
		if (obj[key] === null || obj[key] == '' || obj[key] === undefined) {
			delete obj[key];
		}
	}
}

function getClassification() {
	const classification = byID('classification')
	
	if (classification == true) {
		return 'private'
	} else {
		return 'public'
	}
}

function ExtraDataInputsToggle() {
	const visibilityOfInputs = byID('extraDataInputs').hidden

	if (visibilityOfInputs) {
		showID('extraDataInputs')
	} else {
		hideID('extraDataInputs')
	}
}

	// function ShowAddRessourcesInputs() {

	// }

function ShowCommercialDataInputs() {
	let commercialUse = byID('commercial_use').checked
	
	if (commercialUse == true) {
		console.log('commercial use')
		showID('commercial_use_inputs')
	} else {
		console.log('no commercial use')
		hideID('commercial_use_inputs')
	}
}

function ShowReceipientDataInputs() {
	const sendCouponNow = byID('send_coupon_now').checked

	if (sendCouponNow == true) {
		byID('save_coupon').checked = false
		showID('recipient_data')
	} else {
		byID('save_coupon').checked = true
		hideID('recipient_data')		
	}
}

function HideReceipientDataInputs() {
	const saveCoupon = byID('save_coupon').checked

	if (saveCoupon == true) {
		byID('send_coupon_now').checked = false
		hideID('recipient_data')
	} else {
		byID('save_coupon_now').checked = true
		showID('recipient_data')		
	}
}

function getRedemptionPeriod() {
	return true
}

function ToggleExpireDataInputs() {
	
	if  (byID('standard_expire_data_input').hidden == false) {

		hideID('standard_expire_data_input')
		byID('toggle_expire_data_input').innerText = 'Nutze die Standardeinstellungen.'
		showID('more_expire_data_input')
	} else {
		showID('standard_expire_data_input')
		byID('toggle_expire_data_input').innerText = 'Zeige weitere Optionen.'
		hideID('more_expire_data_input')
	}
}

function byID(elementName) {
	return document.getElementById(elementName)
}

function getVal(elementName) {
	const hidden = document.getElementById(elementName).hidden

	if (hidden) {
		return ''
	}
	return document.getElementById(elementName).value
}

function getExpires() {
	// calculate date of expiring
}

function getPlace() {

}

function getFirstName() {
	const visible = byID('extraDataInputs').visible

	if (visible == true) {
		return getVal('first_name')
	} else {
		return ''
	}
}

function getFamilyName() {
	const familyName = getVal('family_name')

	if (familyName !== true) {
		return getVal('family_name')
	} else {
		return '' 
	}
}

function getBirthName() {
	const visible = byID('extraDataInputs').visible

	if (visible == true) {
		return getVal('birth_name')
	} else {
		return ''
	}
}

function checkSecKeyForValidity() {
	const secKey = getVal('your_private_key')

	if (typeof(secKey) != 'string' || secKey.length !== 64 ) {
		//hex-Format prüfen
		alert("gültigen geheimen Schlüssel eingeben. Dieser hat die Form: 1D76F9F47C5DA078CE0A3722319EB876087B7AEF95916B5563B61550BC970104");
		return false
	} 	
	return true
}

function checkPrivateCommercialUse() {
	const privateUse = byID('private_use').checked
	const commercialUse = byID('commercial_use').checked

	if (privateUse || commercialUse) {
		return 'true'
	} else {
		alert("Der Coupon ist weder privat noch kommerziell nutzbar!");
		return 'false'
	}
}

function checkForPositiveNumber(valueToCheck, elementName) {
	return
}

function checkForValidHexKey(hexKey, elementName) {

	if (typeof(hexKey) != 'string' || hexKey.length !== 64 ) {
	alert("gültigen geheimen Schlüssel eingeben. Dieser hat die Form: 1D76F9F47C5DA078CE0A3722319EB876087B7AEF95916B5563B61550BC970104")
	return 'false'
	} else {
		return
	}	
}

function checkForValidEmailAddress(emailAddress, elementName) {

}

function checkDecreaseRate() {
	const decreaseRate = getVal('decrease_rate')

	if (decreaseRate == '') {
		return true
	}

	if (decreaseRate !== 'number') {
		alert("Die Schwundrate ist keine Zahl.")
		return false
	}

	if (decreaseRate < 0 || decreaseRate !== 'number') {
		alert("Die Schwundrate muss null oder positiv sein.")
		return false
	}

	const decreaseRatePurpose = getVal('decrease_rate_purpose')

	if (decreaseRate > 0 && decreaseRatePurpose == '') {
		alert("Gebe einen Verwendungszweck für die Schwundrate ein, bspw. eine Gemeinschaft oder du selbst als Empfänger.")
		return false
	}
}

function checkSigningPlace() {
	const signingPlace = getVal('signing_place')

	if (signingPlace == '' || signingPlace !== String) {
		return false
	}
	return signingPlace
}

function checkForPositiveValidityPeriod() {
	const validityYears = getVal('validity_years')
	console.log(validityYears)

	const validityDays = getVal('validity_days')
	const validityHours = getVal('validity_hours')

	console.log(typeof(validityYears))

//	const onlyNumbers = validityYears => /^\d+$/.test(validityYears);


	if (validityYears < 0 || validityDays < 0 || validityHours < 0) {
		alert("Die Gültigkeitsdauer in Jahren/ Tagen/ Stunden ist negativ.")
		return false
	}

	const hoursOfValiditay = validityYears*365*24 + validityDays*24 + validityHours

	if (hoursOfValiditay <= 0) {
		alert("Der Coupon hat keinen positiven Gültigkeitszeitraum!")
		return false
	}
}

function checkAcceptancePeriod() {
	const acceptancePeriod = getVal('acceptance_period')

	if (acceptancePeriod <= 0 || typeof acceptancePeriod !== 'number') {
		alert("Annahme-Zeitraum ist null oder negativ.")
		return false
	}
}

function checkHexaDecimal(string) {
    const hexaDecimal = /^[0-9A-Fa-f]+$/;
    return hexaDecimal.test(string);
}

function checkKidsCoupon() {
	if (isHiddenID('kids_coupon')) {
		return false
	}

	const kidsCoupon = byID('kids_coupon').checked
	const guarantor = getVal('guarantor')

	if (kidsCoupon == 'false') {return ''}

	if (kidsCoupon == 'true' && guarantor == '') {
		alert("Für den Kinder-Coupon wird ein volljähriger Bürge benötigt.")
		return ''
	}

	const commercialUse = byID('commercial_use').checked

	if (commercialUse == 'true') {
		alert("Der Kinder-Coupon kann NUR privat genutzt werden!")
		return ''
	}
	return kidsCoupon
}

function checkSendCouponDataInput() {
	const receiverEmailAddress = getVal('receiver_email_address')
	const receiverPubKey = getVal('receiver_pub_key')

	if (receiverEmailAddress === '' || receiverPubKey === '') {
		alert("Email-Adresse und/ oder öffentlicher Schlüssel des Empfängers fehlen.")
		return false
	}
	return true
}

function checkComment() {
	const comment = getVal('comment')

	if (comment.length > 1000) {
		alert("Dein Kommentar ist länger als 1.000 Zeichen.")
		return ''
	} else {
		return comment
	}
}

function getCouponName() {
	const standard = getVal('standard')
	console.log('standard')
	if (standard == '') {
		getVal('name_of_coupon')

	}
}

function ExtraPropertiesToggle() {
	let showExtraProperties = byID('extra_properties').hidden
	console.log('hier')

	if (showExtraProperties == true) {
		showID('extra_properties')
	} else {
		hideID('extra_properties')
	}
}

function ShowAddRessourcesInputs() {
	showID('add_ressources')
	showID('no_extra_ressources_input')
	hideID('extra_ressources_input')
}

function HideAddRessourcesInputs() {
	hideID('add_ressources')
	hideID('no_extra_ressources_input')
	showID('extra_ressources_input')
}	

function hideID(id) {
	document.getElementById(id).hidden = true
}

function showID(id) {
	document.getElementById(id).hidden = false
}

function checkTalentsAndTimeValue() {
	const minutes = getVal('minutes')
	
	if (Number.isInteger(minutes) == 'false') {
		alert("Bitte gebe die Minuten als positive ganze Zahl an.")
		return false
	}
	
	if (minutes < 0 || minutes >= 60) {
		alert("Bitte gebe für Minuten ganze Zahlen zwischen 0 und 59 ein.")
		return false;
	}
	
	const hours = getVal('hours')
	
	if (Number.isInteger(hours) == 'false') {
		alert("Bitte gebe ganzzahlige Stunden ein.")
		return false;
	}
	
	if (hours < 0 ) {
		alert("Bitte gebe die Stunden als ganze Zahl gleich 0 oder größer ein.")
		return false;
	}
		
	if ( hours + minutes > 0 && getVal('talents') !== '') {
		alert("Bitte biete einige deiner Talente an!")
		return false
	}
}

function checkStartDate() {
	const startDate = getVal('start_date')
	// if startDate aktuell oder Zukunft?
}

function getGender() {
	if (isHiddenID('gender') === 'true') {
		return ''
	} else {
		return getVal('gender')
	}
}

function isHiddenID(id) {
	return document.getElementById(id).hidden
}

function checkRadiusAndGeoLocation() {
	const geoLocation = getVal('geo_location')
	const range = getVal('range')

	if (!geoLocation || !range) {
		alert("Bitte Standort und Reichweite angeben.")
		return false
	}
}

function checkSigningDate() {
	const signingDate = getVal('signing_date')

	if (signingDate === '') {
		alert("Bitte einen Schöpfungstag angeben.")
		return false
	} else {
		return signingDate
	}
}

function getStandard() {
	return getVal('standard')
}

function getHours() {	
	return getVal('hours')
}

function getMinutes() {
	return getVal('minutes')
}

function getOffers() {
	return getVal('talents')  // things or talents you offer
}

function getServiceOfferRange() {
	return getVal('range')
}

function getEuro() {
	return getVal('euro')
}

function getSilver() {
	return getVal('silverOz')
}

function getGeoLocation() {
	return getVal('geo_location')
}

function getNeeds() {
	return getVal('needs')  // things or talents you need
}

function getNickName() {
	return getVal('nickname')
}

function getEmail() {
	return getVal('your_email_address')
}

function getTelegram() {
	return getVal('telegram')
}

function getIMPP() {
	return getVal('impp') // Instant Messenger
}

function getWebsite() {
	return getVal('website')
}

function getWhatsApp() {
	return getVal('whatsapp')
}

function getMatrix() {
	return getVal('matrix')
}

function getOtherMessenger() {
	return getVal('other_messenger') // Telegram, Matrix, Whatsapp, Jabber, Skype, 
}

function getContact() {
	return getVal('contact')
}

function getCommunity() {
	return getVal('community')  // are you part of a community?
}

function getPrivateUse() {
	return getVal('private_use') // yes, no
}

function getCommercialUse() {
	return getVal('commercial_use')  // yes, no
}

function getTitle() {
	return getVal('title')
}

function getBirthName() {
	return getVal('birth_name')  // your name before e.g. marriage.
}

function getDateOfBirth() {
	return getVal('date_of_birth') //  e.g. 01.01.1990
}

function getPlaceOfBirth() {
	return getVal('place_of_birth') //  e.g. 01.01.1990
}

function getStreet() {
	return getVal('street')
}

function getHouseNumber() {
	return getVal('house_number')
}

function getZipCode() {
	return getVal('zip_code')
}

function getResidence() {
	return getVal('residence')  // place of living
}

function getTaxNumber() {
	return getVal('tax_number')
}

function getQuasiAnonym() {
	return getVal('quasi_anonym')
}

function getSplitableCoupon() {
	return getVal('splitable_coupon')
}

function getOnboarding() {
	return getVal('onboarding') // yes, no, auto, manual to the map
}

function getStartDate() {	
	return getVal('start_date')
}

function getStartTime() {
	return getVal('start_time')
}

function getValidtyYears() {
	return getVal('validity_years')
}

function getValidityDays() {
	return getVal('validity_days')
}

function getValidityHours() {
	return getVal('validity_hours')
}

function getAcceptancePeriod() {
	return getVal('acceptance_period')  // the time span with this coupon has to bei redemed.
}

function getNumber() {
	return getVal('number')  // a number or code you can freely choose 
}

function getReceiverEmailAddress() {
	return getVal('receiver_email_address')
}

function getReceiverPubKey() {
	return getVal('receiver_pub_key')
}

function getExpires() {
	return getVal('expires')
}

function getSigningPlace() {
	return getVal('signing_place')  // place of signature
}

function getSigningDate() {
	return getVal('signing_date')
}

function getDecreaseRate() {
	return getVal('decrease_rate')
}

function getRestrictRecipients() {
	return getVal('restrict_recipients')
}

function getRestrictOffers() {
	return getVal('restrict_offers')
}

function getGuarantor() {
	return getVal('guarantor')
}

function getHash() {
	return ''
}

function getTestCoupon() {
	return getVal('test_coupon')
}

function getRelated() {
	return getVal('related')
}

function getRole() {
	return getVal('role')  // administrator, manifestor etc.
}

function getLang() {
	return getVal('language')
}

function getTel() {
	return getVal('phone')
}

function getTimeZone() {
	return getVal('time_zone')
}

function getExpertise() {
	return getVal('expertise')
}

function getHobby() {
	return getVal('hobby') 
}

function getInterests() {
	return getVal('interests')
}

