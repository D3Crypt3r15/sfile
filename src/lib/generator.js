// FROM https://github.com/forfuturellc/node-sequential-ids/blob/master/Generator.js

function incrementNumber(num, _max) {
    return num === _max ? null : ++num;
}
  
function fillZeros(num, numDigits) {
    var number = num.toString();
    numDigits = numDigits - number.length;
    
    while(numDigits > 0) {
        number = "0" + number;
        numDigits--;
    }
    return number;
}
  
function generateId(current, length) {
    const maxNumber=8**length;
    var nextNumber = incrementNumber(current, maxNumber);
    var id = fillZeros(nextNumber, length);
    return {id: id, nextNumber: nextNumber};
}

module.exports={
    generateId: generateId
}