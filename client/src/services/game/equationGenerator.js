// client/src/services/game/equationGenerator.js
export const generateNewEquation = () => {
    const operators = ["x", "+", "-"];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    let newLeft, newRight, result;
    do {
      newLeft = Math.floor(Math.random() * 9) + 1;
      newRight = Math.floor(Math.random() * 9) + 1;
      switch (randomOperator) {
        case "x":
          result = newLeft * newRight;
          break;
        case "+":
          result = newLeft + newRight;
          break;
        case "-":
          if (newLeft < newRight) [newLeft, newRight] = [newRight, newLeft];
          result = newLeft - newRight;
          break;
        default:
          result = newLeft * newRight;
      }
    } while (result > 81 || result < 1);
    return { left: newLeft, operator: randomOperator, right: "?", result };
  };
  