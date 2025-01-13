let el = document.querySelector(".neumorphicWrapper");

let maxRotation = 1;
let { y: boxY, x: boxX, width, height } = el.getBoundingClientRect();
let boxCenterY = boxY + height / 2;
let boxCenterX = boxX + width / 2;

el.addEventListener("mousemove", evt => {
  el.style.transition = "";
  let deltaY = evt.pageY - boxCenterY;
  let deltaX = evt.pageX - boxCenterX;
  let percentDisplaceY = deltaY / (height / 2);
  let percentDisplaceX = -deltaX / (width / 2);
  let rotationZ = 0.25 * Math.abs(percentDisplaceY);
  if (percentDisplaceY < 0) {
    rotationZ *= -1 * maxRotation * percentDisplaceX;
  } else {
    rotationZ *= maxRotation * percentDisplaceX;
  }
  el.style.transform = `rotateX(${maxRotation * percentDisplaceY}deg) rotateY(${maxRotation * percentDisplaceX}deg) rotateZ(${rotationZ}deg)`;
});

el.addEventListener("mouseleave", evt => {
  el.style.transform = "rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
  el.style.transition = "transform .3s linear";
});

let validRules = [
  "0001",
  "1011",
  "0221",
  "1231",
  "0021",
  "1031",
  "0112",
  "1012",
  "1232",
  "0332",
  "0132",
  "1032",
  "0223",
  "2023",
  "3033",
  "1233",
  "0023",
  "1033",
  "0114",
  "2024",
  "1234",
  "0134",
  "1034",
  "0024"
];

let forms = [
  "All # is #",
  "No # is #",
  "Some # is #",
  "Some # is not #"
];

function getRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomInvalidRule() {
  let rule = getRandom(validRules);
  while (validRules.includes(rule)) {
    rule = "";
    for (let i = 0; i < 3; i++) {
      rule += Math.floor(Math.random() * 4); // Form
    }
    rule += 1 + Math.floor(Math.random() * 4); // Figure
  }
  return rule;
}

function createSyllogism(s, p, m, rule) {

  let major = forms[rule[0]];
  let minor = forms[rule[1]];
  let conclusion = forms[rule[2]];
  
  let figure = +rule[3];
  
  if (figure === 1) {
    major = major.replace("#", m);
    major = major.replace("#", p);
    
    minor = minor.replace("#", s);
    minor = minor.replace("#", m);
  } else if (figure === 2) {
    major = major.replace("#", p);
    major = major.replace("#", m);
    
    minor = minor.replace("#", s);
    minor = minor.replace("#", m);
  } else if (figure === 3) {
    major = major.replace("#", m);
    major = major.replace("#", p);
    
    minor = minor.replace("#", m);
    minor = minor.replace("#", s);
  } else if (figure === 4) {
    major = major.replace("#", p);
    major = major.replace("#", m);
    
    minor = minor.replace("#", m);
    minor = minor.replace("#", s);
  }
  
  conclusion = conclusion.replace("#", s);
  conclusion = conclusion.replace("#", p);
  
  return [major, minor, conclusion];
}

function getRandomRuleStartingWith(quantifier, isInvalid) {
  let rule = "x";
  while(rule[0] !== quantifier) {
    if (isInvalid) {
      rule = getRandomInvalidRule();
    } else {
      rule = getRandom(validRules);
    }
  }
  return rule;
}

function coin() {
  return Math.random() > 0.5;
}

function customRandom(fn) {
  let discriminator = Math.random();
  let random = fn(Math.random());
  while (random < discriminator) {
    random = fn(Math.random());
  }
  return random;
}

function getSyllogism(length) {

  // Middle-term, subject, predicate
  let m = String.fromCharCode(65);
  let s = String.fromCharCode(66);
  let p = String.fromCharCode(67);

  // Poly-sillogism (chain of syllogisms)
  let polySyllogism = [];

  // Calc upfront if the syllogism will be valid with a probability of 50/50
  let valid = coin();

  // If the syllogism is invalid calc with an exponential distribution of probabilities a point to break the chain
  let breakpoint;
  if (!valid) {
    breakpoint = Math.floor(customRandom(x => x**2) * length);
  }
  console.log("breakpoint", breakpoint);

  let rule;
  if (breakpoint === 0) {
    console.log("Invalid @breakpoint0");
    rule = getRandomInvalidRule();
  } else {
    console.log("Valid @breakpoint0");
    rule = getRandom(validRules);
  }

  let [major, minor, conclusion] = createSyllogism(
    s, p, m,
    rule
  );

  polySyllogism.push(major);
  polySyllogism.push(minor);
  polySyllogism.push(conclusion);
  
  // Single syllogism 
  if (length < 2) {
    return {
      isValid: valid,
      polySyllogism
    }
  }
  
  for (let i = 1; i < length; i++) {
    
    // The rule has to start with the quantifier of the prev conclusion
    if (breakpoint === i) {
      console.log("Invalid @breakpoint" + i);
      rule = getRandomRuleStartingWith(rule[2], true); // Called with invalid flag
    } else {
      console.log("Valid @breakpoint" + i);
      rule = getRandomRuleStartingWith(rule[2]);
    }

    // Decide how to switch s, m and p
    let rnd = Math.random();
    if (coin()) {
      m = p;
      p = s;
      s = String.fromCharCode(69 + i);
    } else {
      m = s;
      s = String.fromCharCode(69 + i);
    }
    
    [major, minor, conclusion] = createSyllogism(
      s, p, m,
      rule
    );
    
    polySyllogism.push(minor);
    polySyllogism.push(conclusion);
  }
  
  return {
    isValid: valid,
    polySyllogism
  }
}

let fontSize = document.querySelector("#fontSize");
let fsrange = fontSize.querySelector("input");
let fstext = fontSize.querySelector("b");

let syllogismLength = document.querySelector("#syllogismLength");
let slrange = syllogismLength.querySelector("input");
let sltext = syllogismLength.querySelector("b");

let neuWrapper = el; // Look on top
let syllogismEl = document.querySelector(".syllogism");
let trueBtn = document.querySelector(".halfPill.left");
let falseBtn = document.querySelector(".halfPill.right");

trueBtn.addEventListener("click", () => {
  if (syllogismObj.isValid) {
    neuWrapper.classList.add("yes");
    setTimeout(() =>
      neuWrapper.classList.remove("yes")
    , 1025);
  } else {
    neuWrapper.classList.add("no");
    setTimeout(() =>
      neuWrapper.classList.remove("no")
    , 1025);
  }
  setSyllogism(+slrange.value);
});

falseBtn.addEventListener("click", () => {
  if (!syllogismObj.isValid) {
    neuWrapper.classList.add("yes");
    setTimeout(() =>
      neuWrapper.classList.remove("yes")
    , 1025);
  } else {
    neuWrapper.classList.add("no");
    setTimeout(() =>
      neuWrapper.classList.remove("no")
    , 1025);
  }
  setSyllogism(+slrange.value);
});


let defaultFontSize = 2.5;
setTextSize(defaultFontSize);
fsrange.addEventListener("input", () =>
  setTextSize(+fsrange.value)
);
function setTextSize(size) {
  fsrange.value = size;
  fstext.innerHTML = size;
  neuWrapper.querySelector(".syllogism")
    .style.fontSize = size + "em";
}

let syllogismObj;
let defaultLength = 2;
setSyllogism(defaultLength);
slrange.addEventListener("input", () =>
  setSyllogism(+slrange.value)
);
function setSyllogism(length) {
  slrange.value = length;
  sltext.innerHTML = length;
  syllogismObj = getSyllogism(length);
  syllogismEl.innerHTML = syllogismObj.polySyllogism.join("\n");
}
