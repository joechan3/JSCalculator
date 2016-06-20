/*global $, console*/

//This calculator simplifies subtraction by multiplying the second number by -1, i.e. x - y is x + (-y).
//Likewise division is simplified by converting the second number x to 1/x, i.e. x / y is x * (1/y).
$(document).ready(function myCalculator() {
    "use strict";

    var btns = {
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
        keyPlus: "button:eq(17)"
    };
    var display = ""; //Holds what is to be displayed to the user.
    var strNumber = ""; //Temporary holder for numbers (as strings) inputted by the user
    var expressionChain = []; //Holds the current chain of numbers and operations inputted by the user
    var answer = 0; //Holds the final total
    var lastAnswer = null; //Holds the value of the final solution (when "=" was pressed) of the last calculation.
    
    function updateDisplay(btn) {
        var toConcat = "";
        var lastChar = display[display.length - 1];

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
            //";" represents the last part of any HTML entity such as "&plus;", "&divide;", etc.
            if (lastChar !== ";" && lastChar !== ".") {
                toConcat = "&divide;";
            } else {
                toConcat = "";
            }
            break;
        case 12: //Times button
            if (lastChar !== ";" && lastChar !== ".") {
                toConcat = "&times;";
            } else {
                toConcat = "";
            }
            break;
        case 13: //Minus button
            toConcat = "-";
            break;
        case 13.1: //Minus button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = lastAnswer + "&minus;";
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
            toConcat = lastAnswer + "&plus;";
            break;
        case 15: //Decimal button
            toConcat = ".";
            break;
        case 16: //Equals button
            toConcat = "";
            display = answer;
            break;
        }

        display += toConcat;
        $(".calc-display p").html(display);
    }

    //updateExpChain populates the expressionChain array. It is triggered by the -,+,/,x, C, and = buttons.
    function updateExpChain(str) {
        var indexOfLastOperator;
        var indexOfLastOperand;
        var lastChainItem = expressionChain[expressionChain.length - 1];

        if (str === "clear") {
            expressionChain = [];
            lastAnswer = null;
        } else {
            expressionChain.push(parseFloat(strNumber, 10));
            expressionChain.push(str);
            console.log(expressionChain);
            strNumber = "";
            indexOfLastOperator = expressionChain.length - 3;
            indexOfLastOperand = expressionChain.length - 2;

            //x - y also means x + (-y)
            if (expressionChain[indexOfLastOperator] === "minus") {
                expressionChain[indexOfLastOperator] = "add";
                expressionChain[indexOfLastOperand] *= -1;
                console.log(expressionChain);
            }
        }


    }

    //TODO[]: Check for Errors
    function checkForErrors() {
        var lastChainItem = expressionChain[expressionChain.length - 1];

        //If the last thing inputted by the user is an operator and he tries to solve the expression
        //then ignore this last operator and solve.
        if (isNaN(lastChainItem)) {
            expressionChain.pop();
        }
    }

    //Find final solution based on BEDMAS rule (Brackets, Exponents, Division, Multiplication, Addition, Subtraction).
    //TODO[]: First multiply all possible then add all
    //TODO[]: Fix floating point precision error
    function solveExpChain() {
        //Find D's and M's and reduce

        //Add all numbers
        expressionChain.forEach(function (element) {
            if (!isNaN(element)) {
                //To avoid precision errors like 0.1 + 0.2 = 0.30000000000000004 we multiply each element by 100
                //This will be canceled out with the line directly after this forEach function
                answer += element;
            }
        });
    }

    $(btns.key0).on("click", function () {
        updateDisplay(0);
        strNumber += "0";
    });

    $(btns.key1).on("click", function () {
        updateDisplay(1);
        strNumber += "1";
    });


    $(btns.key2).on("click", function () {
        updateDisplay(2);
        strNumber += "2";
    });

    $(btns.key3).on("click", function () {
        updateDisplay(3);
        strNumber += "3";
    });

    $(btns.key4).on("click", function () {
        updateDisplay(4);
        strNumber += "4";
    });

    $(btns.key5).on("click", function () {
        updateDisplay(5);
        strNumber += "5";
    });

    $(btns.key6).on("click", function () {
        updateDisplay(6);
        strNumber += "6";
    });

    $(btns.key7).on("click", function () {
        updateDisplay(7);
        strNumber += "7";
    });

    $(btns.key8).on("click", function () {
        updateDisplay(8);
        strNumber += "8";
    });

    $(btns.key9).on("click", function () {
        updateDisplay(9);
        strNumber += "9";
    });

    $(btns.keyClear).on("click", function () {
        updateDisplay(10);
        updateExpChain("clear");
    });

    $(btns.keyDiv).on("click", function () {
        updateDisplay(11);
    });

    $(btns.keyTimes).on("click", function () {
        updateDisplay(12);
    });

    //Minus button can also turn a number negative.
    $(btns.keyMinus).on("click", function () {
        var lastChainItem = expressionChain[expressionChain.length - 1];
        
        if (strNumber !== "" || !isNaN(lastChainItem) || lastAnswer !== null) {
            //Allow for chaining previous calculations' solution.
            if (expressionChain.length === 0 && lastAnswer !== null){
                updateDisplay(13.1);
                expressionChain[0] = lastAnswer;
                expressionChain[1] = "minus"; 
            } else {
                updateDisplay(13);
                updateExpChain("minus");
            }
        } else {
            //Turn number negative
            strNumber += "-";
            updateDisplay(13.2);
        }
    });

    $(btns.keyPlus).on("click", function () {
        //Allow for chaining previous calculations' solution.
        if (expressionChain.length === 0 && lastAnswer !== null) {
            updateDisplay(14.1);
            expressionChain[0] = lastAnswer;
            expressionChain[1] = "add";
        } else {
            updateDisplay(14);
            updateExpChain("add");
        }
    });

    $(btns.keyDecimal).on("click", function () {
        updateDisplay(15);
        strNumber += ".";
    });

    $(btns.keyEquals).on("click", function () {
        updateExpChain("solve!");
        //checkForErrors();
        solveExpChain();
        updateDisplay(16);
        lastAnswer = answer;
        expressionChain = [];
        answer = 0;
    });

});