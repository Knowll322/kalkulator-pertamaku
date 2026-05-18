const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const historyEl = document.querySelector("#history");
const themeToggle = document.querySelector("#themeToggle");
const keys = [...document.querySelectorAll(".key")];

let expression = "";
let justSolved = false;

const symbols = {
  "*": "×",
  "/": "÷",
  "-": "−",
};

const operators = ["+", "-", "*", "/", "%"];

function render() {
  expressionEl.textContent = pretty(expression) || "0";
  const preview = evaluate(expression);
  resultEl.textContent = preview ?? "0";
}

function pretty(value) {
  return value.replace(/[*/-]/g, (operator) => symbols[operator] || operator);
}

function evaluate(value) {
  if (!value || operators.includes(value.at(-1)) || value.at(-1) === ".") {
    return null;
  }

  try {
    if (!/^[\d+\-*/%.() ]+$/.test(value)) return null;
    const answer = Function(`"use strict"; return (${value})`)();
    if (!Number.isFinite(answer)) return "Tak terhingga";
    return formatNumber(answer);
  } catch {
    return null;
  }
}

function formatNumber(value) {
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 10,
  }).format(rounded);
}

function inputValue(value) {
  if (justSolved && !operators.includes(value)) {
    expression = "";
  }

  justSolved = false;

  if (operators.includes(value)) {
    if (!expression && value !== "-") return;
    if (operators.includes(expression.at(-1))) {
      expression = expression.slice(0, -1);
    }
  }

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/%]/).at(-1);
    if (currentNumber.includes(".")) return;
    if (!currentNumber) expression += "0";
  }

  expression += value;
  render();
}

function clearAll() {
  expression = "";
  justSolved = false;
  historyEl.textContent = "Siap menghitung";
  render();
}

function backspace() {
  expression = expression.slice(0, -1);
  justSolved = false;
  render();
}

function solve() {
  const answer = evaluate(expression);
  if (answer === null) return;
  historyEl.textContent = `${pretty(expression)} =`;
  expression = answer.replace(/\./g, "").replace(",", ".");
  justSolved = true;
  render();
}

function pulse(button) {
  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 140);
}

keys.forEach((button) => {
  button.addEventListener("click", () => {
    pulse(button);

    const action = button.dataset.action;
    if (action === "clear") clearAll();
    else if (action === "backspace") backspace();
    else if (action === "equals") solve();
    else inputValue(button.dataset.value);
  });
});

document.addEventListener("keydown", (event) => {
  const keyMap = {
    Enter: "=",
    Escape: "clear",
    Backspace: "backspace",
    x: "*",
    X: "*",
  };

  const key = keyMap[event.key] || event.key;
  const button =
    keys.find((item) => item.dataset.value === key) ||
    keys.find((item) => item.dataset.action === key);

  if (!button) return;
  event.preventDefault();
  button.click();
});

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
});

render();
