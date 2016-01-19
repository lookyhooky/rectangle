/**
 * rectangle.js --- A rectangle constructor... aka Two Dimensional Array
 * Important notes - Columns and rows indexes start at 0,0
 * TODO: Make a simple base constructor and a complex one
 */

function isArrayLike (obj) {
  return (Array.isArray(obj) || (!!obj && typeof item !== 'function' &&
                                 obj.hasOwnProperty('length') &&
                                 typeof obj.length === 'number'))
}

function isEmpty (item) {
  return (isArrayLike(item) && item.length === 0)
}

function clear (item, column, row, array) {
  array[row][column] = null
}

function has (rect, column, row) {
  return (row > -1 && row < rect.rows) && (column > -1 && column < rect.columns)
}

function hasRow (rect, row) {
  return (row > -1 && row < rect.rows)
}

function hasColumn (rect, column) {
  return (column > -1 && column < rect.columns)
}

function build2DArray (array, columns, rows, iteratee) {
  if (Array.isArray(array) && columns > 0 && rows > 0) {
    array.length = rows // Truncate incase of rebuilding.
    for (var row = 0; row < rows; row++) {
      array[row] = array[row] || [] // Create a row array if it doesn't exist.
      for (var column = 0; column < columns; column++) {
        // Call iteratee with arguments of previous item plus column and row indexes.
        array[row][column] = iteratee(array[row][column], column, row)
      }
    }
  }
}

function each (rect, iteratee, context) {
  var array = rect.array
  for (var r = 0, rows = rect.rows; r < rows; r++) {
    for (var q = 0, columns = rect.columns; q < columns; q++) {
      iteratee.call(context, array[r][q], q, r, array)
    }
  }
}

function calcSelection (rect, q, r, width, height) {
  if (width < 0 && height < 0) {
    throw new Error('calcSelection recieved an out of range argument')
  } else if (has(rect, q, r)) {
    var inputExitColumn = q + width
    var inputExitRow = r + height
    var exitColumn = inputExitColumn < rect.columns
        ? inputExitColumn
        : rect.columns
    var exitRow = inputExitRow < rect.rows
        ? inputExitRow
        : rect.rows
    return {
      start: { q: q, r: r },
      exit: { q: exitColumn, r: exitRow }
    }
  } else {
    return null
  }
}

function eachSelection (array, s, iteratee, context) {
  for (var r = s.start.r, exitRow = s.exit.r; r < exitRow; r++) {
    for (var q = s.start.q, exitColumn = s.exit.q; q < exitColumn; q++) {
      iteratee.call(context, array[r][q], q, r, array)
    }
  }
}

function select (rect, q, r, width, height, iteratee, context) {
  var selection = calcSelection(rect, q, r, width, height)
  if (selection) {
    eachSelection(rect.array, selection, iteratee, context)
  }
}

function eachRow (rect, iteratee, context) {
  var row, array
  array = rect.array
  for (var r = 0, rows = rect.rows; r < rows; r++) {
    row = []
    for (var q = 0, columns = rect.columns; q < columns; q++) {
      row.push(array[r][q])
    }
    iteratee.call(context, row, r, array)
  }
}

function eachColumn (rect, iteratee, context) {
  var column
  var array = rect.array
  for (var q = 0, columns = rect.columns; q < columns; q++) {
    column = []
    for (var r = 0, rows = rect.rows; r < rows; r++) {
      column.push(array[r][q])
    }
    iteratee.call(context, column, q, array)
  }
}

/*
 * The current column or row is passesd as the last argument to iteratee.
 * The intent is for it to use as an index for the current position. This should
 * allow iteratee to be dual purposed for eachColumnOfRow and eachRowOfColumn.
 */
function eachColumnOfRow (rect, r, iteratee, context) {
  if (hasRow(rect, r)) {
    var array = rect.array
    for (var q = 0, columns = rect.columns; q < columns; q++) {
      iteratee.call(context, array[r][q], q, r, array, q)
    }
  }
}

function eachRowOfColumn (rect, q, iteratee, context) {
  if (hasColumn(rect, q)) {
    var array = rect.array
    for (var r = 0, rows = rect.rows; r < rows; r++) {
      iteratee.call(context, array[r][q], q, r, array, r)
    }
  }
}

function prepare (fill) {
  if (typeof fill === 'function') {
    return fill
  } else if (isArrayLike(fill)) {
    var length = fill.length
    return function (item, q, r, array, index) { // Need the additional index for accessing
      array[r][q] = (index < length) ? fill[index] : null // the arrayLike seperately.
    }
  } else {
    return clear
  }
}

/*
 * merge --- Replace the values of main with those of rect starting at column and row
 */
function merge (main, rect, column, row) {
  var selection = calcSelection(main, column, row, rect.columns, rect.rows)
  if (selection) {
    var mainQ, mainR, width, height, startQ, startR, mainArray, rectArray
    mainArray = main.array
    rectArray = rect.array
    width = selection.exit.q - selection.start.q
    height = selection.exit.r - selection.start.r
    startR = selection.start.r
    startQ = selection.start.q
    for (var currentR = 0; currentR < height; currentR++) {
      for (var currentQ = 0; currentQ < width; currentQ++) {
        mainR = currentR + startR
        mainQ = currentQ + startQ
        mainArray[mainR][mainQ] = rectArray[currentR][currentQ]
      }
    }
  }
}

var Rectangle = function (columns, rows, items) {
  Object.defineProperties(this, {
    'columns': {
      value: columns,
      writable: true
    },
    'rows': {
      value: rows,
      writable: true
    },
    'array': {
      value: []
    }
  })

  var iterator = (isArrayLike(items))
      ? function (previous, column, row) { return items[row * rows + column] || null }
      : function () { return null }

  build2DArray(this.array, columns, rows, iterator)
}

Rectangle.prototype.has = function (q, r) {
  return has(this, q, r)
}

Rectangle.prototype.rebuild = function (columns, rows, iteratee) {
  // var len = this.array.length
  // var old = this.array.splice(0, len)
  iteratee = iteratee || function (previous) { return previous || null }
  build2DArray(this.array, columns, rows, function (previous, column, row) {
    return iteratee(previous, column, row)
    // var previous = (row < len) ? old[row][column] || null : null
    // return iteratee(previous, column, row)
  })
  this.rows = rows
  this.columns = columns
}

Rectangle.prototype.set = function (q, r, item) {
  if (has(this, q, r)) { this.array[r][q] = item }
  return item
}

Rectangle.prototype.get = function (q, r) {
  return (has(this, q, r)) ? this.array[r][q] : null
}

Rectangle.prototype.clear = function (q, r) {
  return this.set(q, r, null)
}

Rectangle.prototype.each = function (iteratee, context) {
  each(this, iteratee, context)
  return this
}

Rectangle.prototype.eachRow = function (iteratee, context) {
  eachRow(this, iteratee, context)
  return this
}

Rectangle.prototype.eachColumn = function (iteratee, context) {
  eachColumn(this, iteratee, context)
  return this
}

Rectangle.prototype.setRow = function (r, fill) {
  eachColumnOfRow(this, r, prepare(fill))
  return this
}

Rectangle.prototype.setColumn = function (q, fill) {
  eachRowOfColumn(this, q, prepare(fill))
  return this
}

Rectangle.prototype.getRow = function (r) {
  var row = []
  eachColumnOfRow(this, r, function (item) {
    row.push(item)
  })
  return !isEmpty(row) ? row : null
}

Rectangle.prototype.getColumn = function (q) {
  var column = []
  eachRowOfColumn(this, q, function (item) {
    column.push(item)
  })
  return !isEmpty(column) ? column : null
}

Rectangle.prototype.addRow = function (fill) {
  var row = this.rows++
  this.array[row] = [] // Need to add an array to contain the row.
  this.setRow(row, fill)
  return this
}

Rectangle.prototype.addColumn = function (fill) {
  var column = this.columns++
  this.setColumn(column, fill)
  return this
}

Rectangle.prototype.select = function (q, r, width, height, iteratee) {
  select(this, q, r, width, height, iteratee)
}

Rectangle.prototype.mergeRect = function (rect, q, r) {
  merge(this, rect, q, r)
}

Rectangle.prototype.clearRect = function (q, r, width, height) {
  var selection = (q === undefined) // If no arguments are supplied, select all.
      ? calcSelection(this, 0, 0, this.columns, this.rows)
      : calcSelection(this, q, r, width, height)
  if (selection) {
    eachSelection(this.array, selection, clear)
  }
}

Rectangle.prototype.clearRow = function (row) {
  this.clearRect(0, row, this.columns, 1)
  return this
}

Rectangle.prototype.clearColumn = function (column) {
  this.clearRect(column, 0, 1, this.rows)
  return this
}

module.exports = Rectangle
