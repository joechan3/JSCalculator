/*global $, console*/
//TODO[]: Add a feature where are request for more than one operator in sequence is ignored.
//This calculator simplifies subtraction by multiplying the second number by -1, i.e. x - y is x + (-y).
//Likewise division is simplified by converting the second number y to 1/y, i.e. x / y is x * (1/y).

(function joesCalculator() {
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
    //    var operatorCalled = false; //Holds the status of whether or not an operator like "plus" has been called.

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
            toConcat = "&divide;";
            break;
        case 11.1: //Division button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = lastAnswer + "&divide;";
            break;
        case 12: //Times button
            toConcat = "&times;";
            break;
        case 12.1: //Times button w/ last answer available
            display = "";
            $(".calc-display p").html(display);
            toConcat = lastAnswer + "&times;";
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

    //Triggered by the -,+,/,x, C, and = buttons.
    function updateExpressionChain(str) {
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

            //x / y also means x * (1/y)
            if (expressionChain[indexOfLastOperator] === "divide") {
                expressionChain[indexOfLastOperator] = "times";
                expressionChain[indexOfLastOperand] = 1 / expressionChain[indexOfLastOperand];
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
    //Remember updateExpressionChain converts "minus" to "add" and "divide" to "times".
    //TODO[]: First multiply all possible then add all
    //TODO[]: Fix floating point precision error
    function solveExpChain() {
        var i;
        var j;
        var k;
        var temp;
        var firstOperand = expressionChain[0];
        var firstOperator;
        var secondOperand;
        var secondOperator;
        var sumChain = [];
        var productChain = [];
        var isSimplestCase = expressionChain.length === 4; //e.g. [1, "add", 1, "solve!"];
        var lastTimesOperatorIndex;
        var product = [];
        var isGeneralCase1;
        var isGeneralCase2;
        var isGeneralCase3;
        var isGeneralCase4;

        for (i = 1;
            (i + 2) <= expressionChain.length - 1; i += 2) {
                        //debugger;
            secondOperand = expressionChain[i + 1];
            firstOperator = expressionChain[i];
            secondOperator = expressionChain[i + 2];
            isGeneralCase1 = firstOperator === "add" && (secondOperator === "add" || secondOperator === "solve!") && !isSimplestCase;
            isGeneralCase2 = firstOperator === "add" && (secondOperator === "times" || secondOperator === "solve!") && !isSimplestCase;
            isGeneralCase3 = firstOperator === "times" && (secondOperator === "add" || secondOperator === "solve!") && !isSimplestCase;
            isGeneralCase4 = firstOperator === "times" && (secondOperator === "times" || secondOperator === "solve!") && !isSimplestCase;

            //Simplest case
            if (isSimplestCase) {
                if (firstOperator === "add") {
                    sumChain.push(firstOperand, secondOperand);
                    productChain = [0];
                } else {
                    sumChain = [0];
                    productChain = [firstOperand * secondOperand];
                }
            }

            //General case
            if (isGeneralCase1) {
                if (i === 1) {
                    sumChain.push(firstOperand, secondOperand);
                } else {
                    sumChain.push(secondOperand);
                }

            } else if (isGeneralCase2) {

                if (i === 1){
                    sumChain.push(firstOperand);
                }

                for (j = i + 2; expressionChain[j] === "times"; j += 2) {
                    if (j === i + 2) {
                        product.push(expressionChain[j - 1], expressionChain[j + 1]);
                    } else {
                        product.push(expressionChain[j + 1]);
                    }
                }

                i = j - 2;

                temp = 1;
                for (k = 0; k < product.length; k += 1) {
                    temp *= product[k];
                }

                product = temp;

                productChain.push(product);
                product = [];

                //FIXME[]: XXX
            } else if (isGeneralCase3) {

                if (i === 1){
                    product.push(firstOperand, secondOperand);
                }
                

                for (j = i + 2; expressionChain[j] === "times"; j += 2) {
                    if (j === i + 2) {
                        product.push(expressionChain[j - 1], expressionChain[j + 1]);
                    } else {
                        product.push(expressionChain[j + 1]);
                    }
                }

                i = j - 2;

                temp = 1;
                for (k = 0; k < product.length; k += 1) {
                    temp *= product[k];
                }

                product = temp;

                productChain.push(product);
                product = [];

            } else if (isGeneralCase4) {

                if (i === 1){
                    product.push(firstOperand, secondOperand);
                }
                

                for (j = i + 2; expressionChain[j] === "times"; j += 2) {
                    
                        product.push(expressionChain[j + 1]);
                    
                }

                i = j - 2;

                temp = 1;
                for (k = 0; k < product.length; k += 1) {
                    temp *= product[k];
                }

                product = temp;

                productChain.push(product);
                product = [];

            } 
        }

        console.log("Sumchain is: ", sumChain);

        answer = sumChain.reduce(function addAll(a, b) {
            return a + b;
        }, 0);

        answer += productChain.reduce(function addAll(a, b) {
            return a + b;
        }, 0);

    }

    $(document).ready(function buttonsHandler() {
        $(btns.key0).on("click", function key0Handler() {
            updateDisplay(0);
            strNumber += "0";
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
        });

        $(btns.keyDiv).on("click", function keyDivHandler() {
            //Used to chain from last solution.
            var chainingPossible = expressionChain.length === 0 && lastAnswer !== null;

            //Used to prevent divide operator from being applied twice or without operand.
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

        //Minus button can also turn a number negative.
        $(btns.keyMinus).on("click", function keyMinusHandler() {
            var lastChainItem = expressionChain[expressionChain.length - 1];

            //Used to chain from last solution.
            var chainingPossible = expressionChain.length === 0 && lastAnswer !== null;


            if (strNumber !== "" || !isNaN(lastChainItem) || lastAnswer !== null) {
                //Allow for chaining previous calculations' solution.
                if (chainingPossible) {
                    updateDisplay(13.1);
                    expressionChain[0] = lastAnswer;
                    expressionChain[1] = "minus";
                } else {
                    updateDisplay(13);
                    updateExpressionChain("minus");
                }
            } else {
                //Turn number negative
                strNumber += "-";
                updateDisplay(13.2);
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

            var decimalAllowed; //TODO[]: = some Boolean

            updateDisplay(15);
            strNumber += ".";
        });

        $(btns.keyEquals).on("click", function keyEqualsHandler() {
            updateExpressionChain("solve!");
            //checkForErrors();
            solveExpChain();
            updateDisplay(16);
            lastAnswer = answer;
            expressionChain = [];
            answer = 0;
        });

    });

}());