// CPO-IDE
// Adds *some* (and only some) interesting IDE features to code.pyret.org

// Global variables
// --------------------------------------------------------------------------------------------------------------------
// Globals (Including Regular Expressions we want to use)
let camelCaseRegExp = /[a-z]+([A-Z][a-z])+/;
let snakeCaseRegExp = /[a-z]+(_[a-z])+/;
let smallVarRegExp = /[a-z]/;
var functionDict = {};

// The DOM node to observe
/** Code target (all the code from the CodeMirror div) */
const codeTarget = document.getElementsByClassName("CodeMirror-code")[0];
/** Variables */
const variables = document.getElementsByClassName("cm-variable");
/** Functions */
const functions = document.getElementsByClassName("cm-function-name");

// Preprocessing
// --------------------------------------------------------------------------------------------------------------------
/** Gets all code from code DOM. */
function getAllCode(target) {
    return codeTarget.childNodes;
}

/** Converts each line into string and list of syntax objects. */
function processCodeLines(lines) {
    var processedLines = [];
    for (let i = 0; i < lines.length; i++) {
        processedLines.push([lines[i].childNodes[1].textContent, lines[i].childNodes[1].childNodes[0].childNodes])
    }
    return processedLines
}

/** Reads lines, and does anything that requires context (that is, reading from lines below, such as function doc) */
function readLines(lines) {
    for (let i = 0; i < lines.length; i++) {
        lineText = lines[i][0];
        lineContent = lines[i][1];
        runForEachLine(lineText, lineContent);
        // We have to do this here (for now) since we need context search downwards for docstrings. 
        if (lineContains(lineContent, "cm-keyword", "fun")) {
            processFoundFunction(lines, i);
        }
    }
}

/** When we find a function header in a certain line number, we do stuff with it...
 *  - Note the docstring to our dictionary
 *  - Note the function definition to our dictionary
 *  - Check for function typing
 */
function processFoundFunction(lines, lineNumber) {
    console.log("Found function on line " + lineNumber);
    lineText = lines[lineNumber][0];
    lineContent = lines[lineNumber][1];
    var functionName;
    var functionElement;
    for (let lineContentIdx = 0; lineContentIdx < lineContent.length; lineContentIdx++) {
        if (lineContent[lineContentIdx].classList 
            && (lineContent[lineContentIdx].classList.contains("cm-function-name") || lineContent[lineContentIdx].classList.contains("cm-variable"))) {
            functionName = lineContent[lineContentIdx].childNodes[0].textContent;
            console.log("Found function " + functionName)
            functionElement = lineContent[lineContentIdx];
            break;
        }
    }
    if (functionName) {
        // Looking for documentation
        docString = "";
        inc = 1;
        while (lineNumber + inc < lines.length) {
            lineContent = lines[lineNumber + inc][1];
            if (lineContains(lineContent, "cm-keyword", "end")) {
                break;
            }
            if (lineContains(lineContent, "cm-keyword", "doc")) {
                removeAllChildNodes(functionElement);
                docString = lines[lineNumber + inc][0];
                break;
            }
            inc++;
        }
        if (docString) {
            console.log("Found docstring for " + functionName);
            functionDict[functionName] = {
                "docString": docString.trim().substring(4),
                "funDef": lineText.trim().substring(4),
                "lineNumber": lineNumber
            };
        } else {
            attachTooltipWithHeader(functionElement, "poor-documentation", "Missing docstring.", true);
        }
    }
}

/** Checks if a line contains a 'word' of targetClass equal to targetText */
function lineContains(lineContent, targetClass, targetText) {
    for (let lineContentIdx = 0; lineContentIdx < lineContent.length; lineContentIdx++) {
        if (lineContent[lineContentIdx].classList 
            && lineContent[lineContentIdx].classList.contains(targetClass) 
            && lineContent[lineContentIdx].textContent == targetText) {
            return lineContent[lineContentIdx];
        }
    }
    return null;
}

/** Checks if a line contains a targetClass equal to targetText */
function lineContainsClass(lineContent, targetClass) {
    for (let lineContentIdx = 0; lineContentIdx < lineContent.length; lineContentIdx++) {
        if (lineContent[lineContentIdx].classList 
            && lineContent[lineContentIdx].classList.contains(targetClass)) {
            return lineContent[lineContentIdx];
        }
    }
    return null;
}


// Tooltip Helpers
// --------------------------------------------------------------------------------------------------------------------
/** Marks target as an error, reds and underlines */
function markErrorCode(target) {
    target.classList.add("code-error");
}

/** Removes all child nodes. Allows us to wipe tooltips */
function removeAllChildNodes(parent) {
    parent.classList.remove("code-error");
    parent.classList.remove("tooltippable");
    while (parent.childNodes[1]) {
        parent.removeChild(parent.childNodes[1]);
    }
}

/** Removes all tooltips for next iteration... */
function removeAllTooltips(elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("tooltippable");
        removeAllChildNodes(elements[i]);
    }
}

/** Attaches a tooltip containing text to target */
function attachTooltip(target, text) {
    removeAllChildNodes(target);
    var tooltipSpan = document.createElement('span');
    tooltipSpan.innerHTML = text;
    tooltipSpan.classList.add("tooltip");
    target.classList.add("tooltippable");
    target.appendChild(tooltipSpan);
}

/** Attaches a tooltip with a header, usually an error message or the like */
function attachTooltipWithHeader(target, header, text, isError) {
    attachTooltip(target, "<b>" + header + "</b>: " + text);
    if (isError) {
        markErrorCode(target);
    }
}

// Event loops
// --------------------------------------------------------------------------------------------------------------------
/** Event loop that will run on each line */
function runForEachLine(lineText, lineContent) {
    checkUntypedList(lineText, lineContent);
    checkUnnamedCheckBlocks(lineText, lineContent);
}

/** Checks for lists that are untyped. Any 'List' type without left angle bracket after. */
function checkUntypedList(lineText, lineContent) {
    for (let i = 0; i < lineContent.length; i++) {
        if (lineContent[i].classList && lineContent[i].classList.contains("cm-type") && lineContent[i].textContent == "List") {
            if (i + 1 > lineContent.length || lineContent[i + 1].textContent != "<") {
                attachTooltipWithHeader(lineContent[i], "type-any", "List type must be annotated.", true);
            }
        }
    }
}

function checkUnnamedCheckBlocks(lineText, lineContent) {
    potentialCheckBlock = lineContains(lineContent, "cm-keyword", "check");
    if (potentialCheckBlock && !lineContainsClass(lineContent, "cm-string")) {
        attachTooltipWithHeader(potentialCheckBlock, "no-checkstring", "Check blocks should have checkstrings.", true);
    }
}

/** Event loop that will run on each variable */
function runOnVariables(targets) {
    for (let i = 0; i < targets.length; i++) {
        runForEachVariable(targets[i]);
    }
}

/** Checks for poor naming in variables */
function runForEachVariable(target) {
    let variableText = target.textContent;
    if (variableText.length < 2 && smallVarRegExp.test(variableText)) {
        attachTooltipWithHeader(target, "poor-names", "Too short.", true);
    } else if (camelCaseRegExp.test(variableText)) {
        attachTooltipWithHeader(target, "poor-names", "Variables uses camelCase.", true);
    } else if (snakeCaseRegExp.test(variableText)) {
        attachTooltipWithHeader(target, "poor-names", "Variable uses snake_case.", true);
    } else if (variableText == "Any") {
        attachTooltipWithHeader(target, "type-any", "Avoid using Any.", true);
    }
}

/** Event loop that will run on each function keyword */
function runOnFunctions(targets) {
    for (let i = 0; i < targets.length; i++) {
        runForEachFunction(targets[i]);
    }
}

/** Run for each function, does name check and attaches function def if found */
function runForEachFunction(target, functionMap) {
    let functionText = target.textContent;
    if (functionText.length < 2) {
        attachTooltipWithHeader(target, "poor-names", "Too short.", true);
    } else if (camelCaseRegExp.test(functionText)) {
        attachTooltipWithHeader(target, "poor-names", "Function uses camelCase.", true);
    } else if (snakeCaseRegExp.test(functionText)) {
        attachTooltipWithHeader(target, "poor-names", "Function uses snake_case.", true);
    } else {
        if (functionDict[functionText]) {
            attachTooltip(target, functionDict[functionText]['funDef'] + "\n <i>" + functionDict[functionText]['docString'] + "</i>");
        }
    }
}

/** Event loop that is to run every time code DOM is updated */
function runOnEdit() {
    removeAllTooltips(variables);
    removeAllTooltips(functions);
    let abstractCodeLines = getAllCode(codeTarget);
    let processedLines = processCodeLines(abstractCodeLines);
    readLines(processedLines);
    console.log(functionDict);
    runOnVariables(variables);
    runOnFunctions(functions);
}

// Other helpers
// --------------------------------------------------------------------------------------------------------------------
// Callback function when changes occurs
function callback(mutationRecord, observer) {
    runOnEdit();
}

// Create a new instance of MutationObserver with callback in params
const observer = new MutationObserver(callback);

// Setup config
const config = {
    attributes: true,
    childList: true,
    subTree: true
};

// When everything is ready, we just observe our target
observer.observe(codeTarget, config);

console.log("CPO-IDE v0.01")
