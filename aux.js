"use strict";

function HexToUI8(hex) {
	if (hex === undefined) { // undefined is different from 0 since 0 == "AA"
		return new Uint8Array();
	}

	if ((hex.length % 2) !== 0) {
		throw new RangeError('HexToUI8: Hex is not even.')
	}

	var a = new Uint8Array(hex.length / 2)
	for (var i = 0; i < hex.length; i += 2) {
		a[i / 2] = parseInt(hex.substring(i, i + 2), 16)
	}

	return a;
};

function isValidHex32(stringToValidate) {
    //if (typeOf(stringToValidate) != base64 ) || length(stringToValidate) != 32 return;


	if (stringToValidate === undefined) { // undefined is different from 0 since 0 == "AA"
		console.log('isValidHex32: kein valider Hex32-String')
        return;
	}

	if ((hex.length % 2) !== 0) {
		throw new RangeError('isValidHex32: Hex is not even.')
	}

	var a = new Uint8Array(stringToValidate.length / 2)
	for (var i = 0; i < stringToValidate.length; i += 2) {
		a[i / 2] = parseInt(stringToValidate.substring(i, i + 2), 16)
	}
	return a;
};

async function saveToPDFfile() {

}

async function saveTextToFile(fileContent, fileName) {
	const blob = new Blob([fileContent], { type: 'text/plain' });
  	await saveFile(blob, fileName);
};

const saveFile = async (blob, suggestedName) => {
	// Feature detection. The API needs to be supported
	// and the app not run in an iframe.
	const supportsFileSystemAccess =
	  'showSaveFilePicker' in window &&
	  (() => {
		try {
		  return window.self === window.top;
		} catch {
		  return false;
		}
	  })();
	// If the File System Access API is supported…
	if (supportsFileSystemAccess) {
	  try {
		// Show the file save dialog.
		const handle = await showSaveFilePicker({
		  suggestedName,
		});
		// Write the blob to the file.
		const writable = await handle.createWritable();
		await writable.write(blob);
		await writable.close();
		return;
	  } catch (err) {
		// Fail silently if the user has simply canceled the dialog.
		if (err.name !== 'AbortError') {
		  console.error(err.name, err.message);
		  return;
		}
	  }
	}
	// Fallback if the File System Access API is not supported…
	// Create the blob URL.
	const blobURL = URL.createObjectURL(blob);
	// Create the `` element and append it invisibly.
	const a = document.createElement('a');
	a.href = blobURL;
	a.download = suggestedName;
	a.style.display = 'none';
	document.body.append(a);
	// Click the element.
	a.click();
	// Revoke the blob URL and remove the element.
	setTimeout(() => {
	  URL.revokeObjectURL(blobURL);
	  a.remove();
	}, 1000);
  };

  /**
ArrayBufferToHex accepts an array buffer and returns a string of hex.
Taken from https://stackoverflow.com/a/50767210/1923095
@param   {ArrayBuffer} buffer     Buffer that is being converted to UTF8
@returns {string}                 String with hex.
 */
async function ArrayBufferToHex(buffer) {
	return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join('').toUpperCase();
};

function copyTextToClipboard(textToCopy) {
	navigator.clipboard.writeText(textToCopy);
	// Alert the copied text
	alert("Copied the text: " + textToCopy);
  }
