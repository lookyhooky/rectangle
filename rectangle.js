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

function hasRow (rect, row) {
  return (row > -1 && row < rect.dims.rows)
}

function hasColumn (rect, column) {
  return (column > -1 && column < rect.dims.columns)
}

function build2DArray (array, columns, rows, iteratee) {
  if (columns > 0 && rows > 0) {
    var row, column
    array.length = rows // Truncate incase rebuilding the array.
    iteratee = iteratee || function (row, column) { return null }
    for (row = 0; row < rows; row++) {
      array[row] = []
      for (column = 0; column < columns; column++) {
        array[row][column] = iteratee(column, row)
      }
    }
  }
}

var each = function (rect, iteratee, context) {
  var q, r, array, qCount, rCount
  array = rect._array
  for (r = 0, rCount = rect.dims.rows; r < rCount; r++) {
    for (q = 0, qCount = rect.dims.columns; q < qCount; q++) {
      iteratee.call(context, array[r][q], q, r, array)
    }
  }
}

var mutate = function (rect, iteratee, context) {
  var q, r, array, qCount, rCount
  array = rect._array
  for (r = 0, rCount = rect.dims.rows; r < rCount; r++) {
    for (q = 0, qCount = rect.dims.columns; q < qCount; q++) {
      array[r][q] = iteratee.call(context, array[r][q], q, r, array)
    }
  }
}

each.row = function (rect, iteratee, context) {
  var q, r, row, array, qCount, rCount
  array = rect._array
  for (r = 0, rCount = rect.dims.rows; r < rCount; r++) {
    row = []
    for (q = 0, qCount = rect.dims.columns; q < qCount; q++) {
      row.push(array[r][q])
    }
    iteratee.call(context, row, r, array)
  }
}

each.column = function (rect, iteratee, context) {
  var q, r, array, qCount, rCount, column
  array = rect._array
  for (q = 0, qCount = rect.dims.columns; q < qCount; q++) {
    column = []
    for (r = 0, rCount = rect.dims.rows; r < rCount; r++) {
      column.push(array[r][q])
    }
    iteratee.call(context, column, q, array)
  }
}

/*
 * The current `column or `row is passesd as the last argument to `iteratee.
 * The intent is for it to use as an index for the current position. This should
 * allow `iteratee to be dual purposed for either each.of.row or each.of.column
 */
each.of = {
  row: function (rect, r, iteratee, context) {
    if (hasRow(rect, r)) {
      var q, array, count
      array = rect._array
      for (q = 0, count = rect.dims.columns; q < count; q++) {
        iteratee.call(context, array[r][q], q, r, array, q)
      }
    }
  },
  column: function (rect, q, iteratee, context) {
    if (hasColumn(rect, q)) {
      var r, array, count
      array = rect._array
      for (r = 0, count = rect.dims.rows; r < count; r++) {
        iteratee.call(context, array[r][q], q, r, array, r)
      }
    }
  }
}

function prepare (fill) {
  if (typeof fill === 'function') {
    return fill
  } else if (isArrayLike(fill)) {
    var length = fill.length              // Might want to look into generators.
    return function (item, q, r, array, index) { // Need the additional index for accessing
      array[r][q] = (index < length) ? fill[index] : null // the arrayLike seperately.
    }
  } else {
    return function (item, q, r, array) {
      array[r][q] = null
    }
  }
}

/*
 * impose --- Replace the values of `main with those of `rect starting at `q1,`r1
 * and ending at `q2,`r2.
 */
function impose (main, rect, q1, r1) {
  if (q1 < main.dims.columns && r1 < main.dims.rows) {
    var q2, r2, array
    array = main._array
    q2 = (q1 + rect.dims.columns > main.dims.columns)
      ? main.dims.columns
      : q1 + rect.dims.columns
    r2 = (r1 + rect.dims.rows > main.dims.rows)
      ? main.dims.rows
      : r1 + rect.dims.rows

    each(rect, function (item, q, r) {
      if (item) {
        var currentQ = q + q1
        var currentR = r + r1
        if (currentQ < q2 && currentR < r2) {
          array[currentR][currentQ] = item
        }
      }
    })
  }
}

var Rectangle = function (columns, rows, items) {
  Object.defineProperties(this, {
    'dims': {
      value: { columns: columns, rows: rows }
    },
    '_array': {
      value: []
    }
  })

  if (isArrayLike(items)) {
    build2DArray(this._array, columns, rows, function (column, row) {
      return items[row * rows + column] || null
    })
  } else {
    build2DArray(this._array, columns, rows)
  }
}

Rectangle.prototype.rebuild = function (columns, rows, iteratee) {
  var old = this._array.splice(0, this._array.length)

  build2DArray(this._array, columns, rows, function (column, row) {
    if (isArrayLike(old[row])) {
      return old[row][column] || null
    } else {
      return null
    }
  })

  this.dims.rows = rows
  this.dims.columns = columns
}

Rectangle.prototype.setCell = function (q, r, item) {
  if (hasColumn(this, q) && hasRow(this, r)) {
    this._array[r][q] = item
  }
  return item
}

Rectangle.prototype.getCell = function (q, r) {
  return (hasColumn(this, q) && hasRow(this, r)) ? this._array[r][q] : null
}

Rectangle.prototype.clearCell = function (q, r) {
  return this.setCell(q, r, null)
}

Rectangle.prototype.each = function (iteratee, context) {
  each(this, iteratee, context)
  return this
}

Rectangle.prototype.setRow = function (r, fill) {
  each.of.row(this, r, prepare(fill))
  return this
}

Rectangle.prototype.setColumn = function (q, fill) {
  each.of.column(this, q, prepare(fill))
  return this
}

Rectangle.prototype.getRow = function (r) {
  var row = []
  each.of.row(this, r, function (item) {
    row.push(item)
  })
  return (!isEmpty(row) ? row : null)
}

Rectangle.prototype.getColumn = function (q) {
  var column = []
  each.of.column(this, q, function (item) {
    column.push(item)
  })
  return (!isEmpty(column) ? column : null)
}

Rectangle.prototype.addRow = function (fill) {
  var r = this.dims.rows++
  this._array[r] = [] // Need to add an array to contain the row.
  this.setRow(r, fill)
  return this
}

Rectangle.prototype.addColumn = function (fill) {
  var q = this.dims.columns++
  this.setColumn(q, fill)
  return this
}

Rectangle.prototype.fill = function (iteratee) {
  mutate(this, iteratee)
}

Rectangle.prototype.fillRect = function (q1, r1, width, height, iteratee) {
  var q2, r2, row, rows, array, column, columns

  array = this._array
  rows = this.dims.rows
  columns = this.dims.columns

  r2 = ((r1 + height) < rows) ? r1 + height : rows
  q2 = ((q1 + width) < columns) ? q1 + width : columns

  for (row = r1; row < r2; row++) {
    for (column = q1; column < q2; column++) {
      array[row][column] = iteratee(array[row][column], column, row, array)
    }
  }
}

Rectangle.prototype.clearRect = function (q, r, width, height) {
  var clear = function () { return null }
  if (q === undefined && r === undefined) {
    this.fillRect(0, 0, this.dims.columns, this.dims.rows, clear)
  } else if (width && height) {
    this.fillRect(q, r, width, height, clear)
  }
}

Rectangle.prototype.clearRow = function (row) {
  this.clearRect(0, row, this.dims.columns, 1)
  return this
}

Rectangle.prototype.clearColumn = function (column) {
  this.clearRect(column, 0, 1, this.dims.rows)
  return this
}

Rectangle.prototype.impose = function (rect, q1, r1) {
  impose(this, rect, q1, r1)
}

module.exports = Rectangle
