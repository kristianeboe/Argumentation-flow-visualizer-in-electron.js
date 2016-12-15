// regexes used to correctly parse the argumentation models
const stringRegex = /^[A-Za-z][A-Za-z0-9_-]*$/;
const identifierRegex = /^[A-Za-z][A-Za-z0-9_]*$/;
const elementRegex =
	/^E\s+[A-Za-z][A-Za-z0-9_]*(\s+[A-Za-z][A-Za-z0-9_]*)?\s+[0-2](\s+[0-9]+)?(\s+[0-9]+\s+[0-9]+\s+[0-9]+\s+[0-9]+)?$/;
const relationRegex =
	/^R\s+[A-Za-z][A-Za-z0-9_]*(\s+[A-Za-z][A-Za-z0-9_]*)?(\s+[A-Za-z][A-Za-z0-9_]*->[A-Za-z][A-Za-z0-9_]*)*(\s+[0-9]+)?(\s+[0-9]+\s+[0-9]+\s+[0-9]+\s+[0-9]+)?$/;
const commentBeginRegex = /^\(\*/;
const commentEndRegex = /\*\)$/;

const sepRegex = /\s+/;
const leafNodeFlagRegex = /^[0-2]$/;
const relationRuleRegex = /^[A-Za-z][A-Za-z0-9_]*->[A-Za-z][A-Za-z0-9_]*$/;

function parseArgumentationModel(fileName, elements, relations) {
	var array = require('fs').readFileSync(fileName).toString().split("\n");
	var argModelName = array[0].trim();
	elements.argModelName = argModelName;
	//get name from first line of the argumentation model
	if (!stringRegex.test(array[0].trim())) {
		return false;
	}

	//set up data structures that are to be returned
	//var elements = {};
	elements['Types'] = [];
	//var relations = {};
	relations['Types'] = [];

	//iterating throuhg the lines, checking correct format and parsing information
	for (i = 1; i < array.length; i++) {
		array[i] = array[i].trim();
		if (array[i] === '') {
			continue;
		} else if (elementRegex.test(array[i])) {
			defineElementType(argModelName, array[i], elements);

		} else if (relationRegex.test(array[i])) {
			defineRelationType(argModelName, array[i], relations);
		} else if (commentBeginRegex.test(array[i])) {
			while (!commentEndRegex.test(array[i])) { // disable the parsing until end of comment is reached
				i++;
				if (i == array.length)
					return false;
			}
		} else {
			return false;
		}
	}
	// check that every relation rule consists of legal (defined) elments
	for (i = 0; i < relations['Types'].length; i++) {
		var dummy = relations[relations['Types'][i]];
		for (j = 0; j < dummy['rules'].length; j++) {
			if (elements['Types'].indexOf(dummy['rules'][j][0]) == -1 || elements[
					'Types'].indexOf(dummy['rules'][j][1]) == -1) {
				return false;
			}
		}
	}
	return true;
}

function defineElementType(argModelName, element, elements) { //TODO: Handling of correctness
	var elementArray = element.split(sepRegex); //splitting into different parts

	//initializing different variables to be used in the prototype
	var elementName = elementArray[1];
	var elementAbbr = null;
	var canBeLeafNode = -1;
	var elementColor = null;
	var elementReprShape = null;
	var elementReprLineThickness = null;
	var elementReprLineType = null;
	var elementReprShapeColor = null;

	var dataOffset = 2;
	if (!leafNodeFlagRegex.test(elementArray[2])) { //checking whether an abbribation is defined
		elementAbbr = elementArray[2];
		dataOffset = 3;
	}

	//canbeleaf flag and representation data section
	canBeLeafNode = parseInt(elementArray[dataOffset]);
	dataLength = elementArray.length - dataOffset;
	if (dataLength > 1) {
		var representationOffset = dataOffset + 1;
		if (dataLength == 2 || dataLength == 6) { //color is defined
			elementColor = parseInt(elementArray[representationOffset]); //TODO: Handling of illegal color values and define legal
			representationOffset++; //adding to offset
		}
		if (dataLength > 2) { //other representation settings defined
			elementReprShape = parseInt(elementArray[representationOffset]); //TODO: Handling of illegal values and define legal
			elementReprLineThickness = parseInt(elementArray[representationOffset + 1]); //TODO: Same
			elementReprLineType = parseInt(elementArray[representationOffset + 2]); //TODO: Same
			elementReprShapeColor = parseInt(elementArray[representationOffset + 3]); //TODO: Same
		}
	}
	//creating a prototype and adding it to the object containing element prototypes
	elements[elementName] = createElement(argModelName, elementName,
		elementAbbr, canBeLeafNode, elementColor, elementReprShape,
		elementReprLineThickness, elementReprLineType, elementReprShapeColor);
	elements['Types'].push(elementName);
}

function defineRelationType(argModelName, relation, relations) { //TODO: Handling of correctness
	var relationArray = relation.split(sepRegex); // splitting into different parts
	var arrayLength = relationArray.length;

	//innitializing different varibales to be used in the prototype
	var relationName = relationArray[1];
	var relationAbbr = null;
	var relationRules = [];
	var relationColor = null;
	var relationReprShape = null;
	var relationReprLineThickness = null;
	var relationReprLineType = null;
	var relationReprShapeColor = null;


	var relationOffset = 2;
	if (arrayLength > 2) {
		if (identifierRegex.test(relationArray[2])) { // checking if an abbrivation is defined
			relationAbbr = relationArray[2];
			relationOffset = 3;
		}
		//adding the rules defined
		while (relationOffset < arrayLength && relationRuleRegex.test(relationArray[
				relationOffset])) {
			relationRules.push(relationArray[relationOffset].split(/->/));
			relationOffset++;
		}

		var representationLength = arrayLength - relationOffset;
		var representationOffset = relationOffset;
		if (representationLength == 1 || representationLength == 5) { //check if color is defined
			relationColor = parseInt(relationArray[representationOffset]); //TODO: Handling of illegal color values and define legal
			representationOffset += 1;
		}
		//other representation data defined
		if (representationLength > 1) {
			relationReprShape = parseInt(relationArray[representationOffset]); //TODO: Handling of illegal values and define legal
			relationReprLineThickness = parseInt(relationArray[representationOffset + 1]); //TODO: Same
			relationReprLineType = parseInt(relationArray[representationOffset + 2]); //TODO: Same
			relationReprShapeColor = parseInt(relationArray[representationOffset + 3]); //TODO: Same
		}
	}
	//adding relation to relation prototypes
	relations[relationName] = createRelation(argModelName, relationName,
		relationAbbr, relationRules, relationColor, relationReprShape,
		relationReprLineThickness, relationReprLineType, relationReprShapeColor);
	relations['Types'].push(relationName);
}

function createElement(argModelName, elementName, elementAbbr,
	canBeLeafNode, elementColor, elementReprShape, elementReprLineThickness,
	elementReprLineType, elementReprShapeColor) {
	element = {}
	element['argModelName'] = argModelName;
	element['name'] = elementName;
	element['type'] = 'element';
	element['abbr'] = elementAbbr;
	element['canBeLeafNode'] = canBeLeafNode;
	element['color'] = elementColor;
	element['representationShape'] = elementReprShape;
	element['representationLineThickness'] = elementReprLineThickness;
	element['representationLineType'] = elementReprLineType;
	element['representationShapeColor'] = elementReprShapeColor;
	return element
}

function createRelation(argModelName, relationName, relationAbbr,
	relationRules, relationColor, relationReprShape, relationReprLineThickness,
	relationReprLineType, relationReprShapeColor) {
	relation =  {}
	relation['argModelName'] = argModelName;
	relation['name'] = relationName;
	relation['type'] = 'relation';
	relation['abbr'] = relationAbbr;
	relation['rules'] = relationRules;
	relation['color'] = relationColor;
	relation['representationShape'] = relationReprShape;
	relation['representationLineThickness'] = relationReprLineThickness;
	relation['representationLineType'] = relationReprLineType;
	relation['representationShapeColor'] = relationReprShapeColor;
	return relation
}

module.exports.parseArgumentationModel = parseArgumentationModel; //allows parseArgumentModel to be called from other files
