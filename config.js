
let NODE_HASH="";
let SEQUENCE_NUMBER=1;

function updateHash(hash){
    NODE_HASH = hash;
}
function incrementSequenceNumber(){
    SEQUENCE_NUMBER++;
    return SEQUENCE_NUMBER;
}

module.exports = {NODE_HASH,SEQUENCE_NUMBER, updateHash, incrementSequenceNumber};