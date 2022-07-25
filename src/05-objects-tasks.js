/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return { width, height, getArea: () => width * height };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const NewObject = JSON.parse(json);
  Object.setPrototypeOf(NewObject, proto);
  return NewObject;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class CurrentBuilder {
  constructor(value, order, id) {
    this.stack = [];
    this.singleStack = [];
    this.order = order;
    if (id) { this.singleStack.push(id); }
    this.stack.push(value);
  }

  stringify() {
    const res = this.stack.join('');
    this.stack = [];
    return res;
  }

  testUniq(value) {
    if (this.singleStack.indexOf(value) > -1) throw Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    else this.singleStack.push(value);
  }

  testOrder(value) {
    if (value < this.order) {
      throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    } else { this.order = value; }
  }

  element(value) {
    this.testUniq('element');
    this.testOrder(0);
    this.stack.push(value);
    return this;
  }

  id(value) {
    this.testUniq('id');
    this.testOrder(1);
    this.stack.push(`#${value}`);
    return this;
  }

  class(value) {
    this.testOrder(2);
    this.stack.push(`.${value}`);
    return this;
  }

  attr(value) {
    this.testOrder(3);
    this.stack.push(`[${value}]`);
    return this;
  }

  pseudoClass(value) {
    this.testOrder(4);
    this.stack.push(`:${value}`);
    return this;
  }

  pseudoElement(value) {
    this.testOrder(5);
    this.testUniq('pseudoElement');
    this.stack.push(`::${value}`);
    return this;
  }

  combine(selector1, combinator, selector2) {
    const sel1Value = selector1.stringify();
    const sel2Value = selector2.stringify();
    const combinatorValue = combinator === '' ? combinator : ` ${combinator} `;
    this.stack.push(sel1Value + combinatorValue + sel2Value);
    return this;
  }
}


const cssSelectorBuilder = {
  element(value) {
    return new CurrentBuilder(value, 0, 'element');
  },

  id(value) {
    return new CurrentBuilder(`#${value}`, 1, 'id');
  },

  class(value) {
    return new CurrentBuilder(`.${value}`, 2, 'class');
  },

  attr(value) {
    return new CurrentBuilder(`[${value}]`, 3, 'attr');
  },

  pseudoClass(value) {
    return new CurrentBuilder(`:${value}`, 4, 'pseudoClass');
  },

  pseudoElement(value) {
    return new CurrentBuilder(`::${value}`, 5, 'pseudoElement');
  },

  combine(selector1, combinator, selector2) {
    const sel1Value = selector1.stringify();
    const sel2Value = selector2.stringify();
    const combinatorValue = combinator === '' ? combinator : ` ${combinator} `;
    return new CurrentBuilder(`${sel1Value + combinatorValue + sel2Value}`);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
