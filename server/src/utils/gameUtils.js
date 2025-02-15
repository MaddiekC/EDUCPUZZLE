// server/src/utils/gameUtils.js

/**
 * Valida si el número seleccionado por el jugador es correcto.
 * Compara el resultado de aplicar el operador de la ecuación al operando conocido
 * con el número seleccionado, contra el resultado almacenado.
 *
 * @param {number|string} selected - El número que el jugador ha seleccionado.
 * @param {Object} equation - La ecuación actual, con las propiedades left, operator y result.
 * @returns {boolean} - true si la respuesta es correcta, false en caso contrario.
 */
export function validateAnswer(selected, equation) {
    const numSelected = parseInt(selected, 10);
    switch (equation.operator) {
      case "x":
        return equation.left * numSelected === equation.result;
      case "+":
        return equation.left + numSelected === equation.result;
      case "-":
        return equation.left - numSelected === equation.result;
      default:
        return false;
    }
  }
  
  /**
   * Genera una nueva ecuación.
   * La ecuación consiste en un operando conocido (left), un operador aleatorio ("x", "+", "-"),
   * y un operando faltante (right) que se representa con "?" para que el jugador adivine.
   * El valor correcto (result) se calcula usando un valor aleatorio para el operando faltante,
   * pero no se envía al cliente.
   *
   * @returns {Object} - Un objeto que representa la ecuación, con las propiedades:
   *   - left: número conocido
   *   - operator: el operador ("x", "+", "-")
   *   - right: "?" (para no revelar el operando faltante)
   *   - result: el resultado de aplicar el operador al operando conocido y el número aleatorio.
   */
  export function generateNewEquation() {
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
          // Asegurarse de que el resultado sea positivo intercambiando si es necesario.
          if (newLeft < newRight) [newLeft, newRight] = [newRight, newLeft];
          result = newLeft - newRight;
          break;
        default:
          result = newLeft * newRight;
      }
    } while (result > 81 || result < 1);
    
    // Se retorna la ecuación con "?" en el campo right para que el jugador deba adivinarlo.
    return { left: newLeft, operator: randomOperator, right: "?", result };
  }
  