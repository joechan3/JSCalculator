/*global $, console, BigNumber*/
/*jslint vars: true */

/******************************************************************************************************
GENERAL NOTES
* Subtraction is handled by multiplying the second number by -1 then adding, i.e. x - y is x + (-y).

* Division is handled by converting the second number y to 1/y, i.e. x / y is x * (1/y).

* bignumber.js is used for arbitrary-precision arithmetic and solves the floating-point arithmetic
problem (e.g. 0.1 + 0.2 = 0.30000000000000004).

* User input is stored in the array `expressionChain` and then is evaluated when the `=` button is pressed.

* Chaining operations from the last solution (after pressing `=`) is possible.

* `-` button functions as subtraction or negation depending on conditions.

* Unnecessary zero inputs like 002 are prevented or automatically deleted (e.g. 02 becomes 2).

* Nonsensical decimal inputs like 0.0.2 or ...2 are prevented.

* Repeating an operator is prevented (e.g. 5++5).

* Pressing `=` after entering one number returns that number.

* Calculator resets if user immediately enters a number after last calculation

* Calculator repeats last operation when requested by user by pressing `=` (e.g. 1+2=3, =5, =7, =9)
******************************************************************************************************/

(function joesCalculator() {
    "use strict";

    var answer = 0; //Holds the final total.
    var btns = { //DOM references to calculator buttons.
        keyClear: "button:eq(1)",
        key7: "button:eq(2)",
        key8: "button:eq(3)",
        key9: "button:eq(4)",
        keyDiv: "button:eq(5)",
        key4: "button:eq(6)",
        key5: "button:eq(7)",
        key6: "button:eq(8)",
        keyTimes: "button:eq(9)",
        key1: "button:eq(10)",
        key2: "button:eq(11)",
        key3: "button:eq(12)",
        keyMinus: "button:eq(13)",
        keyDecimal: "button:eq(14)",
        key0: "button:eq(15)",
        keyEquals: "button:eq(16)",
        keyPlus: "button:eq(17)",
        keyNumber: ".key-number",
        keyNumberNotZero: ".key-number:not(.key-zero)"
    };
    var display = ""; //Holds what is to be displayed to the user.
    var expressionChain = []; //Holds the current chain of numbers and operations inputted by the user.
    var lastAnswer = null; //Holds the value of the previous calculation's final solution (when "=" was pressed).
    var lastOperator;
    var lastOperand;
    var strNumber = ""; //Temporary holder for numbers (as strings) inputted by the user.
    var negationUsed = false;
    var unnecessaryZero = false;

    function updateDisplay(btn) {
        var toConcat = ""; //String to concatenate with display.
        BigNumber.config({ DECIMAL_PLACES: 10 });

        switch (btn) {
        case 0:
            toConcat = "0";
            break;
        case 1:
            toConcat = "1";
            break;
        case 2:
            toConcat = "2";
            break;
        case 3:
            toConcat = "3";
            break;
        case 4:
            toConcat = "4";
            break;
        case 5:
            toConcat = "5";
            break;
        case 6:
            toConcat = "6";
            break;
        case 7:
            toConcat = "7";
            break;
        case 8:
            toConcat = "8";
            break;
        case 9:
            toConcat = "9";
            break;
        case 10: //Clear button
            toConcat = "";
            display = "&nbsp;";
            break;
        case 11: //Division button
            toConcat = "&divide;";
            break;
        case 11.1: //Division button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = lastAnswer.toDigits(14).toString() + "&divide;";
            break;
        case 12: //Times button
            toConcat = "&times;";
            break;
        case 12.1: //Times button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = lastAnswer.toDigits(14).toString() + "&times;";
            break;
        case 13: //Minus button
            toConcat = "-";
            break;
        case 13.1: //Minus button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = lastAnswer.toDigits(14).toString() + "&minus;";
            break;
        case 13.2: //Negative button
            toConcat = "-";
            break;
        case 14: //Sum button
            toConcat = "&plus;";
            break;
        case 14.1: //Sum button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = lastAnswer.toDigits(14).toString() + "&plus;";
            break;
        case 15: //Decimal button
            toConcat = ".";
            break;
        case 16: //Equals button
            toConcat = "";
            display = answer.toDigits(14).toString();
            break;
        default:
            throw "Invalid input";
        }

        display += toConcat;
        $(".calc-display p").html(display);
    }

    //Triggered by operator type buttons.
    function updateExpressionChain(str) {
        var indexOfLastOperator;

        if (str === "negation") {
            indexOfLastOperator = expressionChain.length - 1;
            if (expressionChain[indexOfLastOperator] === "divide") {
                expressionChain.pop();
                expressionChain.push("times", -1, "divide");
            } else {
                expressionChain.push(-1, "times");
            }
        } else if (str === "clear") {
            expressionChain = [];
            lastAnswer = null;
            negationUsed = false;
        } else {
            expressionChain.push(parseFloat(strNumber, 10));
            expressionChain.push(str);
            strNumber = "";
            negationUsed = false;
        }
    }

    function transformOperators() {
        var numerator = new BigNumber(1);
        var denominator;

        expressionChain.forEach(function transform(element, index) {
            //x - y also means x + (-y)
            if (expressionChain[index] === "minus") {
                expressionChain[index] = "add";
                expressionChain[index + 1] *= -1;
            }

            //x / y also means x * (1/y)
            if (expressionChain[index] === "divide") {
                expressionChain[index] = "times";
                denominator = new BigNumber(expressionChain[index + 1]);
                expressionChain[index + 1] = numerator.dividedBy(denominator);
            }
        });
    }
    
    //Example of unnecessary zero is 02.
    function checkUnnecessaryZero() {
        if (strNumber !== ""
                && (strNumber[0] === "0" && strNumber[1] !== ".")) {
            unnecessaryZero = true;
        }
    }
        
    function removeUnnecessaryZero() {
        var zeroIndex = display.lastIndexOf("0");
        
        if (zeroIndex === 0) {
            display = display.substring(1);
        } else {
            display = display.substring(0, zeroIndex) + display.substring(zeroIndex + 1);
        }
        
        strNumber = strNumber.substring(1);
        unnecessaryZero = false;
    }

    //Reminder: transformOperators converts "minus" to "add" and "divide" to "times".
    //Arithmetic expressions can be boiled down to simple addition. This function exploits that fact.
    //E.g. 1 + 2 * 3 - 4 / 5 is 1 + 2 + 2 + 2 + (-1/5) + (-1/5) + (-1/5) + (-1/5)
    function findAnswer() {
        var i; //used for walking the expressionChain array
        var j; //used for walking a batch of numbers (in the expression chain array) that are multiplying each other
        var k; //used for walking the product array
        var l; //used for walking the sumChainTotal and productChainTotal arrays
        var temp; //used to hold the running product when multiplying the numbers in the product array
        var firstOperand = expressionChain[0];
        var firstOperator;
        var secondOperand;
        var secondOperator;
        var sumChain = []; //Holds the sums of batches of added/subtracted numbers in the expression chain
        var sumChainTotal = new BigNumber(0); //Will hold the ultimate sum of the items in sumChain
        var productChain = []; //Holds the products of batches of multiplied/divided numbers in the expression chain
        var productChainTotal = new BigNumber(0); //Will hold the ultimate sum of the items in productChain
        var isSimplestCase = expressionChain.length === 4; //e.g. [1, "add", 1, "solve!"];
        var product = []; //Temporarily holds the product of a batch of multiplied/divided numbers in the expression chain
        var isGeneralCase1; //defined in main for loop below
        var isGeneralCase2; //defined in main for loop below
        var isGeneralCase3; //defined in main for loop below
        var isGeneralCase4; //defined in main for loop below

        //For cases where user enters a number then presses `=` button, e.g. [5, "solve!"]
        if (expressionChain.length === 2
                && !isNaN(expressionChain[0])) {
            sumChain.push(firstOperand);
            productChain = [0];
        } else if (expressionChain.length === 0 && lastAnswer !== null) {
            sumChain.push(lastAnswer);
            productChain = [0];
        }

        for (i = 1; (i + 2) <= expressionChain.length - 1; i += 2) {
            secondOperand = expressionChain[i + 1];
            firstOperator = expressionChain[i];
            secondOperator = expressionChain[i + 2];
            //Remember [ x - y equals x + (-y) ] and [ x / y equals x * (1/y) ]
            isGeneralCase1 = firstOperator === "add"
                    && (secondOperator === "add" || secondOperator === "solve!")
                    && !isSimplestCase;
            isGeneralCase2 = firstOperator === "add"
                    && (secondOperator === "times" || secondOperator === "solve!")
                    && !isSimplestCase;
            isGeneralCase3 = firstOperator === "times"
                    && (secondOperator === "add" || secondOperator === "solve!")
                    && !isSimplestCase;
            isGeneralCase4 = firstOperator === "times"
                    && (secondOperator === "times" || secondOperator === "solve!")
                    && !isSimplestCase;

            //Simplest case
            if (isSimplestCase) {
                if (firstOperator === "add") {
                    sumChain.push(firstOperand, secondOperand);
                    productChain = [0];
                } else {
                    sumChain = [0];
                    firstOperand = new BigNumber(firstOperand);
                    secondOperand = new BigNumber(secondOperand);
                    productChain = [firstOperand.times(secondOperand)];
                }
            }

            //General cases
            if (isGeneralCase1) {
                if (i === 1) {
                    sumChain.push(firstOperand, secondOperand);
                } else {
                    sumChain.push(secondOperand);
                }
            } else if (isGeneralCase2) {
                if (i === 1) {
                    sumChain.push(firstOperand);
                }

                //Handle a series of multiplications if needed
                for (j = i + 2; expressionChain[j] === "times"; j += 2) {
                    if (j === i + 2) {
                        product.push(expressionChain[j - 1], expressionChain[j + 1]);
                    } else {
                        product.push(expressionChain[j + 1]);
                    }
                }

                i = j - 2;

                temp = new BigNumber(1);
                for (k = 0; k < product.length; k += 1) {
                    temp = temp.times(product[k]);
                }

                product = temp;
                productChain.push(product);
                product = [];

            } else if (isGeneralCase3) {
                if (i === 1) {
                    product.push(firstOperand, secondOperand);
                }

                //Handle a series of multiplications if needed
                for (j = i + 2; expressionChain[j] === "times"; j += 2) {
                    if (j === i + 2) {
                        product.push(expressionChain[j - 1], expressionChain[j + 1]);
                    } else {
                        product.push(expressionChain[j + 1]);
                    }
                }

                i = j - 2;

                temp = new BigNumber(1);
                for (k = 0; k < product.length; k += 1) {
                    temp = temp.times(product[k]);
                }

                product = temp;
                productChain.push(product);
                product = [];

            } else if (isGeneralCase4) {
                if (i === 1) {
                    product.push(firstOperand, secondOperand);
                }

                //Handle a series of multiplications if needed
                for (j = i + 2; expressionChain[j] === "times"; j += 2) {
                    product.push(expressionChain[j + 1]);
                }

                i = j - 2;

                temp = new BigNumber(1);
                for (k = 0; k < product.length; k += 1) {
                    temp = temp.times(product[k]);
                }

                product = temp;
                productChain.push(product);
                product = [];

            }
        }

        for (l = 0; l < sumChain.length; l += 1) {
            sumChainTotal = sumChainTotal.plus(sumChain[l]);
        }

        for (l = 0; l < productChain.length; l += 1) {
            productChainTotal = productChainTotal.plus(productChain[l]);
        }

        answer = sumChainTotal.plus(productChainTotal);
    }

    $(document).ready(function buttonsHandler() {
        
        $(btns.keyNumber).on("click", function keyNumberHandler() {
            //Reset calculator if user immediately enters a number after last calculation
            if (lastAnswer !== null && expressionChain.length === 0) {
                lastAnswer = null;
            }
        });
        
        $(btns.keyNumberNotZero).on("click", function keyNumberNotZeroHandler() {
            checkUnnecessaryZero();
            if (unnecessaryZero) {
                removeUnnecessaryZero();
            }
        });
        
        $(btns.key0).on("click", function key0Handler() {
            var zeroAllowed = false;
            
            if (strNumber === ""
                    || (strNumber !== "" && strNumber[0] !== "0")
                    || (strNumber !== "" && (strNumber[0] === "0" && strNumber[1] === "."))) {
                zeroAllowed = true;
            }
            
            if (zeroAllowed) {
                updateDisplay(0);
                strNumber += "0";
            }
            
        });

        $(btns.key1).on("click", function key1Handler() {
            updateDisplay(1);
            strNumber += "1";
        });

        $(btns.key2).on("click", function key2Handler() {
            updateDisplay(2);
            strNumber += "2";
        });

        $(btns.key3).on("click", function key3Handler() {
            updateDisplay(3);
            strNumber += "3";
        });

        $(btns.key4).on("click", function key4Handler() {
            updateDisplay(4);
            strNumber += "4";
        });

        $(btns.key5).on("click", function key5Handler() {
            updateDisplay(5);
            strNumber += "5";
        });

        $(btns.key6).on("click", function key6Handler() {
            updateDisplay(6);
            strNumber += "6";
        });

        $(btns.key7).on("click", function key7Handler() {
            updateDisplay(7);
            strNumber += "7";
        });

        $(btns.key8).on("click", function key8Handler() {
            updateDisplay(8);
            strNumber += "8";
        });

        $(btns.key9).on("click", function key9Handler() {
            updateDisplay(9);
            strNumber += "9";
        });

        $(btns.keyClear).on("click", function keyClearHandler() {
            updateDisplay(10);
            updateExpressionChain("clear");
            lastAnswer = null;
        });

        $(btns.keyDiv).on("click", function keyDivHandler() {
            //Used to chain from last solution.
            var chainingPossible = expressionChain.length === 0 && lastAnswer !== null;

            //Used to prevent divide operator from being applied twice or without an operand.
            var operatorAllowed = strNumber !== "";

            if (chainingPossible) {
                updateDisplay(11.1);
                expressionChain[0] = lastAnswer;
                expressionChain[1] = "divide";
            } else if (operatorAllowed) {
                updateDisplay(11);
                updateExpressionChain("divide");
            }
        });

        $(btns.keyTimes).on("click", function keyTimesHandler() {
            //Used to chain from last solution.
            var chainingPossible = expressionChain.length === 0 && lastAnswer !== null;

            //Used to prevent times operator from being applied twice or without operand.
            var operatorAllowed = strNumber !== "";

            if (chainingPossible) {
                updateDisplay(12.1);
                expressionChain[0] = lastAnswer;
                expressionChain[1] = "times";
            } else if (operatorAllowed) {
                updateDisplay(12);
                updateExpressionChain("times");
            }
        });

        //Minus button functions as subtraction or negation.
        $(btns.keyMinus).on("click", function keyMinusHandler() {
            var isNegation; //true if minus button turns a number negative
            var isSubtraction; //true if minus button functions as subtraction
            var lastItem = expressionChain[expressionChain.length - 1];
            var lastItemStr = strNumber[strNumber.length - 1];
            var operatorAllowed; //true if subtraction or negation is allowed
            var secondLastItem = expressionChain[expressionChain.length - 2];
            var secondLastItemStr = strNumber[strNumber.length - 2];
            var chainingPossible = expressionChain.length === 0
                    && lastAnswer !== null; //Used to chain from last solution.

            //First OR operand: For negation
            //Second OR operand: For negation following an operator
            //Third OR operand: To prevent too many `-` operators
            //Fourth OR operand: For subtraction
            if ((expressionChain.length === 0 && strNumber === "")
                    || (isNaN(lastItem) && !isNaN(secondLastItem))
                    || (!isNaN(lastItemStr) || !isNaN(secondLastItemStr))
                    || (strNumber !== "")) {
                operatorAllowed = true;
            } else {
                operatorAllowed = false;
            }

            isNegation = strNumber === "";

            if (!isNegation) {
                isSubtraction = true;
            }

            if (chainingPossible) {
                updateDisplay(13.1);
                expressionChain[0] = lastAnswer;
                expressionChain[1] = "minus";
            } else if (operatorAllowed && isSubtraction) {
                updateDisplay(13);
                updateExpressionChain("minus");
            } else if (operatorAllowed && isNegation && !negationUsed) {
                negationUsed = true;
                updateDisplay(13.2);
                updateExpressionChain("negation");
            }
        });

        $(btns.keyPlus).on("click", function keyPlusHandler() {
            //Used to chain from last solution.
            var chainingPossible = expressionChain.length === 0 && lastAnswer !== null;

            //Used to prevent plus operator from being applied twice or without operand.
            var operatorAllowed = strNumber !== "";

            if (chainingPossible) {
                updateDisplay(14.1);
                expressionChain[0] = lastAnswer;
                expressionChain[1] = "add";
            } else if (operatorAllowed) {
                updateDisplay(14);
                updateExpressionChain("add");
            }
        });

        $(btns.keyDecimal).on("click", function keyDecimalHandler() {
            //debugger;
            var decimalAllowed = false;
            
            //Prevent multiple uses of decimal at a time
            if (strNumber.indexOf('.') === -1) {
                decimalAllowed = true;
            }

            //Insert a '0' if decimal is the first user input
            if (strNumber === "" && decimalAllowed) {
                updateDisplay(0);
                strNumber += "0";
                updateDisplay(15);
                strNumber += ".";
            } else if (decimalAllowed) {
                updateDisplay(15);
                strNumber += ".";
            }
        });

        $(btns.keyEquals).on("click", function keyEqualsHandler() {
            
            //Repeat last operation when requested by user (e.g. 1+2=3, =5, =7, =9)
            //FIXME[]: Problem when you have 5--6
            if (lastAnswer !== null && expressionChain.length === 0) {
                if (lastOperator !== undefined) {
                    expressionChain[0] =  lastAnswer;
                    expressionChain[1] = lastOperator;
                    expressionChain[2] = lastOperand;
                    expressionChain[3] = "solve!";
                }
            } else {
                updateExpressionChain("solve!");
            }

            lastOperand = expressionChain[expressionChain.length - 2];
            lastOperator = expressionChain[expressionChain.length - 3];
            console.log("Last operator is: " + lastOperator);
            transformOperators();
            findAnswer();
            updateDisplay(16);
            lastAnswer = answer;
            console.log("Expression chain before clearing: " + expressionChain);
            
            //Reset
            expressionChain = [];
            display = "";
            answer = 0;
            console.log("Expression chain after clearing: " + expressionChain);
        });

    });

}());