/*global $, console, math*/
/*jslint vars: true */

/******************************************************************************************************
GENERAL NOTES

* math.js BigNumber is used for arbitrary-precision arithmetic and solves the floating-point arithmetic
problem (e.g. 0.1 + 0.2 = 0.30000000000000004, 0.1 * 0.2 = 0.020000000000000004, etc.).

* math.js is used for arithmetic expressions.

* User input is stored in the array `expressionChain` and then is evaluated when the `=` button is pressed.

* Chaining operations from the last solution (after pressing `=`) is possible.

* `-` button functions as subtraction or negation depending on conditions.

* Unnecessary zero inputs like 002 are prevented or automatically deleted (e.g. 02 becomes 2).

* Nonsensical decimal inputs like 0.0.2 or ...2 are prevented.

* Decimal key inserts a leading zero as needed.

* Repeating an operator is prevented (e.g. 5++5).

* Pressing `=` after entering one number returns that number.

* Calculator resets if user immediately enters a number after last calculation.

* Calculator repeats last operation when requested by user by pressing `=` (e.g. 1+2=3, =5, =7, =9).

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
    var expressionChain = []; //Holds the current chain of operands and operators inputted by the user.
    var lastAnswer = null; //Holds the value of the previous calculation's final solution (when "=" was pressed).
    var lastOperator; //Holds the last operator from the most recent valid chain of user input after pressing `=`.
    var lastOperand; //Holds the last operand from the most recent valid chain of user input after pressing `=`.
    var strNumber = ""; //Temporary holder for numbers (as strings) inputted by the user.
    var unnecessaryZero = false; //Becomes true when user tries to input something like 002.

    function updateDisplay(btn) {
        var toConcat = ""; //String to concatenate to display.

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
            toConcat = math.format(lastAnswer, 12) + "&divide;";
            break;
        case 12: //Times button
            toConcat = "&times;";
            break;
        case 12.1: //Times button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = math.format(lastAnswer, 12) + "&times;";
            break;
        case 13: //Minus button
            toConcat = "-";
            break;
        case 13.1: //Minus button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = math.format(lastAnswer, 12) + "&minus;";
            break;
        case 14: //Sum button
            toConcat = "&plus;";
            break;
        case 14.1: //Sum button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = math.format(lastAnswer, 12) + "&plus;";
            break;
        case 15: //Decimal button
            toConcat = ".";
            break;
        case 16: //Equals button
            toConcat = "";
            display = math.format(answer, 12);
            break;
        default:
            throw "Invalid input";
        }

        display += toConcat;
        $(".calc-display p").html(display);
    }

    //Triggered by operator type buttons.
    function updateExpressionChain(str) {
        var negationUsed = strNumber === "" && str === "-";

        if (!negationUsed) {
            expressionChain.push(parseFloat(strNumber, 10));
        }

        if (str !== "solve!") {
            expressionChain.push(str);
        }
        strNumber = "";
    }

    function findAnswer() {
        math.config({
            number: "BigNumber",
            precision: 64
        });
        answer = math.eval(expressionChain.join(""));
    }

    $(document).ready(function buttonsHandler() {

        $(btns.keyNumber).on("click", function keyNumberHandler() {
            //Reset calculator if user immediately enters a number after last calculation
            if (lastAnswer !== null && expressionChain.length === 0) {
                lastAnswer = null;
            }
        });

        $(btns.keyNumberNotZero).on("click", function keyNumberNotZeroHandler() {
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

            checkUnnecessaryZero();

            if (unnecessaryZero) {
                removeUnnecessaryZero();
            }

        });

        $(btns.key0).on("click", function key0Handler() {
            var zeroAllowed = false;

            //Zero is allowed for the following conditions:
            //1. Zero is the first number inputed by user.
            //2. Zero follows any number but zero.
            //3. Zero follows a zero and a decimal (i.e., `0.`)
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
            expressionChain = [];
            answer = 0;
            lastAnswer = null;
            strNumber = "";
        });

        $(btns.keyDiv).on("click", function keyDivHandler() {
            //Used to chain from last solution.
            var chainingPossible = expressionChain.length === 0 && lastAnswer !== null;

            //Used to prevent divide operator from being applied twice or without an operand.
            var operatorAllowed = strNumber !== "";

            if (chainingPossible) {
                updateDisplay(11.1);
                expressionChain[0] = lastAnswer;
                expressionChain[1] = "/";
            } else if (operatorAllowed) {
                updateDisplay(11);
                updateExpressionChain("/");
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
                expressionChain[1] = "*";
            } else if (operatorAllowed) {
                updateDisplay(12);
                updateExpressionChain("*");
            }
        });

        //Minus button functions as subtraction or negation.
        $(btns.keyMinus).on("click", function keyMinusHandler() {
           //Used to chain from last solution.
            var chainingPossible = expressionChain.length === 0 && lastAnswer !== null;

            //Unlike other operators, minus operator is always allowed
            //because multiple minus operators naturally cancel out as needed.
            //E.g. 5--5 = 5+5
            var operatorAllowed = true;

            if (chainingPossible) {
                updateDisplay(13.1);
                expressionChain[0] = lastAnswer;
                expressionChain[1] = "-";
            } else if (operatorAllowed) {
                updateDisplay(13);
                updateExpressionChain("-");
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
                expressionChain[1] = "+";
            } else if (operatorAllowed) {
                updateDisplay(14);
                updateExpressionChain("+");
            }
        });

        $(btns.keyDecimal).on("click", function keyDecimalHandler() {
            var decimalAllowed = false;

            //Prevent multiple uses of decimal at a time
            if (strNumber.indexOf(".") === -1) {
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
            if (lastAnswer !== null && expressionChain.length === 0) {
                if (lastOperator !== null) {
                    //Repeat last operation when requested by user (e.g. 1+2=3, =5, =7, =9)
                    expressionChain[0] = lastAnswer;
                    expressionChain[1] = lastOperator;
                    expressionChain[2] = lastOperand;
                } else {
                    //For cases where user enters a number then presses `=` button
                    expressionChain[0] = lastAnswer;
                }
            } else {
                updateExpressionChain("solve!");
            }

            if (expressionChain.length >= 3) {
                lastOperand = expressionChain[expressionChain.length - 1];
                lastOperator = expressionChain[expressionChain.length - 2];
            } else {
                lastOperand = null;
                lastOperator = null;
            }

            findAnswer();
            updateDisplay(16);

            lastAnswer = answer;

            //Reset
            expressionChain = [];
            display = "";
            answer = 0;
            strNumber = "";
        });

    });

}());